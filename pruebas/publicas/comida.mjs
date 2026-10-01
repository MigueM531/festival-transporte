import { pruebasListado } from '../lib.mjs';
const R = '/api/pedidos-comida', P = '/api/productos-comida';
const stock = async (api, espera, id) => Number(espera.item(await api.get(`${P}/${id}`)).stock);
export default [
  ...pruebasListado(R),
  { nombre: 'GET /api/productos-comida?zona_id=6 lista los productos de Food Trucks', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${P}?zona_id=6`));
    espera.cierto(b.data.length >= 3 && b.data.every((x) => x.zona_id === 6), 'Todos los productos deben ser de la zona 6');
  } },
  { nombre: 'GET /api/productos-comida/2 devuelve precio y stock', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.get(`${P}/2`));
    espera.numero(x.precio, 28000, 'precio'); ctx.stockInicial = Number(x.stock);
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido crea el pedido y calcula el total (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 5, producto_id: 2, cantidad: 2 }), 201);
    espera.numero(x.total, 56000, 'total'); espera.igual(x.estado, 'PENDIENTE', 'estado'); ctx.pedido = x.id;
  } },
  { nombre: 'Regla: crear el pedido descuenta el stock', prueba: async ({ api, ctx, espera }) =>
    espera.igual(await stock(api, espera, 2), ctx.stockInicial - 2, 'stock del producto 2') },
  { nombre: 'Regla: no se pide un producto sin stock suficiente (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, producto_id: 5, cantidad: 1 }), 409) },
  { nombre: 'POST con cantidad 0 responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { asistente_id: 5, producto_id: 1, cantidad: 0 }), 400) },
  { nombre: 'DELETE cancela el pedido y devuelve el stock', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.pedido}`), 200);
    espera.error(await api.get(`${R}/${ctx.pedido}`), 404);
    espera.igual(await stock(api, espera, 2), ctx.stockInicial, 'stock del producto 2 después de cancelar');
  } },
  { nombre: 'PATCH marca un pedido como ENTREGADO', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 6, producto_id: 4, cantidad: 1 }), 201);
    ctx.entregado = x.id;
    espera.igual(espera.item(await api.patch(`${R}/${x.id}`, { estado: 'ENTREGADO' })).estado, 'ENTREGADO', 'estado');
  } },
  { nombre: 'PATCH con un estado inválido responde 400', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.patch(`${R}/${ctx.entregado}`, { estado: 'COCINANDO' }), 400) },
  { nombre: 'Filtro ?estado=PENDIENTE solo trae pedidos pendientes', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?estado=PENDIENTE&limit=50`));
    espera.cierto(b.data.length >= 1 && b.data.every((x) => x.estado === 'PENDIENTE'), 'Todos deben estar PENDIENTE');
  } },
];
