# Módulo 15 — Meet & Greet

**Dificultad:** ★☆☆ Básico — recomendado si trabajas solo  
**Pruebas:** `node pruebas/correr.mjs meet-greet http://localhost:3000`

> Inscribe a los asistentes VIP para conocer a los artistas después de su show.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `inscripciones_meet`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `show_id` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `shows`, `boletas`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/inscripciones-meet` | 200 paginado |
| GET | `/api/inscripciones-meet/:id` | 200 |
| POST | `/api/inscripciones-meet` | 201 |
| PATCH | `/api/inscripciones-meet/:id` | 200 |
| DELETE | `/api/inscripciones-meet/:id` | 200 (borrado lógico) |
| GET | `/api/inscripciones-meet/show/:showId` | 200 |

**Filtros del listado:** `?show_id=`, `?asistente_id=`  
**Campos editables con PATCH:** `show_id`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/inscripciones-meet`

```json
{
  "asistente_id": 6,
  "show_id": 1
}
```

### Ejemplo — `GET /api/inscripciones-meet/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "show_id": 5,
    "state": "ACTIVE"
  }
}
```

### `GET /api/inscripciones-meet/show/:showId`

Cupo (3), ocupados, disponibles y lista de inscritos con su nombre. Show inexistente → 404.

```json
{
  "data": {
    "show_id": 5,
    "cupo": 3,
    "ocupados": 3,
    "disponibles": 0,
    "inscritos": [
      {
        "asistente_id": 1,
        "nombre": "Valentina Restrepo"
      },
      {
        "asistente_id": 4,
        "nombre": "Juan Pablo Arango"
      }
    ]
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` y `show_id` son enteros obligatorios; si no existen → 404.

## Reglas de negocio → 409

1. Se necesita una boleta activa **VIP o PLATINO** del día del show.
2. Una inscripción activa por asistente y show. Si la cancela, puede volver a inscribirse.
3. Máximo **3 inscritos** por show.
4. Las reglas también aplican al mover la inscripción a otro show con `PATCH`.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
