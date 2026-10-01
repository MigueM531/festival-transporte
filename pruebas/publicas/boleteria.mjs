import { pruebasListado } from '../lib.mjs';
const R = '/api/boletas';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?dia_id=4 trae las 3 boletas del Pre-party', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?dia_id=4&limit=50`));
    espera.igual(b.pagination.total, 3, 'pagination.total'); espera.cierto(b.data.every((x) => x.dia_id === 4), 'Todas deben ser del día 4');
  } },
  { nombre: 'GET /api/boletas/1 devuelve la boleta con su precio', prueba: async ({ api, espera }) => {
    const x = espera.item(await api.get(`${R}/1`));
    espera.igual(x.tipo, 'GENERAL', 'tipo'); espera.numero(x.precio, 250000, 'precio');
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido vende la boleta y calcula el precio (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 14, dia_id: 1, tipo: 'GENERAL' }), 201);
    espera.numero(x.precio, 250000, 'precio de GENERAL'); ctx.boleta = x.id;
  } },
  { nombre: 'Regla: un asistente no compra dos boletas del mismo día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 14, dia_id: 1, tipo: 'VIP' }), 409) },
  { nombre: 'Regla: no se vende por encima del aforo del día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 15, dia_id: 4, tipo: 'VIP' }), 409) },
  { nombre: 'POST con tipo inválido responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 15, dia_id: 1, tipo: 'GOLD' }), 400) },
  { nombre: 'GET /api/boletas/dia/4/disponibilidad muestra el aforo lleno', prueba: async ({ api, espera }) => {
    const d = espera.item(await api.get(`${R}/dia/4/disponibilidad`));
    espera.numero(d.aforo, 3, 'aforo'); espera.numero(d.vendidas, 3, 'vendidas'); espera.numero(d.disponibles, 0, 'disponibles');
  } },
  { nombre: 'PATCH cambia a VIP y recalcula el precio', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.patch(`${R}/${ctx.boleta}`, { tipo: 'VIP' }));
    espera.igual(x.tipo, 'VIP', 'tipo'); espera.numero(x.precio, 480000, 'precio de VIP');
  } },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.boleta}`), 200);
    espera.error(await api.get(`${R}/${ctx.boleta}`), 404);
  } },
];
