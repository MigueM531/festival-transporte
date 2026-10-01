# Módulo 09 — Transporte

**Dificultad:** ★☆☆ Básico — recomendado si trabajas solo  
**Pruebas:** `node pruebas/correr.mjs transporte http://localhost:3000`

> Reserva puestos en los buses oficiales hacia y desde el festival.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `reservas_bus`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `bus_id` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

### `buses`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `ruta` | varchar(100) | sí |
| `dia_id` | int | sí |
| `hora_salida` | varchar(5) | sí |
| `capacidad` | int | sí |
| `estado` | varchar(12) | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `dias`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/reservas-bus` | 200 paginado |
| GET | `/api/reservas-bus/:id` | 200 |
| POST | `/api/reservas-bus` | 201 |
| PATCH | `/api/reservas-bus/:id` | 200 |
| DELETE | `/api/reservas-bus/:id` | 200 (borrado lógico) |
| GET | `/api/buses` | 200 |
| GET | `/api/buses/:id` | 200 |
| PATCH | `/api/buses/:id/estado` | 200 |

**Filtros del listado:** `?bus_id=`, `?asistente_id=`  
**Campos editables con PATCH:** `bus_id`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/reservas-bus`

```json
{
  "asistente_id": 5,
  "bus_id": 1
}
```

### Ejemplo — `GET /api/reservas-bus/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "bus_id": 2,
    "state": "ACTIVE"
  }
}
```

### `GET /api/buses`

Listado paginado. Filtros `?dia_id=` y `?estado=`.

```json
{
  "pagination": {
    "total": 6,
    "currentPage": 1,
    "limit": 2,
    "totalPages": 3
  },
  "data": [
    {
      "id": 1,
      "ruta": "Centro → Festival",
      "dia_id": 1,
      "hora_salida": "15:00",
      "capacidad": 40,
      "estado": "PROGRAMADO",
      "state": "ACTIVE"
    },
    {
      "id": 2,
      "ruta": "Portal Norte → Festival",
      "dia_id": 1,
      "hora_salida": "16:00",
      "capacidad": 2,
      "estado": "PROGRAMADO",
      "state": "ACTIVE"
    }
  ]
}
```

### `GET /api/buses/:id`

Un bus. Inexistente → 404.

```json
{
  "data": {
    "id": 2,
    "ruta": "Portal Norte → Festival",
    "dia_id": 1,
    "hora_salida": "16:00",
    "capacidad": 2,
    "estado": "PROGRAMADO",
    "state": "ACTIVE"
  }
}
```

### `PATCH /api/buses/:id/estado`

Cambia el estado del bus. Body: `{ "estado": "SALIO" }`.

## Validaciones → 400 / 404

- `asistente_id` y `bus_id` son enteros obligatorios; si no existen → 404.

## Reglas de negocio → 409

1. Solo se reserva en un bus `PROGRAMADO` (no en `SALIO` ni `CANCELADO`).
2. Un bus no recibe más reservas que su `capacidad`.
3. Un asistente tiene máximo una reserva activa por bus.
4. Estados del bus: `PROGRAMADO → SALIO` o `PROGRAMADO → CANCELADO`. Cualquier otro cambio (incluido volver a PROGRAMADO) → 409. Un estado que no existe → 400.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
