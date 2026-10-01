# Módulo 12 — Reportes

**Dificultad:** ★★★ Avanzado — recomendado para equipos de 4  
**Pruebas:** `node pruebas/correr.mjs reportes http://localhost:3000`

> El tablero de la organización: consultas que cruzan la información de todo el festival.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Solo lectura** (datos precargados o de otros módulos): `dias`, `boletas`, `artistas`, `shows`, `resenas`, `escenarios`, `pedidos_comida`, `productos_comida`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/reportes/ventas-por-dia` | 200 |
| GET | `/api/reportes/top-artistas?limit=3` | 200 |
| GET | `/api/reportes/ocupacion/:diaId` | 200 |
| GET | `/api/reportes/escenarios/:escenarioId/agenda?dia_id=1` | 200 |
| GET | `/api/reportes/comida/top-productos` | 200 |

### `GET /api/reportes/ventas-por-dia`

Todos los días (incluso sin ventas), ordenados por fecha, con número de boletas e ingresos.

```json
{
  "data": [
    {
      "dia_id": 4,
      "nombre": "Pre-party",
      "fecha": "2026-11-19",
      "boletas": 3,
      "ingresos": 750000
    },
    {
      "dia_id": 1,
      "nombre": "Viernes",
      "fecha": "2026-11-20",
      "boletas": 8,
      "ingresos": 3110000
    }
  ]
}
```

### `GET /api/reportes/top-artistas?limit=3`

Artistas con al menos una reseña, ordenados por promedio (desc), luego por número de reseñas (desc), luego por nombre. `limit` entre 1 y 10, por defecto 5; fuera de rango → 400.

```json
{
  "data": [
    {
      "artista_id": 10,
      "nombre": "Mon Laferte",
      "promedio": 5,
      "resenas": 1
    },
    {
      "artista_id": 1,
      "nombre": "Bomba Estéreo",
      "promedio": 4.67,
      "resenas": 3
    }
  ]
}
```

### `GET /api/reportes/ocupacion/:diaId`

Aforo, boletas vendidas y porcentaje de ocupación. Id inválido → 400; inexistente → 404.

```json
{
  "data": {
    "dia_id": 4,
    "aforo": 3,
    "vendidas": 3,
    "porcentaje": 100
  }
}
```

### `GET /api/reportes/escenarios/:escenarioId/agenda?dia_id=1`

Shows del escenario ese día con el nombre del artista, ordenados por `hora_inicio`. `dia_id` obligatorio → si falta, 400. Escenario inexistente → 404.

```json
{
  "data": [
    {
      "show_id": 10,
      "artista": "Aterciopelados",
      "hora_inicio": "17:00",
      "hora_fin": "18:30"
    },
    {
      "show_id": 8,
      "artista": "Mon Laferte",
      "hora_inicio": "20:00",
      "hora_fin": "21:30"
    }
  ]
}
```

### `GET /api/reportes/comida/top-productos`

Productos de comida con al menos un pedido, ordenados por unidades vendidas (desc).

```json
{
  "data": [
    {
      "producto_id": 1,
      "nombre": "Arepa de choclo con queso",
      "unidades": 2,
      "ingresos": 24000
    },
    {
      "producto_id": 3,
      "nombre": "Salchipapa especial",
      "unidades": 1,
      "ingresos": 18000
    }
  ]
}
```

## Validaciones → 400 / 404

- Todos los endpoints son de **solo lectura** (`GET`). No hay CRUD.
- Solo se cuentan registros con `state = 'ACTIVE'`.
- Los promedios y porcentajes se redondean a **2 decimales** y se devuelven como número.

## Pistas

- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
