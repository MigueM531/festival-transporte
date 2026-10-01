# Módulo 10 — Billetera cashless

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs billetera http://localhost:3000`

> La manilla del festival funciona como billetera: se recarga y se consume.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `movimientos`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `tipo` | varchar(8) | sí |
| `monto` | int | sí |
| `descripcion` | varchar(200) | no |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/movimientos` | 200 paginado |
| GET | `/api/movimientos/:id` | 200 |
| POST | `/api/movimientos` | 201 |
| PATCH | `/api/movimientos/:id` | 200 |
| DELETE | `/api/movimientos/:id` | 200 (borrado lógico) |
| GET | `/api/billeteras/:asistenteId/saldo` | 200 |

**Filtros del listado:** `?asistente_id=`, `?tipo=`  
**Campos editables con PATCH:** `descripcion`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/movimientos`

```json
{
  "asistente_id": 2,
  "tipo": "RECARGA",
  "monto": 50000,
  "descripcion": "Recarga en taquilla"
}
```

### Ejemplo — `GET /api/movimientos/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 1,
    "tipo": "RECARGA",
    "monto": 200000,
    "descripcion": "Recarga en taquilla",
    "state": "ACTIVE"
  }
}
```

### `GET /api/billeteras/:asistenteId/saldo`

Saldo actual del asistente. Inexistente → 404.

```json
{
  "data": {
    "asistente_id": 1,
    "saldo": 150000
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` entero obligatorio; si no existe → 404.
- `tipo` es `RECARGA` o `CONSUMO`; `monto` es un entero positivo.
- Una RECARGA va de 10000 a 2000000.
- `descripcion` es opcional (máximo 200). Es **lo único editable**: un `PATCH` con `monto` o `tipo` → 400.

## Reglas de negocio → 409

1. El **saldo** es la suma de recargas menos la suma de consumos activos.
2. Un CONSUMO no puede dejar el saldo negativo.
3. Anular (DELETE) una RECARGA no puede dejar el saldo negativo.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
