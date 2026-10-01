import { pruebasListado } from '../lib.mjs';
const R = '/api/inscripciones-meet';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?show_id=5 trae las 3 inscripciones del show de Morat', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?show_id=5`));
    espera.igual(b.pagination.total, 3, 'pagination.total'); espera.cierto(b.data.every((x) => x.show_id === 5), 'Todas deben ser del show 5');
  } },
  { nombre: 'GET /api/inscripciones-meet/1 devuelve la inscripción', prueba: async ({ api, espera }) => {
    const x = espera.item(await api.get(`${R}/1`));
    espera.igual(x.asistente_id, 1, 'asistente_id'); espera.igual(x.show_id, 5, 'show_id');
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido inscribe a un asistente VIP (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 6, show_id: 1 }), 201);
    espera.igual(x.show_id, 1, 'show_id'); ctx.ins = x.id;
  } },
  { nombre: 'Regla: una inscripción por asistente y show (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 6, show_id: 1 }), 409) },
  { nombre: 'Regla: se necesita boleta VIP o PLATINO del día del show (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 2, show_id: 1 }), 409) },
  { nombre: 'Regla: máximo 3 inscritos por show (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 18, show_id: 5 }), 409) },
  { nombre: 'GET /api/inscripciones-meet/show/5 muestra el cupo lleno', prueba: async ({ api, espera }) => {
    const x = espera.item(await api.get(`${R}/show/5`));
    espera.numero(x.cupo, 3, 'cupo'); espera.numero(x.ocupados, 3, 'ocupados'); espera.numero(x.disponibles, 0, 'disponibles');
    espera.cierto(Array.isArray(x.inscritos) && x.inscritos.length === 3 && x.inscritos.every((i) => typeof i.nombre === 'string'), 'inscritos debe ser un arreglo de 3 con el nombre de cada asistente');
  } },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.ins}`), 200);
    espera.error(await api.get(`${R}/${ctx.ins}`), 404);
  } },
];
