# Usuarios demo — Parks Industrial CRM

Credenciales para la demo. Fuente: `parks-twenty-service/src/metadata/parks-demo-users.constants.ts`.

Todos los roles llevan el prefijo **"Parks — "** en el workspace (ej. *Parks — CEO*).

## Reglas de contraseña

- Usuarios `@apple.dev` → contraseña `tim@apple.dev`
- Usuarios `@parksindustrial.com` → `Parks2026!` + número secuencial

## Usuarios @apple.dev (contraseña: `tim@apple.dev`)

| Email | Contraseña | Persona | Rol |
|---|---|---|---|
| jony.ive@apple.dev | tim@apple.dev | Charlie Meta (CEO) | Parks — CEO |
| phil.schiler@apple.dev | tim@apple.dev | Héctor Montelongo (CEM) | Parks — Director Comercial |
| tim@apple.dev | tim@apple.dev | Leasing Officer (legacy) | Parks — Ejecutivo Comercial |
| scott.forstall@apple.dev | tim@apple.dev | Gerente CxC (legacy) | Parks — CxC |
| jane.austen@apple.dev | tim@apple.dev | Catalina Moreno (Admin Legal) | Parks — Admin Legal |
| roberto.salinas@apple.dev | tim@apple.dev | Director Legal | Parks — Director Legal |
| patricia.nunez@apple.dev | tim@apple.dev | Subdirector Legal | Parks — Subdirector Legal |
| miguel.soto@apple.dev | tim@apple.dev | Abogado asignado | Parks — Abogado asignado |

## Usuarios @parksindustrial.com

| Email | Contraseña | Persona | Rol |
|---|---|---|---|
| israel.ramirez@parksindustrial.com | Parks2026!01 | Israel Ramírez | Parks — LO AAA Senior |
| uae@parksindustrial.com | Parks2026!02 | UAE | Parks — LO AAA Senior |
| bruyel@parksindustrial.com | Parks2026!03 | Bruyel | Parks — LO Estándar |
| director.financiero@parksindustrial.com | Parks2026!04 | Laura Fernández (CFO) | Parks — Miembro del Comité |
| director.operaciones@parksindustrial.com | Parks2026!05 | Ricardo Campos (Dir. Operaciones) | Parks — Miembro del Comité |
| claudia.rodriguez@parksindustrial.com | Parks2026!06 | Claudia Rodríguez | Parks — Gerente CxC |
| ejecutivo.cxc1@parksindustrial.com | Parks2026!07 | Ejecutivo CxC 1 | Parks — Ejecutivo CxC |
| ejecutivo.cxc2@parksindustrial.com | Parks2026!08 | Ejecutivo CxC 2 | Parks — Ejecutivo CxC |
| ejecutivo.cxc3@parksindustrial.com | Parks2026!09 | Ejecutivo CxC 3 | Parks — Ejecutivo CxC |
| jesus.gazon@parksindustrial.com | Parks2026!10 | Jesús Gazón | Parks — Contratos y Facturación |
| lilibeth.lopez@parksindustrial.com | Parks2026!11 | Lilibeth López | Parks — Admin Sistema |
| admin.parque.gdl@parksindustrial.com | Parks2026!12 | Admin Parque Guadalajara | Parks — Admin Parque |

## Accesos rápidos para el pitch

| Escenario | Usuario |
|---|---|
| Dashboard CEO / Asistente IA / Mis pendientes | jony.ive@apple.dev |
| Comité — voto CEO (empate Samsung) | jony.ive@apple.dev |
| Comité de Autorización (voto Dir. Comercial) / Asignación IA | phil.schiler@apple.dev |
| Voto CFO en comité | director.financiero@parksindustrial.com |
| Pipeline comercial (Leasing Officer) | tim@apple.dev |
| Legal (casos, checklist, cotejo IA) | jane.austen@apple.dev |
| CxC (dashboard, cartera) | claudia.rodriguez@parksindustrial.com |

## Miembros del Comité (votan en /parks/comite)

**Trío (voto ordinario — Aprueba / Rechaza / Se abstiene):**

1. Héctor Montelongo — Director Comercial — `phil.schiler@apple.dev`
2. Laura Fernández — Director Financiero — `director.financiero@parksindustrial.com`
3. Ricardo Campos — Director de Operaciones — `director.operaciones@parksindustrial.com`

**Voto CEO (parte del flujo cuando hay empate 1–1–1):**

4. Charles El-Mann Metta — CEO — `jony.ive@apple.dev` → **Aprobar / Rechazar** en el caso escalado (demo: Samsung)
