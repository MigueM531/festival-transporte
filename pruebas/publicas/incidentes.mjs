import { pruebasListado } from '../lib.mjs';
const R = '/api/incidentes';
const estado = (api, id, e) => api.patch(`${R}/${id}/estado`, { estado: e });
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?estado=ABIERTO solo trae incidentes abiertos', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?estado=ABIERTO&limit=50`));
    espera.cierto(b.data.length >= 1 && b.data.every((x) => x.estado === 'ABIERTO'), 'Todos deben estar ABIERTO');
  } },
  { nombre: 'GET /api/incidentes/2 devuelve el incidente', prueba: async ({ api, espera }) =>
    espera.igual(espera.item(await api.get(`${R}/2`)).estado, 'EN_ATENCION', 'estado') },
  { nombre: 'GET /api/incidentes/resumen?dia_id=1 cuenta por estado', prueba: async ({ api, espera }) => {
    const r = espera.item(await api.get(`${R}/resumen?dia_id=1`));
    espera.numero(r.ABIERTO, 1, 'ABIERTO'); espera.numero(r.EN_ATENCION, 1, 'EN_ATENCION'); espera.numero(r.CERRADO, 0, 'CERRADO');
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido registra el incidente ABIERTO (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { zona_id: 7, dia_id: 3, severidad: 'LEVE', descripcion: 'Golpe de calor en la fila del baño' }), 201);
    espera.igual(x.estado, 'ABIERTO', 'estado inicial'); ctx.inc = x.id;
  } },
  { nombre: 'Regla: no se salta de ABIERTO a CERRADO (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await estado(api, ctx.inc, 'CERRADO'), 409) },
  { nombre: 'Transición ABIERTO → EN_ATENCION', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await estado(api, ctx.inc, 'EN_ATENCION')).estado, 'EN_ATENCION', 'estado') },
  { nombre: 'Regla: no se devuelve a ABIERTO (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await estado(api, ctx.inc, 'ABIERTO'), 409) },
  { nombre: 'Transición EN_ATENCION → CERRADO', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await estado(api, ctx.inc, 'CERRADO')).estado, 'CERRADO', 'estado') },
  { nombre: 'Regla: un incidente CERRADO no se edita (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.patch(`${R}/${ctx.inc}`, { descripcion: 'Intento de editar un cierre' }), 409) },
];
