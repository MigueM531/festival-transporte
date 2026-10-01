# Módulo 08 — Camping

**Dificultad:** ★★★ Avanzado — recomendado para equipos de 4  
**Pruebas:** `node pruebas/correr.mjs camping http://localhost:3000`

> Administra las carpas de las zonas de camping durante los días del festival.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `reservas_camping`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `asistente_id` | int | sí |
| `zona_id` | int | sí |
| `fecha_entrada` | date | sí |
| `fecha_salida` | date | sí |
| `personas` | int | sí |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `asistentes`, `zonas`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/reservas-camping` | 200 paginado |
| GET | `/api/reservas-camping/:id` | 200 |
| POST | `/api/reservas-camping` | 201 |
| PATCH | `/api/reservas-camping/:id` | 200 |
| DELETE | `/api/reservas-camping/:id` | 200 (borrado lógico) |
| GET | `/api/reservas-camping/zona/:zonaId/ocupacion` | 200 |

**Filtros del listado:** `?zona_id=`, `?asistente_id=`  
**Campos editables con PATCH:** `zona_id`, `fecha_entrada`, `fecha_salida`, `personas`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/reservas-camping`

```json
{
  "asistente_id": 7,
  "zona_id": 1,
  "fecha_entrada": "2026-11-20",
  "fecha_salida": "2026-11-22",
  "personas": 3
}
```

### Ejemplo — `GET /api/reservas-camping/1`

```json
{
  "data": {
    "id": 1,
    "asistente_id": 3,
    "zona_id": 2,
    "fecha_entrada": "2026-11-20",
    "fecha_salida": "2026-11-22",
    "personas": 2,
    "state": "ACTIVE"
  }
}
```

### `GET /api/reservas-camping/zona/:zonaId/ocupacion`

Capacidad, ocupadas y disponibles. Zona que no es de camping → 400; inexistente → 404.

```json
{
  "data": {
    "zona_id": 2,
    "capacidad": 2,
    "ocupadas": 2,
    "disponibles": 0
  }
}
```

## Validaciones → 400 / 404

- `asistente_id` y `zona_id` son enteros obligatorios; si no existen → 404.
- Fechas en formato `YYYY-MM-DD`; `fecha_salida` posterior a `fecha_entrada`; ambas entre el **19 y el 23 de noviembre de 2026**.
- `personas` es un entero entre 1 y 6.
- La zona debe ser de tipo `CAMPING`; si no → 400.

## Reglas de negocio → 409

1. Solo acampan **mayores de edad**: el asistente debe tener 18 años cumplidos el 19 de noviembre de 2026 (quien los cumple ese mismo día, sí puede).
2. Un asistente tiene **máximo una** reserva de camping activa.
3. Cada reserva ocupa una carpa; una zona no recibe más reservas que su `capacidad`.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
