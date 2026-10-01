// Utilidades compartidas por las pruebas de la maratón. No requiere dependencias (Node 18+).

export class FalloPrueba extends Error {}

export function crearApi(baseUrl) {
  const base = baseUrl.replace(/\/$/, '');
  const pedir = async (metodo, ruta, cuerpo) => {
    const opciones = { method: metodo, headers: {}, signal: AbortSignal.timeout(8000) };
    if (cuerpo !== undefined) {
      opciones.headers['Content-Type'] = 'application/json';
      opciones.body = JSON.stringify(cuerpo);
    }
    let res;
    try {
      res = await fetch(base + ruta, opciones);
    } catch (e) {
      throw new FalloPrueba(`${metodo} ${ruta} → no hubo respuesta (${e.name === 'TimeoutError' ? 'tiempo agotado' : 'servidor apagado o ruta inválida'})`);
    }
    const texto = await res.text();
    let body = null;
    try { body = texto ? JSON.parse(texto) : null; } catch { body = texto; }
    return { status: res.status, body, metodo, ruta };
  };
  return {
    get: (ruta) => pedir('GET', ruta),
    post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
    patch: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo),
    del: (ruta) => pedir('DELETE', ruta),
  };
}

const resumen = (res) => {
  const b = typeof res.body === 'string' ? res.body.slice(0, 120) : JSON.stringify(res.body)?.slice(0, 160);
  return `${res.metodo} ${res.ruta} respondió ${res.status} ${b ?? ''}`;
};

export const espera = {
  cierto(condicion, mensaje) {
    if (!condicion) throw new FalloPrueba(mensaje);
  },
  igual(actual, esperado, mensaje) {
    if (actual !== esperado) throw new FalloPrueba(`${mensaje}: se esperaba ${JSON.stringify(esperado)} y llegó ${JSON.stringify(actual)}`);
  },
  numero(actual, esperado, mensaje) {
    if (Number(actual) !== esperado) throw new FalloPrueba(`${mensaje}: se esperaba ${esperado} y llegó ${JSON.stringify(actual)}`);
  },
  status(res, codigo) {
    if (res.status !== codigo) throw new FalloPrueba(`Se esperaba ${codigo}. ${resumen(res)}`);
  },
  // Error con código y cuerpo { error: "mensaje" }
  error(res, codigo) {
    espera.status(res, codigo);
    if (!res.body || typeof res.body.error !== 'string' || res.body.error.length === 0) {
      throw new FalloPrueba(`El ${codigo} debe responder { "error": "mensaje" }. ${resumen(res)}`);
    }
  },
  // Respuesta { data: {...} } con id
  item(res, codigo = 200) {
    espera.status(res, codigo);
    if (!res.body || typeof res.body.data !== 'object' || res.body.data === null || Array.isArray(res.body.data)) {
      throw new FalloPrueba(`La respuesta debe tener la forma { "data": { ... } }. ${resumen(res)}`);
    }
    return res.body.data;
  },
  // Respuesta paginada { pagination: {...}, data: [...] }
  lista(res, limite) {
    espera.status(res, 200);
    const b = res.body;
    if (!b || !Array.isArray(b.data) || typeof b.pagination !== 'object' || b.pagination === null) {
      throw new FalloPrueba(`La respuesta debe tener la forma { "pagination": {...}, "data": [...] }. ${resumen(res)}`);
    }
    const p = b.pagination;
    for (const campo of ['total', 'currentPage', 'limit', 'totalPages']) {
      if (typeof p[campo] !== 'number') throw new FalloPrueba(`pagination.${campo} debe ser un número. ${resumen(res)}`);
    }
    const paginasEsperadas = Math.ceil(p.total / p.limit);
    if (p.totalPages !== paginasEsperadas) throw new FalloPrueba(`pagination.totalPages debe ser ceil(total / limit) = ${paginasEsperadas} y llegó ${p.totalPages}`);
    if (limite !== undefined) {
      if (p.limit !== limite) throw new FalloPrueba(`pagination.limit debe ser ${limite} y llegó ${p.limit}`);
      if (b.data.length > limite) throw new FalloPrueba(`Se pidió limit=${limite} y llegaron ${b.data.length} registros`);
    }
    return b;
  },
  // Respuesta { data: [...] } sin paginación
  arreglo(res) {
    espera.status(res, 200);
    if (!res.body || !Array.isArray(res.body.data)) throw new FalloPrueba(`La respuesta debe tener la forma { "data": [ ... ] }. ${resumen(res)}`);
    return res.body.data;
  },
};

// Pruebas genéricas de listado que aplican a cualquier recurso paginado.
export function pruebasListado(ruta, { publicas = true } = {}) {
  if (publicas) {
    return [
      {
        nombre: `GET ${ruta}?page=1&limit=2 responde paginado`,
        prueba: async ({ api }) => {
          const b = espera.lista(await api.get(`${ruta}?page=1&limit=2`), 2);
          espera.igual(b.pagination.currentPage, 1, 'pagination.currentPage');
          espera.cierto(b.data.length > 0, 'El listado no debería venir vacío: hay datos precargados');
          espera.cierto(b.data.every((x) => x.state === undefined || x.state === 'ACTIVE'), 'El listado no debe incluir registros con state REMOVED');
        },
      },
      {
        nombre: `GET ${ruta} sin parámetros usa page=1 y limit=10`,
        prueba: async ({ api }) => {
          const b = espera.lista(await api.get(ruta), 10);
          espera.igual(b.pagination.currentPage, 1, 'pagination.currentPage por defecto');
        },
      },
      {
        nombre: `GET ${ruta}/abc responde 400 (id inválido)`,
        prueba: async ({ api }) => espera.error(await api.get(`${ruta}/abc`), 400),
      },
      {
        nombre: `GET ${ruta}/999999 responde 404`,
        prueba: async ({ api }) => espera.error(await api.get(`${ruta}/999999`), 404),
      },
    ];
  }
  return [
    { nombre: `GET ${ruta}?limit=0 responde 400`, prueba: async ({ api }) => espera.error(await api.get(`${ruta}?limit=0`), 400) },
    { nombre: `GET ${ruta}?limit=51 responde 400 (máximo 50)`, prueba: async ({ api }) => espera.error(await api.get(`${ruta}?limit=51`), 400) },
    { nombre: `GET ${ruta}?page=-1 responde 400`, prueba: async ({ api }) => espera.error(await api.get(`${ruta}?page=-1`), 400) },
    { nombre: `GET ${ruta}?limit=abc responde 400`, prueba: async ({ api }) => espera.error(await api.get(`${ruta}?limit=abc`), 400) },
    {
      nombre: `GET ${ruta}?page=2&limit=1 devuelve la segunda página`,
      prueba: async ({ api }) => {
        const b = espera.lista(await api.get(`${ruta}?page=2&limit=1`), 1);
        espera.igual(b.pagination.currentPage, 2, 'pagination.currentPage');
      },
    },
    { nombre: `PATCH ${ruta}/999999 responde 404`, prueba: async ({ api }) => espera.error(await api.patch(`${ruta}/999999`, {}), 404) },
    { nombre: `DELETE ${ruta}/999999 responde 404`, prueba: async ({ api }) => espera.error(await api.del(`${ruta}/999999`), 404) },
  ];
}
