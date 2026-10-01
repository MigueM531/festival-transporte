import { pruebasListado } from '../lib.mjs';
const R = '/api/acreditaciones';
export default [
  ...pruebasListado(R),
  { nombre: 'Filtro ?tipo=FOTOGRAFO', prueba: async ({ api, espera }) => {
    const b = espera.lista(await api.get(`${R}?tipo=FOTOGRAFO&limit=50`));
    espera.cierto(b.data.length >= 5 && b.data.every((x) => x.tipo === 'FOTOGRAFO'), 'Todos deben ser FOTOGRAFO');
  } },
  { nombre: 'GET /api/acreditaciones/1 devuelve la acreditación', prueba: async ({ api, espera }) =>
    espera.igual(espera.item(await api.get(`${R}/1`)).email, 'laura.gomez@elespectador.com', 'email') },
  { nombre: 'POST sin cuerpo responde 400', prueba: async ({ api, espera }) => espera.error(await api.post(R, {}), 400) },
  { nombre: 'POST válido crea la solicitud PENDIENTE (201)', prueba: async ({ api, ctx, espera }) => {
    const x = espera.item(await api.post(R, { nombre: 'Pedro Mora', medio: 'Semana', email: 'pedro.mora@semana.com', tipo: 'PRENSA', dia_id: 2 }), 201);
    espera.igual(x.estado, 'PENDIENTE', 'estado inicial'); ctx.acr = x.id;
  } },
  { nombre: 'Regla: un email no se acredita dos veces el mismo día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { nombre: 'Pedro Mora', medio: 'Semana', email: 'pedro.mora@semana.com', tipo: 'INFLUENCER', dia_id: 2 }), 409) },
  { nombre: 'Regla: máximo 5 fotógrafos por escenario y día (409)', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { nombre: 'Lina Soto', medio: 'Cartel Urbano', email: 'lina.soto@cartelurbano.com', tipo: 'FOTOGRAFO', dia_id: 1, escenario_id: 1 }), 409) },
  { nombre: 'POST de FOTOGRAFO sin escenario responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.post(R, { nombre: 'Lina Soto', medio: 'Cartel Urbano', email: 'lina.soto@cartelurbano.com', tipo: 'FOTOGRAFO', dia_id: 2 }), 400) },
  { nombre: 'Rechazar sin motivo responde 400', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.patch(`${R}/${ctx.acr}/estado`, { estado: 'RECHAZADA' }), 400) },
  { nombre: 'Rechazar con motivo cambia el estado', prueba: async ({ api, ctx, espera }) =>
    espera.igual(espera.item(await api.patch(`${R}/${ctx.acr}/estado`, { estado: 'RECHAZADA', motivo: 'Medio no verificado' })).estado, 'RECHAZADA', 'estado') },
  { nombre: 'Regla: solo se decide una solicitud PENDIENTE (409)', prueba: async ({ api, ctx, espera }) =>
    espera.error(await api.patch(`${R}/${ctx.acr}/estado`, { estado: 'APROBADA' }), 409) },
  { nombre: 'DELETE hace borrado lógico y luego GET responde 404', prueba: async ({ api, ctx, espera }) => {
    espera.status(await api.del(`${R}/${ctx.acr}`), 200);
    espera.error(await api.get(`${R}/${ctx.acr}`), 404);
  } },
];
