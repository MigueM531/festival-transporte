import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }) as any;

const app = express();
app.use(express.json());

function getDelegate(names: string[]) {
  for (const name of names) {
    if (prisma[name] && typeof prisma[name].findMany === 'function') {
      return prisma[name];
    }
  }
  return null;
}

const db = {
  get reservas() {
    return getDelegate(['reservas_bus', 'reservaBus', 'reservasBus', 'reserva_bus', 'ReservaBus', 'ReservasBus']);
  },
  get buses() {
    return getDelegate(['buses', 'bus', 'Bus', 'Buses']);
  },
  get asistentes() {
    return getDelegate(['asistentes', 'asistente', 'Asistente', 'Asistentes']);
  }
};

const notRemovedCondition = {
  OR: [
    { state: { not: 'REMOVED' } },
    { state: null }
  ]
};

function parsePositiveInt(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function parsePagination(query: any) {
  const pageRaw = query.page !== undefined ? query.page : '1';
  const limitRaw = query.limit !== undefined ? query.limit : '10';

  const page = Number(pageRaw);
  const limit = Number(limitRaw);

  if (!Number.isInteger(page) || page <= 0) return null;
  if (!Number.isInteger(limit) || limit <= 0 || limit > 50) return null;

  return { page, limit };
}

app.get('/api/reservas-bus', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = parsePagination(req.query);
    if (!pagination) return res.status(400).json({ error: 'Parámetros de paginación inválidos' });

    const { page, limit } = pagination;
    const whereClause: any = { AND: [notRemovedCondition] };

    if (req.query.bus_id !== undefined) {
      const busId = parsePositiveInt(req.query.bus_id);
      if (!busId) return res.status(400).json({ error: 'bus_id debe ser entero positivo' });
      whereClause.AND.push({ bus_id: busId });
    }

    if (req.query.asistente_id !== undefined) {
      const asistenteId = parsePositiveInt(req.query.asistente_id);
      if (!asistenteId) return res.status(400).json({ error: 'asistente_id debe ser entero positivo' });
      whereClause.AND.push({ asistente_id: asistenteId });
    }

    const total = await db.reservas.count({ where: whereClause });
    const data = await db.reservas.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json({
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
      data,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/reservas-bus/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const reserva = await db.reservas.findFirst({
      where: { id, ...notRemovedCondition },
    });

    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    return res.status(200).json({ data: reserva });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reservas-bus', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { asistente_id, bus_id } = req.body || {};

    const parsedAsistenteId = parsePositiveInt(asistente_id);
    const parsedBusId = parsePositiveInt(bus_id);

    if (!parsedAsistenteId || !parsedBusId) {
      return res.status(400).json({ error: 'asistente_id y bus_id son requeridos y deben ser enteros positivos' });
    }

    const asistente = await db.asistentes.findFirst({ where: { id: parsedAsistenteId } });
    if (!asistente) return res.status(404).json({ error: 'El asistente no existe' });

    const bus = await db.buses.findFirst({
      where: { id: parsedBusId, ...notRemovedCondition },
    });
    if (!bus) return res.status(404).json({ error: 'El bus no existe' });

    if (bus.estado !== 'PROGRAMADO') {
      return res.status(409).json({ error: 'Solo se puede reservar en buses con estado PROGRAMADO' });
    }

    const reservasActivasCount = await db.reservas.count({
      where: { bus_id: parsedBusId, ...notRemovedCondition },
    });

    if (reservasActivasCount >= bus.capacidad) {
      return res.status(409).json({ error: 'El bus ha alcanzado su capacidad máxima' });
    }

    const reservaPrevia = await db.reservas.findFirst({
      where: {
        asistente_id: parsedAsistenteId,
        bus_id: parsedBusId,
        ...notRemovedCondition,
      },
    });

    if (reservaPrevia) {
      return res.status(409).json({ error: 'El asistente ya tiene una reserva activa en este bus' });
    }

    const nuevaReserva = await db.reservas.create({
      data: {
        asistente_id: parsedAsistenteId,
        bus_id: parsedBusId,
        state: 'ACTIVE',
      },
    });

    return res.status(201).json({ data: nuevaReserva });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/reservas-bus/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const bodyKeys = Object.keys(req.body || {});
    const invalidKeys = bodyKeys.filter((key) => key !== 'bus_id');
    if (invalidKeys.length > 0 || !bodyKeys.includes('bus_id')) {
      return res.status(400).json({ error: 'Solo el campo bus_id es editable' });
    }

    const newBusId = parsePositiveInt(req.body.bus_id);
    if (!newBusId) return res.status(400).json({ error: 'bus_id debe ser un entero positivo' });

    const reserva = await db.reservas.findFirst({
      where: { id, ...notRemovedCondition },
    });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    const bus = await db.buses.findFirst({
      where: { id: newBusId, ...notRemovedCondition },
    });
    if (!bus) return res.status(404).json({ error: 'El bus no existe' });

    if (bus.estado !== 'PROGRAMADO') {
      return res.status(409).json({ error: 'El nuevo bus no está PROGRAMADO' });
    }

    const reservasActivasCount = await db.reservas.count({
      where: { bus_id: newBusId, ...notRemovedCondition },
    });

    if (reservasActivasCount >= bus.capacidad) {
      return res.status(409).json({ error: 'El nuevo bus ya está lleno' });
    }

    const reservaActualizada = await db.reservas.update({
      where: { id },
      data: { bus_id: newBusId },
    });

    return res.status(200).json({ data: reservaActualizada });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/reservas-bus/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const reserva = await db.reservas.findFirst({
      where: { id, ...notRemovedCondition },
    });
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    await db.reservas.update({
      where: { id },
      data: { state: 'REMOVED' },
    });

    return res.status(200).json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/buses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = parsePagination(req.query);
    if (!pagination) return res.status(400).json({ error: 'Parámetros de paginación inválidos' });

    const { page, limit } = pagination;
    const whereClause: any = { AND: [notRemovedCondition] };

    if (req.query.dia_id !== undefined) {
      const diaId = parsePositiveInt(req.query.dia_id);
      if (!diaId) return res.status(400).json({ error: 'dia_id debe ser un entero positivo' });
      whereClause.AND.push({ dia_id: diaId });
    }

    if (req.query.estado !== undefined) {
      whereClause.AND.push({ estado: String(req.query.estado) });
    }

    const total = await db.buses.count({ where: whereClause });
    const data = await db.buses.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return res.status(200).json({
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit) || 0,
      },
      data,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/buses/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const bus = await db.buses.findFirst({
      where: { id, ...notRemovedCondition },
    });
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });

    return res.status(200).json({ data: bus });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/buses/:id/estado', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const { estado } = req.body || {};
    const ESTADOS_VALIDOS = ['PROGRAMADO', 'SALIO', 'CANCELADO'];
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido o no enviado' });
    }

    const bus = await db.buses.findFirst({
      where: { id, ...notRemovedCondition },
    });
    if (!bus) return res.status(404).json({ error: 'Bus no encontrado' });

    if (bus.estado !== 'PROGRAMADO') {
      return res.status(409).json({ error: `Transición no permitida desde ${bus.estado}` });
    }

    const busActualizado = await db.buses.update({
      where: { id },
      data: { estado },
    });

    return res.status(200).json({ data: busActualizado });
  } catch (error) {
    next(error);
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  return res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));

export default app;