# Módulo 13 — Objetos perdidos

**Dificultad:** ★☆☆ Básico — recomendado si trabajas solo  
**Pruebas:** `node pruebas/correr.mjs objetos-perdidos http://localhost:3000`

> La bodega de objetos perdidos: se registran y se entregan a su dueño verificando su documento.

Lee primero [CONVENCIONES.md](CONVENCIONES.md): la forma de las respuestas, la paginación y los códigos de error aplican a todos los módulos.

## Tablas

**Tu equipo escribe en** (y solo en estas):

### `objetos_perdidos`

| Columna | Tipo | Obligatoria |
|---|---|---|
| `id` | int | sí *(automática)* |
| `descripcion` | varchar(300) | sí |
| `categoria` | varchar(15) | sí |
| `zona_id` | int | sí |
| `dia_id` | int | sí |
| `voluntario_id` | int | sí |
| `estado` | varchar(10) | sí |
| `reclamado_por_asistente_id` | int | no |
| `fecha_entrega` | timestamptz | no |
| `state` | varchar(20) | sí *(automática)* |

**Solo lectura** (datos precargados o de otros módulos): `zonas`, `dias`, `voluntarios`, `asistentes`

## Endpoints

| Método | Ruta | Éxito |
|---|---|---|
| GET | `/api/objetos-perdidos` | 200 paginado |
| GET | `/api/objetos-perdidos/:id` | 200 |
| POST | `/api/objetos-perdidos` | 201 |
| PATCH | `/api/objetos-perdidos/:id` | 200 |
| DELETE | `/api/objetos-perdidos/:id` | 200 (borrado lógico) |
| POST | `/api/objetos-perdidos/:id/reclamar` | 200 |

**Filtros del listado:** `?categoria=`, `?estado=`, `?dia_id=`, `?zona_id=`  
**Campos editables con PATCH:** `descripcion`, `categoria`, `zona_id`. Enviar cualquier otro campo → 400.

### Crear — `POST /api/objetos-perdidos`

```json
{
  "descripcion": "Gafas de sol negras",
  "categoria": "ACCESORIOS",
  "zona_id": 7,
  "dia_id": 1,
  "voluntario_id": 2
}
```

### Ejemplo — `GET /api/objetos-perdidos/1`

```json
{
  "data": {
    "id": 1,
    "descripcion": "Billetera negra de cuero",
    "categoria": "ACCESORIOS",
    "zona_id": 7,
    "dia_id": 1,
    "voluntario_id": 1,
    "estado": "EN_BODEGA",
    "reclamado_por_asistente_id": null,
    "fecha_entrega": null,
    "state": "ACTIVE"
  }
}
```

### `POST /api/objetos-perdidos/:id/reclamar`

Body: `{ "asistente_id": 5, "documento": "1037600105" }`. Responde 200 con el objeto en estado `ENTREGADO`, `reclamado_por_asistente_id` y `fecha_entrega`. Sin documento → 400; objeto o asistente inexistente → 404.

## Validaciones → 400 / 404

- `zona_id`, `dia_id` y `voluntario_id` (quien lo encontró) son enteros obligatorios; si no existen → 404.
- `descripcion` entre 5 y 300 caracteres.
- `categoria` es `DOCUMENTOS`, `ELECTRONICOS`, `ROPA`, `ACCESORIOS` u `OTROS`.
- El objeto nace en estado `EN_BODEGA`.

## Reglas de negocio → 409

1. Para reclamar, el `documento` enviado debe coincidir con el del asistente → si no, 409.
2. Un objeto `ENTREGADO` no se reclama otra vez, no se edita y no se elimina → 409.

## Pistas

- Las reglas viven en el **caso de uso** (`application/`), no en el controlador. El caso de uso consulta el repositorio antes de decidir.
- Revisa en la tabla de datos precargados qué registros usan las pruebas (sección *Datos precargados* de CONVENCIONES.md) y **no los modifiques a mano**.
- Corre las pruebas públicas seguido. Cada prueba en rojo te dice qué petición falló y qué respondió tu API.
