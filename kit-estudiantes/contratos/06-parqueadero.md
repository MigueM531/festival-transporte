# Módulo 06 — Parqueadero

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs parqueadero http://localhost:3000`

> Reserva cupos de parqueadero para carros y motos por día.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `reservas_parqueadero`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `zona_id` | int | sí |
| `dia_id` | int | sí |
| `placa` | varchar(6) | sí |
| `tipo_vehiculo` | varchar(5) | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `zonas`, `dias`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/reservas-parqueadero` | 200 paginado |
| GET | `/api/reservas-parqueadero/:id` | 200 |
| POST | `/api/reservas-parqueadero` | 201 |
| PATCH | `/api/reservas-parqueadero/:id` | 200 |
| DELETE | `/api/reservas-parqueadero/:id` | 200 (borrado lógico) |
| GET | `/api/reservas-parqueadero/placa/:placa` | 200 |

**Filtros del listado:** `?dia_id=`, `?zona_id=`, `?asistente_id=`  
**Campos editables con PATCH:** `zona_id`, `dia_id`, `placa`, `tipo_vehiculo`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/reservas-parqueadero`

```json
{
  "asistente_id": 5,
  "zona_id": 3,
  "dia_id": 1,
  "placa": "XYZ123",
  "tipo_vehiculo": "CARRO"
}
```

### Ejemplo — `GET /api/reservas-parqueadero/2`

```json
{
  "data": {
    "id": 2,
    "asistente_id": 2,
    "zona_id": 3,
    "dia_id": 1,
    "placa": "KJH345",
    "tipo_vehiculo": "CARRO",
    "state": "ACTIVE"
  }
}
```

### `GET /api/reservas-parqueadero/placa/:placa`

Reservas activas de esa placa. Sin paginación. Si no hay, `{ "data": [] }`.

```json
{
  "data": [
    {
      "id": 2,
      "asistente_id": 2,
      "zona_id": 3,
      "dia_id": 1,
      "placa": "KJH345",
      "tipo_vehiculo": "CARRO",
      "state": "ACTIVE"
    }
  ]
}
```

## Validaciones → 400 / 404

- `asistente_id`, `zona_id` y `dia_id` son enteros obligatorios; si no existen → 404.
- `tipo_vehiculo` es `CARRO` o `MOTO`.
- `placa` de CARRO: 3 letras mayúsculas + 3 dígitos (`XYZ123`). De MOTO: 3 letras + 2 dígitos + 1 letra (`ABC12D`). Si no coincide con su tipo → 400.
- La zona debe ser de tipo `PARQUEADERO`; si es de otro tipo → 400.

## Reglas de negocio → 409

1. Una zona no recibe más reservas que su `capacidad` en un mismo día.
2. Una placa tiene **máximo una reserva activa por día** (otro día sí puede).

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
