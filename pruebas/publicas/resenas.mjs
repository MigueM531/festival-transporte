import { pruebasListado } from '../lib.mjs';
const R = '/api/resenas';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?show_id=1 solo trae reseñas de ese show', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?show_id=1&limit=50`));
    espera.cierto(b.data.length >= 3 && b.data.every((x) => x.show_id === 1), 'Todas deben ser del show 1');
  } },
  { nombre: 'GET /api/resenas/1 devuelve la reseña', prueba: async ({ api, espera }) =>
    espera.igual(espera.item(await api.get(`${R}/1`)).puntaje, 5, 'puntaje') },
  { nombre: 'GET /api/resenas/show/1/promedio calcula 4.67 con 3 reseñas', prueba: async ({ api, espera }) => {
    const p = espera.item(await api.get(`${R}/show/1/promedio`));
    espera.numero(p.promedio, 4.67, 'promedio (2 decimales)'); espera.numero(p.total, 3, 'total');
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido crea la reseña (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 5, show_id: 1, puntaje: 4, comentario: 'Buen cierre de viernes' }), 201);
    espera.igual(x.puntaje, 4, 'puntaje'); ctx.resena = x.id;
  } },
  { nombre: 'Regla: una sola reseña por asistente y show (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, show_id: 1, puntaje: 5 }), 409) },
  { nombre: 'Regla: solo reseña quien tiene boleta del día del show (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 16, show_id: 1, puntaje: 5 }), 409) },
  { nombre: 'POST con puntaje 6 responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 7, show_id: 1, puntaje: 6 }), 400) },
  { nombre: 'PATCH cambia el puntaje', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await api.patch(`${R}/${ctx.resena}`, { puntaje: 5 })).puntaje, 5, 'puntaje') },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.resena}`), 200);
    espera.error(await api.get(`${R}/${ctx.resena}`), 404);
  } },
];
