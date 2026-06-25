# Parks Industrial — UI integrada en Twenty

Los módulos del blueprint viven ahora **dentro de Twenty** (`packages/twenty-front`), no en la app Next.js separada.

## Rutas (mismo login que Twenty)

| Módulo | Ruta |
|--------|------|
| Dashboard ejecutivo | `/parks/dashboard` |
| Stacking Plan | `/parks/stacking-plan` → redirige al primer parque |
| Stacking Plan (parque) | `/parks/parque/:parqueId/stacking-plan` |
| Pipeline | `/parks/pipeline` |
| Contratos | `/parks/contratos` |
| Aprobación | `/parks/contratos/:contratoId/aprobacion` |
| Comisiones | `/parks/comisiones` |
| Mapa | `/parks/mapa` |

## Navegación

Sección **「Parks Industrial」** en el sidebar izquierdo de Twenty (debajo de favoritos/workspace).

## Código

```
packages/twenty-front/src/modules/parks-industrial/
packages/twenty-front/src/pages/parks-industrial/
packages/twenty-shared/src/types/AppPath.ts  # rutas Parks
```

## Datos

Usa el cliente GraphQL de Twenty (`useFindManyRecords`, `useUpdateOneRecord`) — **no requiere API key** en el browser; usa la sesión del usuario logueado.

## App Next.js (`apps/parks-dashboard`)

Queda como prototipo/legacy. Para demo usa Twenty en **http://localhost:3001** con las rutas `/parks/*`.

## Desarrollo local

```bash
bash packages/twenty-utils/setup-dev-env.sh --docker
cd packages/twenty-server && NODE_ENV=development npx nest start --watch
cd packages/twenty-front && npx vite --host 127.0.0.1
```

Abre http://localhost:3001/parks/dashboard

## Seed demo Bajío (12 naves Silao + Genomma + Nestlé)

```bash
cd apps/parks-dashboard
# TWENTY_API_URL + TWENTY_API_KEY en .env.local
npm run seed:demo
```

Idempotente: re-ejecutar omite si el dataset ya existe (`BAJIO-DEMO-*`).
