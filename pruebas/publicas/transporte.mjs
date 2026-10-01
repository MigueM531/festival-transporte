import { pruebasListado } from '../lib.mjs';
const R = '/api/reservas-bus', B = '/api/buses';
export default [
  ...pruebasListado(R),
  { nombre: 'GET /api/buses?dia_id=1 lista los buses del viernes', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${B}?dia_id=1`));
    espera.cierto(b.data.length >= 4 && b.data.every((x) => x.dia_id === 1), 'Todos deben ser del día 1');
  } },
  { nombre: 'GET /api/buses/2 devuelve el bus', prueba: async ({ api, espera }) =>
    espera.numero(espera.item(await api.get(`${B}/2`)).capacidad, 2, 'capacidad') },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido reserva un puesto (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 5, bus_id: 1 }), 201);
    espera.igual(x.bus_id, 1, 'bus_id'); ctx.reserva = x.id;
  } },
  { nombre: 'Regla: un asistente no reserva dos veces el mismo bus (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, bus_id: 1 }), 409) },
  { nombre: 'Regla: no se reserva en un bus lleno (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, bus_id: 2 }), 409) },
  { nombre: 'Regla: no se reserva en un bus que ya salió (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, bus_id: 3 }), 409) },
  { nombre: 'Regla: un bus que ya salió no vuelve a PROGRAMADO (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.patch(`${B}/3/estado`, { estado: 'PROGRAMADO' }), 409) },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.reserva}`), 200);
    espera.error(await api.get(`${R}/${ctx.reserva}`), 404);
  } },
];
