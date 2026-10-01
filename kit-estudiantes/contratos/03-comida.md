# Módulo 03 — Comida

**Dificultad:** ★★★ Avanzado — recomendado para equipos de 4  
**Pruebas:** `node pruebas/correr.mjs comida http://localhost:3000`

> Recibe los pedidos de la plazoleta y los food trucks, controlando el inventario de cada producto.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `pedidos_comida`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `producto_id` | int | sí |
| `cantidad` | int | sí |
| `total` | int | sí |
| `estado` | varchar(12) | sí |
| `state` | varchar(20) | sí *(automática)* |

### `productos_comida`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `nombre` | varchar(100) | sí |
| `zona_id` | int | sí |
| `precio` | int | sí |
| `stock` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `zonas`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/pedidos-comida` | 200 paginado |
| GET | `/api/pedidos-comida/:id` | 200 |
| POST | `/api/pedidos-comida` | 201 |
| PATCH | `/api/pedidos-comida/:id` | 200 |
| DELETE | `/api/pedidos-comida/:id` | 200 (borrado lógico) |
| GET | `/api/productos-comida` | 200 |
| GET | `/api/productos-comida/:id` | 200 |

**Filtros del listado:** `?asistente_id=`, `?producto_id=`, `?estado=`  
**Campos editables con PATCH:** `estado`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/pedidos-comida`

```json
{
  "asistente_id": 5,
  "producto_id": 2,
  "cantidad": 2
}
```

### Ejemplo — `GET /api/pedidos-comida/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "producto_id": 1,
    "cantidad": 2,
    "total": 24000,
    "estado": "ENTREGADO",
    "state": "ACTIVE"
  }
}
```

### `GET /api/productos-comida`

Listado paginado de productos. Filtro `?zona_id=`.

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
      "nombre": "Arepa de choclo con queso",
      "zona_id": 5,
      "precio": 12000,
      "stock": 100,
      "state": "ACTIVE"
    },
    {
      "id": 2,
      "nombre": "Bandeja paisa mini",
      "zona_id": 5,
      "precio": 28000,
      "stock": 50,
      "state": "ACTIVE"
    }
  ]
}
```

### `GET /api/productos-comida/:id`

Un producto con su stock actual. Inexistente → 404.

```json
{
  "data": {
    "id": 2,
    "nombre": "Bandeja paisa mini",
    "zona_id": 5,
    "precio": 28000,
    "stock": 50,
    "state": "ACTIVE"
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` y `producto_id` son enteros obligatorios; si no existen → 404.
- `cantidad` es un entero entre 1 y 10.
- El **total lo calcula el servidor**: `precio del producto × cantidad`. El pedido nace en estado `PENDIENTE`.
- `PATCH` solo cambia el `estado` a `PENDIENTE` o `ENTREGADO`; cualquier otro valor → 400.

## Reglas de negocio → 409

1. No se pide más cantidad que el `stock` del producto.
2. Crear el pedido **descuenta** el stock; cancelarlo (DELETE) lo **devuelve**.
3. Un pedido `ENTREGADO` **no se puede cancelar**.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
