import { pruebasListado } from '../lib.mjs';
const R = '/api/objetos-perdidos';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?categoria=ELECTRONICOS', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?categoria=ELECTRONICOS&limit=50`));
    espera.cierto(b.data.length >= 1 && b.data.every((x) => x.categoria === 'ELECTRONICOS'), 'Todos deben ser ELECTRONICOS');
  } },
  { nombre: 'GET /api/objetos-perdidos/1 devuelve el objeto', prueba: async ({ api, espera }) =>
    espera.igual(espera.item(await api.get(`${R}/1`)).estado, 'EN_BODEGA', 'estado') },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido registra el objeto EN_BODEGA (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { descripcion: 'Gafas de sol negras', categoria: 'ACCESORIOS', zona_id: 7, dia_id: 1, voluntario_id: 2 }), 201);
    espera.igual(x.estado, 'EN_BODEGA', 'estado inicial'); ctx.obj = x.id;
  } },
  { nombre: 'Regla: reclamar con un documento que no coincide (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.post(`${R}/${ctx.obj}/reclamar`, { asistente_id: 5, documento: '0000000000' }), 409) },
  { nombre: 'Reclamar con el documento correcto entrega el objeto', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(`${R}/${ctx.obj}/reclamar`, { asistente_id: 5, documento: '1037600105' }));
    espera.igual(x.estado, 'ENTREGADO', 'estado'); espera.igual(x.reclamado_por_asistente_id, 5, 'reclamado_por_asistente_id');
  } },
  { nombre: 'Regla: un objeto entregado no se reclama otra vez (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.post(`${R}/${ctx.obj}/reclamar`, { asistente_id: 6, documento: '1037600106' }), 409) },
  { nombre: 'Regla: un objeto entregado no se elimina (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.del(`${R}/${ctx.obj}`), 409) },
];
