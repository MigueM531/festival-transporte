# Módulo 02 — Boletería

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs boleteria http://localhost:3000`

> Vende las boletas de cada día del festival sin pasarse del aforo.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `boletas`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `dia_id` | int | sí |
| `tipo` | varchar(10) | sí |
| `precio` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `dias`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/boletas` | 200 paginado |
| GET | `/api/boletas/:id` | 200 |
| POST | `/api/boletas` | 201 |
| PATCH | `/api/boletas/:id` | 200 |
| DELETE | `/api/boletas/:id` | 200 (borrado lógico) |
| GET | `/api/boletas/dia/:diaId/disponibilidad` | 200 |

**Filtros del listado:** `?dia_id=`, `?asistente_id=`, `?tipo=`  
**Campos editables con PATCH:** `tipo`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/boletas`

```json
{
  "asistente_id": 14,
  "dia_id": 1,
  "tipo": "GENERAL"
}
```

### Ejemplo — `GET /api/boletas/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "dia_id": 4,
    "tipo": "GENERAL",
    "precio": 250000,
    "state": "ACTIVE"
  }
}
```

### `GET /api/boletas/dia/:diaId/disponibilidad`

Aforo, vendidas y disponibles del día. Día inexistente → 404.

```json
{
  "data": {
    "dia_id": 4,
    "aforo": 3,
    "vendidas": 3,
    "disponibles": 0
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` y `dia_id` son enteros obligatorios; si no existen → 404.
- `tipo` es `GENERAL`, `VIP` o `PLATINO`.
- El **precio lo calcula el servidor** según el tipo: GENERAL 250000, VIP 480000, PLATINO 900000. Si el cliente envía un `precio`, se ignora.
- Al cambiar el `tipo` con `PATCH`, el precio se recalcula.

## Reglas de negocio → 409

1. No se venden más boletas que el `aforo` del día (se cuentan solo las boletas activas).
2. Un asistente tiene **máximo una boleta activa por día**. Si la anula (DELETE), puede volver a comprar.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
