# Módulo 14 — Acreditaciones de prensa

**Dificultad:** ★★☆ Intermedio  
**Pruebas:** `node pruebas/correr.mjs acreditaciones http://localhost:3000`

> Gestiona las solicitudes de periodistas, fotógrafos e influencers para cubrir el festival.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `acreditaciones`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `nombre` | varchar(100) | sí |
| `medio` | varchar(100) | sí |
| `email` | varchar(120) | sí |
| `tipo` | varchar(12) | sí |
| `dia_id` | int | sí |
| `escenario_id` | int | no |
| `estado` | varchar(10) | sí |
| `motivo_rechazo` | varchar(300) | no |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `dias`, `escenarios`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/acreditaciones` | 200 paginado |
| GET | `/api/acreditaciones/:id` | 200 |
| POST | `/api/acreditaciones` | 201 |
| PATCH | `/api/acreditaciones/:id` | 200 |
| DELETE | `/api/acreditaciones/:id` | 200 (borrado lógico) |
| PATCH | `/api/acreditaciones/:id/estado` | 200 |

**Filtros del listado:** `?tipo=`, `?estado=`, `?dia_id=`  
**Campos editables con PATCH:** `nombre`, `medio`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/acreditaciones`

```json
{
  "nombre": "Pedro Mora",
  "medio": "Semana",
  "email": "pedro.mora@semana.com",
  "tipo": "PRENSA",
  "dia_id": 2
}
```

### Ejemplo — `GET /api/acreditaciones/1`

```json
{
  "data": {
    "id": 1,
    "nombre": "Laura Gómez",
    "medio": "El Espectador",
    "email": "laura.gomez@elespectador.com",
    "tipo": "PRENSA",
    "dia_id": 1,
    "escenario_id": null,
    "estado": "APROBADA",
    "motivo_rechazo": null,
    "state": "ACTIVE"
  }
}
```

### `PATCH /api/acreditaciones/:id/estado`

Body: `{ "estado": "APROBADA" }` o `{ "estado": "RECHAZADA", "motivo": "..." }`. El motivo se guarda en `motivo_rechazo`. Estado que no existe → 400.

## Validaciones → 400 / 404

- `nombre`, `medio`, `email`, `tipo` y `dia_id` son obligatorios; `email` con formato válido.
- `tipo` es `PRENSA`, `FOTOGRAFO` o `INFLUENCER`. Un `FOTOGRAFO` **debe** traer `escenario_id` → si no, 400.
- Si el día o el escenario no existen → 404.
- La solicitud nace `PENDIENTE`.

## Reglas de negocio → 409

1. Un mismo email tiene máximo una acreditación activa por día (otro día sí).
2. Máximo **5 fotógrafos** por escenario y día; las solicitudes `RECHAZADA` no cuentan.
3. Solo se decide (aprobar o rechazar) una solicitud `PENDIENTE` → si no, 409. Rechazar exige `motivo` → si falta, 400.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
