# Módulo 11 — Incidentes médicos

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs incidentes http://localhost:3000`

> Registra y da seguimiento a las atenciones médicas del festival.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `incidentes`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | no |
| `zona_id` | int | sí |
| `dia_id` | int | sí |
| `severidad` | varchar(10) | sí |
| `descripcion` | varchar(500) | sí |
| `estado` | varchar(12) | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `zonas`, `dias`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/incidentes` | 200 paginado |
| GET | `/api/incidentes/:id` | 200 |
| POST | `/api/incidentes` | 201 |
| PATCH | `/api/incidentes/:id` | 200 |
| DELETE | `/api/incidentes/:id` | 200 (borrado lógico) |
| PATCH | `/api/incidentes/:id/estado` | 200 |
| GET | `/api/incidentes/resumen?dia_id=1` | 200 |

**Filtros del listado:** `?estado=`, `?severidad=`, `?dia_id=`  
**Campos editables con PATCH:** `asistente_id`, `zona_id`, `severidad`, `descripcion`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/incidentes`

```json
{
  "zona_id": 7,
  "dia_id": 3,
  "severidad": "LEVE",
  "descripcion": "Golpe de calor en la fila del baño"
}
```

### Ejemplo — `GET /api/incidentes/2`

```json
{
  "data": {
    "id": 2,
    "asistente_id": null,
    "zona_id": 8,
    "dia_id": 1,
    "severidad": "MODERADA",
    "descripcion": "Caída en la fila de ingreso",
    "estado": "EN_ATENCION",
    "state": "ACTIVE"
  }
}
```

### `PATCH /api/incidentes/:id/estado`

Body: `{ "estado": "EN_ATENCION" }`. Estado que no existe → 400.

### `GET /api/incidentes/resumen?dia_id=1`

Conteo de incidentes activos por estado. `dia_id` opcional; si viene y no es número → 400.

```json
{
  "data": {
    "dia_id": 1,
    "ABIERTO": 1,
    "EN_ATENCION": 1,
    "CERRADO": 0
  }
}
```

## Validaciones → 400 / 404

- `zona_id` y `dia_id` son enteros obligatorios; `asistente_id` es opcional (puede no estar identificado). Si alguno no existe → 404.
- `severidad` es `LEVE`, `MODERADA` o `GRAVE`; `descripcion` tiene entre 10 y 500 caracteres.
- El incidente nace en estado `ABIERTO`. El `estado` **no** se cambia con el PATCH general (→ 400), sino con el endpoint de estado.

## Reglas de negocio → 409

1. El estado avanza en orden: `ABIERTO → EN_ATENCION → CERRADO`. Saltarse un paso o retroceder → 409.
2. Un incidente `CERRADO` no se edita (PATCH → 409).
3. Solo se eliminan incidentes `ABIERTO`; los demás → 409.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
