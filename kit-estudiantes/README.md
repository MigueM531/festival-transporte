# Kit de la maratón — Festival Picnic 2026

Todo lo que necesitas para construir tu módulo.

| Carpeta | Qué contiene |
|---|---|
| `contratos/` | [Convenciones comunes](contratos/CONVENCIONES.md) y el contrato de cada módulo |
| `pruebas/` | El ejecutor y las **pruebas públicas** de cada módulo |

## 1. Arrancar el proyecto (15 minutos)

Parte de la estructura del proyecto de clase (`desarrollo-web-backend`): Express + TypeScript + Prisma, cuatro capas.

```bash
mkdir festival-<modulo> && cd festival-<modulo>
git init
npm init -y
npm install express cors dotenv @prisma/client @prisma/adapter-pg pg
npm install -D typescript tsx nodemon prisma @types/express @types/cors @types/node @types/pg
npx prisma init
npm pkg set type=module
```

En `.env` pon la cadena de conexión que entrega el docente, y crea `.env.example` sin la contraseña:

```
DATABASE_URL="postgresql://..."
PORT=3000
```

En `package.json` agrega los scripts (los mismos de clase):

```json
"dev": "nodemon --ext ts,json --exec 'tsx ./src/app.ts'",
"sync": "npx prisma db pull && npx prisma generate"
```

Trae el esquema de la base compartida:

```bash
npm run sync
```

`db pull` muestra un aviso sobre *check constraints* que Prisma no soporta: es normal, ignóralo. Deben aparecer 23 modelos en `prisma/schema.prisma`.

> ⚠️ **Nunca** ejecutes `npx prisma migrate` ni `npx prisma db push`: la base es compartida y podrías borrar las tablas de los otros equipos.

## 2. Correr las pruebas

Con tu API encendida, desde la carpeta del kit:

```bash
node pruebas/correr.mjs <modulo> http://localhost:3000
```

Ejemplo:

```bash
node pruebas/correr.mjs boleteria http://localhost:3000
```

Cada prueba en rojo dice qué petición hizo y qué respondió tu API. Solo necesitas Node 18 o superior; el ejecutor no instala nada.

Las pruebas crean registros y los borran al final, así que puedes correrlas todas las veces que quieras.

## 3. Las pruebas ocultas

El docente tiene un segundo grupo de pruebas que **no está en este kit**: casos borde de validación y de las reglas de negocio. Todo lo que evalúan está escrito en tu contrato y en las convenciones. Si tu API cumple el contrato completo, y no solo las pruebas públicas, las pasará.
