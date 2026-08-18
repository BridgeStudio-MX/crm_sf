# Inventario Roles / Permisos — Parks Industrial

Fuente: `Parks_Industrial_Roles_Permisos_Cursor.md` (Julio 2026)

## Roles existentes (antes del cambio)

| Label en CRM | Código doc | Usuario demo | Password |
|---|---|---|---|
| Parks — CEO | CEO_Director_General | ceo@prk.com.mx | parksindustrial2026! |
| Parks — Director Comercial | Director_Comercial_CEM | directorcomercial@prk.com.mx | parksindustrial2026! |
| Parks — Ejecutivo Comercial | LO_* (legacy label) | ejecutivocomercial@prk.com.mx | parksindustrial2026! |
| Parks — Admin Legal | Admin_Legal | adminlegal@prk.com.mx | parksindustrial2026! |
| Parks — Director Legal | Director_Legal | directorlegal@prk.com.mx | parksindustrial2026! |
| Parks — Subdirector Legal | Subdirector_Legal | subdirectorlegal@prk.com.mx | parksindustrial2026! |
| Parks — Abogado asignado | Abogado_Legal | abogado@prk.com.mx | parksindustrial2026! |
| Parks — CxC | Gerente_CxC (legacy) | gerentecxc@prk.com.mx | parksindustrial2026! |

## Roles nuevos creados

| Label | Código | Usuarios demo | Password |
|---|---|---|---|
| Parks — LO AAA Senior | LO_AAA_Senior | leasingofficeraaa@ / leasingofficeraaa2@prk.com.mx | parksindustrial2026! |
| Parks — LO Estándar | LO_Estandar | leasingofficer@prk.com.mx | parksindustrial2026! |
| Parks — Miembro del Comité | Miembro_Comite | cfo@ / directoroperaciones@prk.com.mx | parksindustrial2026! |
| Parks — Gerente CxC | Gerente_CxC | gerentecxc@prk.com.mx | parksindustrial2026! |
| Parks — Ejecutivo CxC | Ejecutivo_CxC | ejecutivocxc@ / ejecutivocxc2@ / ejecutivocxc3@prk.com.mx | parksindustrial2026! |
| Parks — Contratos y Facturación | Contratos_Facturacion | contratos@prk.com.mx | parksindustrial2026! |
| Parks — Admin Sistema | Admin_Sistema | adminsistema@prk.com.mx | parksindustrial2026! |
| Parks — Admin Parque | Admin_Parque | adminparque@prk.com.mx | parksindustrial2026! |

## Cambios a roles existentes (alineación con doc)

Confirmados al implementar (pedido explícito: implementar + probar):

1. **CEO** → sin acceso a `/parks/asignacion` (no asigna LOs). **Sí vota en Comité**: Aprueba / Rechaza como parte del flujo de votación cuando hay empate (1–1–1) o escalamiento. No ocupa asiento permanente del trío; su voto rompe el empate y resuelve el expediente (`Aprobado — decisión CEO` / `Rechazado — decisión CEO`).
2. **Director Legal** → quitar acceso a `/parks/comite` (no vota ni deliberada).
3. **Admin Legal** → quitar acceso a `/parks/cxc` (sin carteras de cobranza).
4. **Valor agregado** → menú `/parks/valor-agregado` oculto en todas las sesiones (sin acceso por rol).
5. **Asientos DEFAULT del comité (trío)** → Dir. Comercial + CFO + Ops (`directorcomercial@` / `cfo@` / `directoroperaciones@prk.com.mx`). El CEO no reemplaza un asiento; entra al voto cuando el trío empata.
6. **UI voto comité** → asientos del trío votan si el email coincide; CEO ve **Tu voto · CEO** (Aprobar / Rechazar) en casos `Empate — escalar`.

### Quién vota en `/parks/comite`

| Rol | Cómo vota |
|---|---|
| Parks — Director Comercial | Asiento 1 del trío (Aprueba / Rechaza / Se abstiene) |
| Parks — Miembro del Comité (CFO / Ops) | Asientos 2 y 3 del trío |
| Parks — CEO | Voto ejecutivo Aprueba / Rechaza cuando el trío empata (parte del flujo de resolución) |
| LO / otros | Solo lectura + Q&A (sin voto) |

Aliases conservados (sin renombrar roles):

- `Parks — Ejecutivo Comercial` ≡ permisos LO
- `Parks — CxC` ≡ permisos Gerente CxC

Los correos `@apple.dev` de Twenty se conservan solo como **alias de menú** por si alguien entra con una sesión vieja. El login de demo es `@prk.com.mx` / `parksindustrial2026!`. Lista: [USUARIOS_DEMO.md](./USUARIOS_DEMO.md).
