# Inventario Roles / Permisos — Parks Industrial

Fuente: `Parks_Industrial_Roles_Permisos_Cursor.md` (Julio 2026)

## Roles existentes (antes del cambio)

| Label en CRM | Código doc | Usuario demo | Password |
|---|---|---|---|
| Parks — CEO | CEO_Director_General | jony.ive@apple.dev | `tim@apple.dev` (sin cambio) |
| Parks — Director Comercial | Director_Comercial_CEM | phil.schiler@apple.dev | sin cambio |
| Parks — Ejecutivo Comercial | LO_* (legacy) | tim@apple.dev | sin cambio |
| Parks — Admin Legal | Admin_Legal | jane.austen@apple.dev | sin cambio |
| Parks — Director Legal | Director_Legal | roberto.salinas@apple.dev | sin cambio |
| Parks — Subdirector Legal | Subdirector_Legal | patricia.nunez@apple.dev | sin cambio |
| Parks — Abogado asignado | Abogado_Legal | miguel.soto@apple.dev | sin cambio |
| Parks — CxC | Gerente_CxC (legacy) | scott.forstall@apple.dev | sin cambio |

## Roles nuevos creados

| Label | Código | Usuarios demo nuevos | Password |
|---|---|---|---|
| Parks — LO AAA Senior | LO_AAA_Senior | israel.ramirez / uae @parksindustrial.com | Parks2026!01 / !02 |
| Parks — LO Estándar | LO_Estandar | bruyel@parksindustrial.com | Parks2026!03 |
| Parks — Miembro del Comité | Miembro_Comite | director.financiero / director.operaciones | Parks2026!04 / !05 |
| Parks — Gerente CxC | Gerente_CxC | claudia.rodriguez@parksindustrial.com | Parks2026!06 |
| Parks — Ejecutivo CxC | Ejecutivo_CxC | ejecutivo.cxc1–3 | Parks2026!07–09 |
| Parks — Contratos y Facturación | Contratos_Facturacion | jesus.gazon@… | Parks2026!10 |
| Parks — Admin Sistema | Admin_Sistema | lilibeth.lopez@… | Parks2026!11 |
| Parks — Admin Parque | Admin_Parque | admin.parque.gdl@… | Parks2026!12 |

## Cambios a roles existentes (alineación con doc)

Confirmados al implementar (pedido explícito: implementar + probar):

1. **CEO** → quitar acceso a `/parks/asignacion` (no puede asignar LOs). Conserva comité en modo lectura / empate; **ya no vota**.
2. **Director Legal** → quitar acceso a `/parks/comite` (no vota ni deliberada).
3. **Admin Legal** → quitar acceso a `/parks/cxc` (sin carteras de cobranza).
4. **Ejecutivo Comercial / LO** → quitar `/parks/valor-agregado` (reportes CEM); conserva comité Q&A/tracker sin voto.
5. **Asientos DEFAULT del comité** → CFO/Ops usan emails `director.financiero@` / `director.operaciones@` (ya no CEO ni Director Legal).
6. **UI voto comité** → solo si el email del viewer coincide con un asiento; sin impersonar el asiento `[0]`.

Aliases conservados (sin renombrar usuarios):

- `Parks — Ejecutivo Comercial` ≡ permisos LO
- `Parks — CxC` ≡ permisos Gerente CxC

Emails `@parksindustrial.com` del doc **no reemplazan** los `@apple.dev` ya usados en demos; se mantienen ambos mapeos.
