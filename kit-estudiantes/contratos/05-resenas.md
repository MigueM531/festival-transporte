# Módulo 05 — Reseñas de shows

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs resenas http://localhost:3000`

> Deja que los asistentes califiquen los shows que vieron.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `resenas`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `show_id` | int | sí |
| `puntaje` | int | sí |
| `comentario` | varchar(500) | no |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `shows`, `boletas`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/resenas` | 200 paginado |
| GET | `/api/resenas/:id` | 200 |
| POST | `/api/resenas` | 201 |
| PATCH | `/api/resenas/:id` | 200 |
| DELETE | `/api/resenas/:id` | 200 (borrado lógico) |
| GET | `/api/resenas/show/:showId/promedio` | 200 |

**Filtros del listado:** `?show_id=`, `?asistente_id=`  
**Campos editables con PATCH:** `puntaje`, `comentario`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/resenas`

```json
{
  "asistente_id": 5,
  "show_id": 1,
  "puntaje": 4,
  "comentario": "Buen cierre de viernes"
}
```

### Ejemplo — `GET /api/resenas/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "show_id": 1,
    "puntaje": 5,
    "comentario": "El cierre con Fuego fue increíble",
    "state": "ACTIVE"
  }
}
```

### `GET /api/resenas/show/:showId/promedio`

Promedio (redondeado a 2 decimales) y total de reseñas activas. Sin reseñas → `promedio: 0`. Show inexistente → 404.

```json
{
  "data": {
    "show_id": 1,
    "total": 3,
    "promedio": 4.67
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` y `show_id` son enteros obligatorios; si no existen → 404.
- `puntaje` es un **entero** entre 1 y 5 (3.5 no es válido).
- `comentario` es opcional, máximo 500 caracteres.

## Reglas de negocio → 409

1. Solo reseña quien tiene una **boleta activa del día del show** (se cruza `shows.dia_id` con `boletas.dia_id`).
2. Una sola reseña activa por asistente y show. Si la borra, puede volver a reseñar.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
