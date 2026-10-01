import { pruebasListado } from '../lib.mjs';
const R = '/api/reservas-camping';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?zona_id=2 trae las 2 carpas del Camping VIP', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?zona_id=2`));
    espera.igual(b.pagination.total, 2, 'pagination.total'); espera.cierto(b.data.every((x) => x.zona_id === 2), 'Todas deben ser de la zona 2');
  } },
  { nombre: 'GET /api/reservas-camping/1 devuelve la reserva', prueba: async ({ api, espera }) =>
    espera.igual(espera.item(await api.get(`${R}/1`)).asistente_id, 3, 'asistente_id') },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido crea la reserva (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 7, zona_id: 1, fecha_entrada: '2026-11-20', fecha_salida: '2026-11-22', personas: 3 }), 201);
    espera.igual(x.personas, 3, 'personas'); ctx.reserva = x.id;
  } },
  { nombre: 'Regla: un asistente solo tiene una reserva de camping (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 7, zona_id: 1, fecha_entrada: '2026-11-21', fecha_salida: '2026-11-22', personas: 1 }), 409) },
  { nombre: 'Regla: un menor de edad no puede acampar (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 19, zona_id: 1, fecha_entrada: '2026-11-20', fecha_salida: '2026-11-21', personas: 1 }), 409) },
  { nombre: 'Regla: no se reserva en una zona llena (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 8, zona_id: 2, fecha_entrada: '2026-11-20', fecha_salida: '2026-11-21', personas: 2 }), 409) },
  { nombre: 'POST con fechas invertidas responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 8, zona_id: 1, fecha_entrada: '2026-11-22', fecha_salida: '2026-11-20', personas: 2 }), 400) },
  { nombre: 'GET /api/reservas-camping/zona/2/ocupacion muestra la zona llena', prueba: async ({ api, espera }) => {
    const o = espera.item(await api.get(`${R}/zona/2/ocupacion`));
    espera.numero(o.capacidad, 2, 'capacidad'); espera.numero(o.ocupadas, 2, 'ocupadas'); espera.numero(o.disponibles, 0, 'disponibles');
  } },
  { nombre: 'PATCH cambia el número de personas', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await api.patch(`${R}/${ctx.reserva}`, { personas: 4 })).personas, 4, 'personas') },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.reserva}`), 200);
    espera.error(await api.get(`${R}/${ctx.reserva}`), 404);
  } },
];
