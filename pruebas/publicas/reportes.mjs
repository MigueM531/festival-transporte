// Reportes es de solo lectura. Estas pruebas verifican forma y coherencia; los valores
// exactos cambian durante la maratón porque los demás equipos agregan datos.
const R = '/api/reportes';
const desc = (arr, campo) => arr.every((x, i) => i === 0 || Number(arr[i - 1][campo]) >= Number(x[campo]));
export default [
  { nombre: 'GET /api/reportes/ventas-por-dia trae los 4 días ordenados por fecha', prueba: async ({ api, espera }) => {
    const d = espera.arreglo(await api.get(`${R}/ventas-por-dia`));
    espera.igual(d.length, 4, 'cantidad de días'); espera.igual(d[0].dia_id, 4, 'el primer día es el Pre-party (19 nov)');
    espera.cierto(d.every((x) => typeof x.nombre === 'string' && typeof x.boletas === 'number' && typeof x.ingresos === 'number'), 'Cada día necesita nombre, boletas e ingresos numéricos');
  } },
  { nombre: 'GET /api/reportes/top-artistas?limit=3 ordena por promedio', prueba: async ({ api, espera }) => {
    const d = espera.arreglo(await api.get(`${R}/top-artistas?limit=3`));
    espera.cierto(d.length > 0 && d.length <= 3, 'Máximo 3 artistas');
    espera.cierto(d.every((x) => typeof x.nombre === 'string' && typeof x.promedio === 'number' && typeof x.resenas === 'number'), 'Cada artista necesita nombre, promedio y resenas numéricos');
    espera.cierto(desc(d, 'promedio'), 'Deben venir ordenados de mayor a menor promedio');
  } },
  { nombre: 'GET /api/reportes/top-artistas?limit=0 responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.get(`${R}/top-artistas?limit=0`), 400) },
  { nombre: 'GET /api/reportes/ocupacion/4 muestra el Pre-party al 100 %', prueba: async ({ api, espera }) => {
    const o = espera.item(await api.get(`${R}/ocupacion/4`));
    espera.numero(o.aforo, 3, 'aforo'); espera.numero(o.vendidas, 3, 'vendidas'); espera.numero(o.porcentaje, 100, 'porcentaje');
  } },
  { nombre: 'GET /api/reportes/ocupacion/abc responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.get(`${R}/ocupacion/abc`), 400) },
  { nombre: 'GET /api/reportes/ocupacion/999 responde 404', prueba: async ({ api, espera }) =>
    espera.error(await api.get(`${R}/ocupacion/999`), 404) },
  { nombre: 'GET /api/reportes/escenarios/1/agenda?dia_id=1 incluye a Bomba Estéreo', prueba: async ({ api, espera }) => {
    const d = espera.arreglo(await api.get(`${R}/escenarios/1/agenda?dia_id=1`));
    espera.cierto(d.some((x) => x.show_id === 1 && x.artista === 'Bomba Estéreo'), 'Debe incluir el show 1 con el nombre del artista');
    espera.cierto(d.every((x, i) => i === 0 || d[i - 1].hora_inicio <= x.hora_inicio), 'Debe venir ordenada por hora_inicio');
  } },
  { nombre: 'GET /api/reportes/escenarios/1/agenda sin dia_id responde 400', prueba: async ({ api, espera }) =>
    espera.error(await api.get(`${R}/escenarios/1/agenda`), 400) },
  { nombre: 'GET /api/reportes/comida/top-productos ordena por unidades vendidas', prueba: async ({ api, espera }) => {
    const d = espera.arreglo(await api.get(`${R}/comida/top-productos`));
    espera.cierto(d.length >= 1 && d.every((x) => typeof x.unidades === 'number' && typeof x.ingresos === 'number'), 'Cada producto necesita unidades e ingresos numéricos');
    espera.cierto(desc(d, 'unidades'), 'Deben venir ordenados de mayor a menor unidades');
  } },
];
