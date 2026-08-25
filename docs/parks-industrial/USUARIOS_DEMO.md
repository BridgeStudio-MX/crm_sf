# Usuarios demo — Parks Industrial CRM

Credenciales para que cada área entre a **su** vista del demo.

## Fuente de verdad (no es la DB)

**No copies la base de datos local ↔ producción.** Son instancias distintas
(datos de deals, IDs, etc.). Lo que debe coincidir en ambos entornos son los
**logins demo**, y esos viven en código:

`parks-twenty-service/src/metadata/parks-demo-users.constants.ts`

| Entorno | Cómo se aplican |
| --- | --- |
| **Local** | Con Twenty corriendo (`yarn start`): `cd parks-twenty-service && npm run bootstrap:local` |
| **Producción** | Automático en cada deploy (job `parks-bootstrap`) |

Ese comando renombra/crea los `@prk.com.mx` y asigna roles Parks. Puedes
correrlo las veces que quieras (idempotente).

## Contraseña (la misma para todos)

```
parksindustrial2026!
```

En Continuar con email: pega el correo del puesto → **Iniciar sesión** (no Registrarse) → esa contraseña.

`tim@apple.dev` / `tim@apple.dev` sigue siendo solo el admin técnico de Twenty en local. No se lo pases a las áreas.

## Logins por puesto

| Área | Email | Rol en el CRM |
|---|---|---|
| Dirección general | `ceo@prk.com.mx` | Parks — CEO |
| Comercial | `directorcomercial@prk.com.mx` | Parks — Director Comercial |
| Comercial | `ejecutivocomercial@prk.com.mx` | Parks — Ejecutivo Comercial |
| Leasing | `leasingofficeraaa@prk.com.mx` | Parks — LO AAA Senior |
| Leasing | `leasingofficeraaa2@prk.com.mx` | Parks — LO AAA Senior |
| Leasing | `leasingofficer@prk.com.mx` | Parks — LO Estándar |
| Legal | `adminlegal@prk.com.mx` | Parks — Admin Legal |
| Legal | `directorlegal@prk.com.mx` | Parks — Director Legal |
| Legal | `subdirectorlegal@prk.com.mx` | Parks — Subdirector Legal |
| Legal | `abogado@prk.com.mx` | Parks — Abogado asignado |
| Comité | `cfo@prk.com.mx` | Parks — Miembro del Comité |
| Comité | `directoroperaciones@prk.com.mx` | Parks — Miembro del Comité |
| CxC | `gerentecxc@prk.com.mx` | Parks — Gerente CxC |
| CxC | `ejecutivocxc@prk.com.mx` | Parks — Ejecutivo CxC |
| CxC | `ejecutivocxc2@prk.com.mx` | Parks — Ejecutivo CxC |
| CxC | `ejecutivocxc3@prk.com.mx` | Parks — Ejecutivo CxC |
| Operación | `contratos@prk.com.mx` | Parks — Contratos y Facturación |
| Sistema | `adminsistema@prk.com.mx` | Parks — Admin Sistema |
| Parque | `adminparque@prk.com.mx` | Parks — Admin Parque |

## Accesos rápidos para el pitch

| Escenario | Usuario |
|---|---|
| Dashboard CEO / Asistente IA / Mis pendientes | `ceo@prk.com.mx` |
| Comité — voto CEO (empate Samsung) | `ceo@prk.com.mx` |
| Comité de Autorización (voto Dir. Comercial) / Asignación IA | `directorcomercial@prk.com.mx` |
| Voto CFO en comité | `cfo@prk.com.mx` |
| Pipeline comercial (Leasing Officer) | `leasingofficeraaa@prk.com.mx` |
| Legal (casos, checklist, cotejo IA) | `adminlegal@prk.com.mx` |
| CxC (dashboard, cartera) | `gerentecxc@prk.com.mx` |

## Miembros del Comité (votan en /parks/comite)

**Trío (voto ordinario — Aprueba / Rechaza / Se abstiene):**

1. Director Comercial — `directorcomercial@prk.com.mx`
2. Director Financiero (CFO) — `cfo@prk.com.mx`
3. Director de Operaciones — `directoroperaciones@prk.com.mx`

**Voto CEO (cuando hay empate 1–1–1):**

4. CEO — `ceo@prk.com.mx` → **Aprobar / Rechazar** en el caso escalado (demo: Samsung)
