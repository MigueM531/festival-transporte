# Convenciones comunes a todos los módulos

Las pruebas oficiales verifican exactamente lo que dice este documento. Si tu API responde algo distinto, la prueba falla aunque "funcione".

## 1. Arranque

- `npm run dev` levanta la API en el puerto de la variable de entorno **`PORT`** (por defecto `3000`).
- La conexión a la base viene de **`DATABASE_URL`** en el `.env`.
- Todas las rutas empiezan con **`/api`**.

## 2. Forma de las respuestas

| Caso | Código | Cuerpo |
|---|---|---|
| Listado | `200` | `{ "pagination": { "total", "currentPage", "limit", "totalPages" }, "data": [ ... ] }` |
| Un registro (GET por id, PATCH) | `200` | `{ "data": { ... } }` |
| Creación | `201` | `{ "data": { ... } }` con el registro creado, **incluido su `id`** |
| Borrado | `200` | cualquier JSON, por ejemplo `{ "message": "..." }` |
| Endpoints especiales sin paginar | `200` | `{ "data": [ ... ] }` o `{ "data": { ... } }` según el contrato |
| Cualquier error | `4xx` / `500` | `{ "error": "mensaje descriptivo" }` |

- Los campos del JSON se llaman **igual que las columnas** de la base (`asistente_id`, `hora_inicio`), tal como los genera `prisma db pull`.
- Nunca se responde el stack trace.

## 3. Paginación

- Parámetros opcionales `page` y `limit`. Por defecto `page=1`, `limit=10`.
- Ambos deben ser **enteros positivos**; `limit` máximo **50**. `limit=0`, `page=-1`, `limit=abc` o `limit=51` → **400**.
- `totalPages = ceil(total / limit)`.
- El listado se ordena por `id` ascendente y **excluye** los registros con `state = 'REMOVED'`.
- Los filtros numéricos (`?dia_id=`) que no sean número → **400**.

## 4. Ids y existencia

- Un `:id` que no es entero positivo (`/api/boletas/abc`) → **400**.
- Un id que no existe, o que existe con `state = 'REMOVED'` → **404** (en GET, PATCH y DELETE).
- Borrar dos veces el mismo registro: la segunda vez → **404**.

## 5. Orden de las validaciones

Cuando una petición tiene varios problemas, se responde el **primero** de esta lista:

1. **400** — faltan campos, tipos incorrectos, formatos inválidos, valores fuera de rango o de la lista permitida.
2. **404** — algún id referenciado no existe (asistente, show, zona…).
3. **400** — un dato existe pero no sirve para este módulo (por ejemplo, una zona que no es de parqueadero).
4. **409** — se viola una regla de negocio.

## 6. Formatos

| Dato | Formato | Ejemplo |
|---|---|---|
| Hora | `HH:MM`, 24 horas, con cero inicial | `09:00`, `21:30` |
| Fecha | `YYYY-MM-DD` | `2026-11-20` |
| Dinero | entero en pesos, sin decimales | `250000` |
| Enteros | número JSON entero, no texto | `"dia_id": 1`, no `"dia_id": "1"` |

## 7. Crear, editar y borrar

- **POST:** los campos calculados (`precio`, `total`, `estado` inicial) los pone el servidor; si el cliente los envía, se ignoran.
- **PATCH:** solo acepta los campos marcados como *editables* en tu contrato. Un campo que no se puede editar → **400**. Las reglas de negocio se vuelven a verificar con los datos combinados.
- **DELETE:** es **borrado lógico**: se cambia `state` a `'REMOVED'`, no se borra la fila.

## 8. La base de datos es compartida

- Todos los equipos de los dos cursos usan **la misma base**. Nadie crea tablas.
- **Nunca ejecuten `prisma migrate` ni `prisma db push`.** Usen solo `npm run sync` (`prisma db pull` + `prisma generate`). Un `migrate` puede borrar las tablas de los demás equipos.
- **Solo escriban en las tablas de su módulo.** Leer las de otros está permitido.
- No modifiquen a mano los datos precargados: las pruebas dependen de ellos. Para experimentar, creen sus propios registros y bórrenlos.

## 9. Datos precargados (tablas base, solo lectura)

**Días** — `dias`

| id | nombre | fecha | aforo |
|---|---|---|---|
| 1 | Viernes | 2026-11-20 | 30000 |
| 2 | Sábado | 2026-11-21 | 30000 |
| 3 | Domingo | 2026-11-22 | 30000 |
| 4 | Pre-party | 2026-11-19 | 3 |

**Escenarios** — 1 Tarima Picnic · 2 Tarima Colombia · 3 Carpa Electrónica · 4 Escenario Acústico

**Zonas** — 1 Camping Norte (CAMPING, 200) · 2 Camping VIP (CAMPING, 2) · 3 Parqueadero Principal (PARQUEADERO, 500) · 4 Parqueadero Motos (PARQUEADERO, 1) · 5 Plazoleta Gastronómica (COMIDA) · 6 Food Trucks (COMIDA) · 7 Zona de Tarimas (GENERAL) · 8 Entrada Principal (GENERAL)

**Artistas** — 1 Bomba Estéreo · 2 Monsieur Periné · 3 Diamante Eléctrico · 4 Morat · 5 Aterciopelados · 6 ChocQuibTown · 7 Systema Solar · 8 Ela Minus · 9 Nicola Cruz · 10 Mon Laferte · 11 Kali Uchis · 12 Frente Cumbiero

**Asistentes** — ids 1 a 20. El documento de cada uno es `10376001` seguido de su id con dos dígitos (el asistente 5 tiene `1037600105`). El asistente **19 es menor de edad**; el **20 cumple 18 años el 19 de noviembre de 2026**.

**Voluntarios** — ids 1 a 8.

Las tablas de cada módulo también traen datos iniciales. Explórenlos con Prisma Studio (`npx prisma studio`) o con consultas `GET` a su propia API.
