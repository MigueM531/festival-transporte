import { pruebasListado } from '../lib.mjs';
const R = '/api/reservas-parqueadero';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?dia_id=1&zona_id=4 trae la única reserva de motos', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?dia_id=1&zona_id=4`));
    espera.igual(b.pagination.total, 1, 'pagination.total'); espera.igual(b.data[0]?.zona_id, 4, 'zona_id');
  } },
  { nombre: 'GET /api/reservas-parqueadero/2 devuelve la reserva', prueba: async ({ api, espera }) =>
    espera.igual(espera.item(await api.get(`${R}/2`)).placa, 'KJH345', 'placa') },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido crea la reserva (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 5, zona_id: 3, dia_id: 1, placa: 'XYZ123', tipo_vehiculo: 'CARRO' }), 201);
    espera.igual(x.placa, 'XYZ123', 'placa'); ctx.reserva = x.id;
  } },
  { nombre: 'Regla: una placa solo se reserva una vez por día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 6, zona_id: 3, dia_id: 1, placa: 'XYZ123', tipo_vehiculo: 'CARRO' }), 409) },
  { nombre: 'Regla: no se reserva en una zona sin cupo ese día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 7, zona_id: 4, dia_id: 1, placa: 'QWE45R', tipo_vehiculo: 'MOTO' }), 409) },
  { nombre: 'POST con placa mal formada responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 7, zona_id: 3, dia_id: 2, placa: 'ABC-123', tipo_vehiculo: 'CARRO' }), 400) },
  { nombre: 'GET /api/reservas-parqueadero/placa/KJH345 lista las reservas de esa placa', prueba: async ({ api, espera }) => {
    const data = espera.arreglo(await api.get(`${R}/placa/KJH345`));
    espera.cierto(data.length >= 1 && data.every((x) => x.placa === 'KJH345'), 'Todas deben tener la placa KJH345');
  } },
  { nombre: 'PATCH mueve la reserva al sábado', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await api.patch(`${R}/${ctx.reserva}`, { dia_id: 2 })).dia_id, 2, 'dia_id') },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.reserva}`), 200);
    espera.error(await api.get(`${R}/${ctx.reserva}`), 404);
  } },
];
