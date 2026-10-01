# Módulo 04 — Turnos de voluntarios

**Dificultad:** ★★★ Avanzado — recomendado para equipos de 4  
**Pruebas:** `node pruebas/correr.mjs voluntarios http://localhost:3000`

> Organiza los turnos de los voluntarios cuidando que nadie trabaje de más.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `turnos`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `voluntario_id` | int | sí |
| `zona_id` | int | sí |
| `dia_id` | int | sí |
| `hora_inicio` | varchar(5) | sí |
| `hora_fin` | varchar(5) | sí |
| `rol` | varchar(20) | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `voluntarios`, `zonas`, `dias`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/turnos` | 200 paginado |
| GET | `/api/turnos/:id` | 200 |
| POST | `/api/turnos` | 201 |
| PATCH | `/api/turnos/:id` | 200 |
| DELETE | `/api/turnos/:id` | 200 (borrado lógico) |
| GET | `/api/turnos/voluntario/:voluntarioId/horas?dia_id=1` | 200 |

**Filtros del listado:** `?voluntario_id=`, `?dia_id=`, `?zona_id=`  
**Campos editables con PATCH:** `zona_id`, `dia_id`, `hora_inicio`, `hora_fin`, `rol`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/turnos`

```json
{
  "voluntario_id": 1,
  "zona_id": 7,
  "dia_id": 1,
  "hora_inicio": "19:00",
  "hora_fin": "20:00",
  "rol": "LOGISTICA"
}
```

### Ejemplo — `GET /api/turnos/1`

```json
{
  "data": {
    "id": 1,
    "voluntario_id": 1,
    "zona_id": 8,
    "dia_id": 1,
    "hora_inicio": "10:00",
    "hora_fin": "14:00",
    "rol": "LOGISTICA",
    "state": "ACTIVE"
  }
}
```

### `GET /api/turnos/voluntario/:voluntarioId/horas?dia_id=1`

Horas trabajadas ese día (admite decimales: 1.5). `dia_id` es obligatorio → si falta, 400. Voluntario inexistente → 404.

```json
{
  "data": {
    "voluntario_id": 1,
    "dia_id": 1,
    "horas": 7
  }
}
```

## Validaciones → 400 / 404

- `voluntario_id`, `zona_id` y `dia_id` son enteros obligatorios; si no existen → 404.
- `hora_inicio` y `hora_fin` en formato `HH:MM` (24 horas, con cero inicial); `hora_fin` posterior a `hora_inicio`.
- `rol` es `LOGISTICA`, `PUNTO_INFO`, `ASEO` o `PRIMEROS_AUXILIOS`.

## Reglas de negocio → 409

1. Un voluntario **no tiene turnos cruzados** el mismo día. Turnos contiguos (`12:00–16:00` y `16:00–18:00`) sí se permiten.
2. Un voluntario trabaja **máximo 8 horas** por día, sumando todos sus turnos activos. Exactamente 8 está permitido.
3. Las reglas también aplican al editar con `PATCH`.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
