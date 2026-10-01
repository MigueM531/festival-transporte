# Módulo 07 — Tienda de merch

**Dificultad:** ★★★ Avanzado — recomendado para equipos de 4  
**Pruebas:** `node pruebas/correr.mjs merch http://localhost:3000`

> Vende la mercancía oficial de los artistas con inventario y límite por comprador.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `ventas_merch`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `producto_id` | int | sí |
| `cantidad` | int | sí |
| `total` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

### `productos_merch`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `nombre` | varchar(100) | sí |
| `artista_id` | int | no |
| `precio` | int | sí |
| `stock` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `artistas`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/ventas-merch` | 200 paginado |
| GET | `/api/ventas-merch/:id` | 200 |
| POST | `/api/ventas-merch` | 201 |
| PATCH | `/api/ventas-merch/:id` | 200 |
| DELETE | `/api/ventas-merch/:id` | 200 (borrado lógico) |
| GET | `/api/productos-merch` | 200 |
| GET | `/api/productos-merch/:id` | 200 |

**Filtros del listado:** `?asistente_id=`, `?producto_id=`  
**Campos editables con PATCH:** `cantidad`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/ventas-merch`

```json
{
  "asistente_id": 6,
  "producto_id": 2,
  "cantidad": 2
}
```

### Ejemplo — `GET /api/ventas-merch/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 5,
    "producto_id": 1,
    "cantidad": 4,
    "total": 340000,
    "state": "ACTIVE"
  }
}
```

### `GET /api/productos-merch`

Listado paginado. Filtro `?artista_id=`.

```json
{
  "pagination": {
    "total": 5,
    "currentPage": 1,
    "limit": 2,
    "totalPages": 3
  },
  "data": [
    {
      "id": 1,
      "nombre": "Camiseta Bomba Estéreo",
      "artista_id": 1,
      "precio": 85000,
      "stock": 40,
      "state": "ACTIVE"
    },
    {
      "id": 2,
      "nombre": "Gorra Morat",
      "artista_id": 4,
      "precio": 60000,
      "stock": 25,
      "state": "ACTIVE"
    }
  ]
}
```

### `GET /api/productos-merch/:id`

Un producto con su stock. Inexistente → 404.

```json
{
  "data": {
    "id": 2,
    "nombre": "Gorra Morat",
    "artista_id": 4,
    "precio": 60000,
    "stock": 25,
    "state": "ACTIVE"
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` y `producto_id` son enteros obligatorios; si no existen → 404.
- `cantidad` es un entero entre 1 y 5.
- El **total lo calcula el servidor**: `precio × cantidad`.

## Reglas de negocio → 409

1. No se vende más que el `stock`. Vender **descuenta** stock; anular (DELETE) lo **devuelve**.
2. Un asistente compra **máximo 5 unidades** de un mismo producto sumando todas sus ventas activas.
3. `PATCH` de `cantidad` recalcula el total y ajusta el stock por la diferencia, respetando ambas reglas.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
