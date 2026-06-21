# parks-twenty-service

Microservicio Node.js/TypeScript para **Parks Industrial** — motor de reglas sobre Twenty CRM.

## Stack

- Express + TypeScript (strict)
- GraphQL hacia Twenty (`graphql-request`)
- Puppeteer + Handlebars (PDF)
- node-cron (SLA, holdover, renovaciones, Oracle)

## Puertos

| Servicio | Puerto dev |
| --- | --- |
| Twenty API | 3000 |
| Twenty UI (Vite) | 3001 |
| **Este microservicio** | **3002** |

En producción, ajustar webhooks de Twenty al puerto expuesto del microservicio.

## Setup

```bash
cd parks-twenty-service
cp .env.example .env
# Editar TWENTY_API_KEY
npm install
npm run dev
```

## Comandos

```bash
npm run dev           # Desarrollo con hot-reload
npm run build         # Compilar a dist/
npm run health        # Verificar conexión con Twenty
npm run setup:objects     # Crear custom objects (Paso 3)
npm run setup:opportunity # Campos custom en Oportunidad (Paso 4)
npm run setup:pipelines   # 4 pipelines Kanban (Paso 5)
npm run setup:roles       # 8 roles Parks (Paso 6b)
npm run setup:dashboards  # Dashboards Legal + Ejecutivo (Paso 7b)
npm run setup:webhooks    # Webhooks → microservicio (Paso 10)
npm run seed:demo         # Datos de demo (Paso 12)
npm run e2e:test          # Verificación end-to-end (Paso 13)
npm run pdf:test      # PDF de prueba
npm run oracle:test   # Mock Oracle
```

## Documentación del proyecto

- Blueprint: `docs/parks-industrial/parks-industrial-twenty-blueprint.md`
- Progreso: `docs/parks-industrial/PROGRESS.md`
