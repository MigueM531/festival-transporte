import { pruebasListado } from '../lib.mjs';
const R = '/api/movimientos';
const saldo = async (api, espera, a) => Number(espera.item(await api.get(`/api/billeteras/${a}/saldo`)).saldo);
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?asistente_id=1 solo trae sus movimientos', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?asistente_id=1&limit=50`));
    espera.cierto(b.data.length >= 2 && b.data.every((x) => x.asistente_id === 1), 'Todos deben ser del asistente 1');
  } },
  { nombre: 'GET /api/billeteras/1/saldo calcula 150000', prueba: async ({ api, espera }) =>
    espera.igual(await saldo(api, espera, 1), 150000, 'saldo del asistente 1') },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST RECARGA válida (201) aumenta el saldo', prueba: async ({ api, ctx, espera }) => {
    ctx.saldoInicial = await saldo(api, espera, 2);
    const x = espera.item(await api.post(R, { asistente_id: 2, tipo: 'RECARGA', monto: 50000, descripcion: 'Prueba recarga' }), 201);
    ctx.recarga = x.id;
    espera.igual(await saldo(api, espera, 2), ctx.saldoInicial + 50000, 'saldo después de recargar');
  } },
  { nombre: 'POST CONSUMO válido (201) descuenta el saldo', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { asistente_id: 2, tipo: 'CONSUMO', monto: 30000 }), 201);
    ctx.consumo = x.id;
    espera.igual(await saldo(api, espera, 2), ctx.saldoInicial + 20000, 'saldo después de consumir');
  } },
  { nombre: 'Regla: un consumo no puede dejar el saldo negativo (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.post(R, { asistente_id: 2, tipo: 'CONSUMO', monto: ctx.saldoInicial + 30000 }), 409) },
  { nombre: 'Regla: no se anula una recarga si el saldo quedaría negativo (409)', prueba: async ({ api, ctx, espera }) => {
    if (ctx.saldoInicial >= 30000) return; // solo aplica si el asistente 2 empezó con saldo bajo
    espera.error(await api.del(`${R}/${ctx.recarga}`), 409);
  } },
  { nombre: 'DELETE anula el consumo y luego la recarga', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.consumo}`), 200);
    espera.status(await api.del(`${R}/${ctx.recarga}`), 200);
    espera.error(await api.get(`${R}/${ctx.recarga}`), 404);
    espera.igual(await saldo(api, espera, 2), ctx.saldoInicial, 'saldo al final');
  } },
];
