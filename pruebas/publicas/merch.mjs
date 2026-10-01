import { pruebasListado } from '../lib.mjs';
const R = '/api/ventas-merch', P = '/api/productos-merch';
const stock = async (api, espera, id) => Number(espera.item(await api.get(`${P}/${id}`)).stock);
export default [
  ...pruebasListado(R),
  { nombre: 'GET /api/productos-merch?artista_id=1 lista el merch de Bomba Estéreo', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${P}?artista_id=1`));
    espera.cierto(b.data.length >= 1 && b.data.every((x) => x.artista_id === 1), 'Todos deben ser del artista 1');
  } },
  { nombre: 'GET /api/productos-merch/2 devuelve precio y stock', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.get(`${P}/2`));
    espera.numero(x.precio, 60000, 'precio'); ctx.stockInicial = Number(x.stock);
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido registra la venta y calcula el total (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 6, producto_id: 2, cantidad: 2 }), 201);
    espera.numero(x.total, 120000, 'total'); ctx.venta = x.id;
  } },
  { nombre: 'Regla: la venta descuenta el stock', prueba: async ({ api, ctx, espera }) =>
    espera.igual(await stock(api, espera, 2), ctx.stockInicial - 2, 'stock del producto 2') },
  { nombre: 'Regla: máximo 5 unidades de un producto por asistente (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, producto_id: 1, cantidad: 2 }), 409) },
  { nombre: 'Regla: no se vende un producto sin stock (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 6, producto_id: 4, cantidad: 1 }), 409) },
  { nombre: 'POST con cantidad 6 responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 7, producto_id: 5, cantidad: 6 }), 400) },
  { nombre: 'DELETE anula la venta y devuelve el stock', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.venta}`), 200);
    espera.error(await api.get(`${R}/${ctx.venta}`), 404);
    espera.igual(await stock(api, espera, 2), ctx.stockInicial, 'stock después de anular');
  } },
];
