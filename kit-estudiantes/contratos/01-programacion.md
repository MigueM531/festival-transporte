# Módulo 01 — Programación de shows

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs programacion http://localhost:3000`

> Arma la grilla del festival: qué artista toca, en qué escenario, qué día y a qué hora.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `shows`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `artista_id` | int | sí |
| `escenario_id` | int | sí |
| `dia_id` | int | sí |
| `hora_inicio` | varchar(5) | sí |
| `hora_fin` | varchar(5) | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `artistas`, `escenarios`, `dias`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/shows` | 200 paginado |
| GET | `/api/shows/:id` | 200 |
| POST | `/api/shows` | 201 |
| PATCH | `/api/shows/:id` | 200 |
| DELETE | `/api/shows/:id` | 200 (borrado lógico) |
| GET | `/api/shows/artista/:artistaId` | 200 |

**Filtros del listado:** `?dia_id=`, `?escenario_id=`, `?artista_id=`  
**Campos editables con PATCH:** `artista_id`, `escenario_id`, `dia_id`, `hora_inicio`, `hora_fin`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/shows`

```json
{
  "artista_id": 11,
  "escenario_id": 4,
  "dia_id": 2,
  "hora_inicio": "14:00",
  "hora_fin": "15:00"
}
```

### Ejemplo — `GET /api/shows/1`

```json
{
  "data": {
    "id": 1,
    "artista_id": 1,
    "escenario_id": 1,
    "dia_id": 1,
    "hora_inicio": "21:00",
    "hora_fin": "22:30",
    "state": "ACTIVE"
  }
}
```

### `GET /api/shows/artista/:artistaId`

Shows activos del artista, ordenados por día y hora. Sin paginación: `{ "data": [ ... ] }`. Artista inexistente → 404.

```json
{
  "data": [
    {
      "id": 1,
      "artista_id": 1,
      "escenario_id": 1,
      "dia_id": 1,
      "hora_inicio": "21:00",
      "hora_fin": "22:30",
      "state": "ACTIVE"
    }
  ]
}
```

## Validaciones → 400 / 404

- `artista_id`, `escenario_id` y `dia_id` son enteros obligatorios.
- `hora_inicio` y `hora_fin` tienen formato `HH:MM` de 24 horas con cero inicial (`09:00`, no `9:00`; `25:00` no es válido).
- `hora_fin` debe ser posterior a `hora_inicio`.
- Si el artista, el escenario o el día no existen → **404**.

## Reglas de negocio → 409

1. Un escenario no puede tener dos shows **cruzados** el mismo día. Un show que empieza exactamente cuando termina otro **no** se cruza (`21:00–22:30` y `22:30–23:00` conviven).
2. Un artista **no toca dos veces** el mismo día.
3. Las reglas también aplican al editar con `PATCH` (sin compararse consigo mismo).

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
