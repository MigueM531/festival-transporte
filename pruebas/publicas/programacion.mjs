import { pruebasListado } from '../lib.mjs';
const R = '/api/shows';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?dia_id=1 solo trae shows del viernes', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?dia_id=1&limit=50`));
    espera.cierto(b.data.length >= 4 && b.data.every((s) => s.dia_id === 1), 'Todos los shows deben tener dia_id 1');
  } },
  { nombre: 'GET /api/shows/1 devuelve el show de Bomba Estéreo', prueba: async ({ api, espera }) => {
    const s = espera.item(await api.get(`${R}/1`));
    espera.igual(s.artista_id, 1, 'artista_id'); espera.igual(s.hora_inicio, '21:00', 'hora_inicio');
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido crea el show (201)', prueba: async ({ api, ctx, espera }) => {
    const s = espera.item(await api.post(R, { artista_id: 11, escenario_id: 4, dia_id: 2, hora_inicio: '14:00', hora_fin: '15:00' }), 201);
    espera.cierto(Number.isInteger(s.id), 'La respuesta debe incluir el id'); espera.igual(s.hora_fin, '15:00', 'hora_fin');
    ctx.show = s.id;
  } },
  { nombre: 'Regla: un escenario no puede tener shows cruzados (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { artista_id: 7, escenario_id: 1, dia_id: 1, hora_inicio: '21:30', hora_fin: '22:00' }), 409) },
  { nombre: 'Regla: un artista no toca dos veces el mismo día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { artista_id: 1, escenario_id: 4, dia_id: 1, hora_inicio: '12:00', hora_fin: '13:00' }), 409) },
  { nombre: 'POST con hora_fin antes de hora_inicio responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { artista_id: 7, escenario_id: 4, dia_id: 3, hora_inicio: '20:00', hora_fin: '19:00' }), 400) },
  { nombre: 'PATCH actualiza la hora de fin', prueba: async ({ api, ctx, espera }) => {
    const s = espera.item(await api.patch(`${R}/${ctx.show}`, { hora_fin: '15:30' }));
    espera.igual(s.hora_fin, '15:30', 'hora_fin');
  } },
  { nombre: 'GET /api/shows/artista/1 lista los shows del artista', prueba: async ({ api, espera }) => {
    const data = espera.arreglo(await api.get(`${R}/artista/1`));
    espera.cierto(data.some((s) => s.id === 1) && data.every((s) => s.artista_id === 1), 'Debe incluir el show 1 y solo shows del artista 1');
  } },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.show}`), 200);
    espera.error(await api.get(`${R}/${ctx.show}`), 404);
  } },
];
