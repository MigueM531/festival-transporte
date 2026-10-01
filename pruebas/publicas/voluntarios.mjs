import { pruebasListado } from '../lib.mjs';
const R = '/api/turnos';
const horas = async (api, espera, v, d) => Number(espera.item(await api.get(`${R}/voluntario/${v}/horas?dia_id=${d}`)).horas);
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?voluntario_id=1 solo trae sus turnos', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?voluntario_id=1&limit=50`));
    espera.cierto(b.data.length >= 2 && b.data.every((x) => x.voluntario_id === 1), 'Todos deben ser del voluntario 1');
  } },
  { nombre: 'GET /api/turnos/1 devuelve el turno', prueba: async ({ api, espera }) => {
    const x = espera.item(await api.get(`${R}/1`));
    espera.igual(x.hora_inicio, '10:00', 'hora_inicio'); espera.igual(x.rol, 'LOGISTICA', 'rol');
  } },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'GET /api/turnos/voluntario/1/horas?dia_id=1 suma 7 horas', prueba: async ({ api, espera }) =>
    espera.igual(await horas(api, espera, 1, 1), 7, 'horas del voluntario 1 el viernes') },
  { nombre: 'Regla: un voluntario no trabaja más de 8 horas al día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { voluntario_id: 1, zona_id: 7, dia_id: 1, hora_inicio: '19:00', hora_fin: '21:00', rol: 'LOGISTICA' }), 409) },
  { nombre: 'POST válido completa exactamente 8 horas (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { voluntario_id: 1, zona_id: 7, dia_id: 1, hora_inicio: '19:00', hora_fin: '20:00', rol: 'LOGISTICA' }), 201);
    ctx.turno = x.id; espera.igual(await horas(api, espera, 1, 1), 8, 'horas después del nuevo turno');
  } },
  { nombre: 'Regla: un voluntario no tiene turnos cruzados (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { voluntario_id: 2, zona_id: 8, dia_id: 1, hora_inicio: '15:00', hora_fin: '17:00', rol: 'ASEO' }), 409) },
  { nombre: 'POST con rol inválido responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { voluntario_id: 5, zona_id: 7, dia_id: 2, hora_inicio: '10:00', hora_fin: '11:00', rol: 'DJ' }), 400) },
  { nombre: 'PATCH cambia el rol', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await api.patch(`${R}/${ctx.turno}`, { rol: 'ASEO' })).rol, 'ASEO', 'rol') },
  { nombre: 'DELETE hace borrado lógico y las horas vuelven a 7', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.turno}`), 200);
    espera.error(await api.get(`${R}/${ctx.turno}`), 404);
    espera.igual(await horas(api, espera, 1, 1), 7, 'horas después de borrar');
  } },
];
