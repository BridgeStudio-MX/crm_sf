# Parks Industrial — Área Legal
## Flujo Completo + Historias de Usuario para implementación en CRM
### Documento técnico para Cursor

---

## CONTEXTO GENERAL

Este documento define el flujo completo del área legal de Parks Industrial para su implementación en el CRM. El sistema ya tiene construida la validación de que **ningún proceso legal puede iniciar sin una Hoja de Acuerdos (LOI) firmada y registrada**. Este documento extiende ese punto de entrada con todos los flujos del área legal.

El modelo de negocio es **renta de naves industriales** con contratos de largo plazo (3-10+ años), lo que significa que el área legal no solo gestiona contratos nuevos sino un portafolio activo de renovaciones, modificaciones y terminaciones anticipadas de forma paralela y permanente.

---

## ROLES DEL ÁREA LEGAL

```
Director Legal
└── Subdirector Legal
    └── Catalina Moreno Monroy (Coordinadora Legal / Admin del módulo)
        ├── Abogado 1
        ├── Abogado 2
        └── Abogado N (asignados por caso)

Director General (Charles El-Mann Metta) — aprueba en flujo de firmas
Representantes FUNO / NEXT — externos, firman contratos de propiedades FUNO
```

**Regla de negocio — acceso al sistema:**
- Catalina es la única que sube, modifica y elimina documentos
- Los abogados ven y actualizan únicamente sus casos asignados
- Director Legal, Subdirector y CEO tienen acceso de modificación pero en la práctica no operan el sistema
- CxC y Comercial tienen visibilidad de lectura sobre el estatus del contrato, no pueden modificar

---

## OBJETOS DEL SISTEMA (CUSTOM)

### Objeto: Caso_Legal__c
```
Campos:
- oportunidad (relación → Opportunity) ← ya existe en el sistema
- hoja_de_acuerdos (relación → Hoja_de_Acuerdos__c) ← ya existe en el sistema
- tipo_documento (lista): 
    "Contrato de arrendamiento" / 
    "Convenio de renovación" / 
    "Convenio modificatorio de aclaración" / 
    "Convenio de terminación anticipada" /
    "Build-to-suit"
- inquilino (relación → Account)
- nave (relación → Nave__c)
- parque (relación → Parque__c)
- es_propiedad_funo (boolean, heredado de Nave__c) ← CRÍTICO
- abogado_asignado (relación → User)
- fecha_recepcion_loi (fecha) ← inicio del SLA
- sla_dias_total (número, auto según tipo_documento)
- sla_dias_transcurridos (número, calculado)
- sla_dias_restantes (número, calculado)
- fecha_limite_sla (fecha, calculada)
- estatus_semaforo (lista): "Azul / Naranja / Amarillo / Rojo / Verde / Cerrado"
- estatus_caso (lista): 
    "Asignado" / 
    "Documentación incompleta" / 
    "En elaboración" / 
    "Primera versión enviada" / 
    "En revisión con cliente" / 
    "Versión final enviada" / 
    "En espera de firma del cliente" / 
    "En cotejo" / 
    "En flujo de firmas internas" / 
    "Enviado a FUNO/NEXT" / 
    "Firmado — cerrado" / 
    "Cancelado"
- sla_pausado (boolean) ← se pausa cuando hay documentación incompleta
- fecha_pausa_sla (fecha)
- motivo_pausa (texto)
- version_actual (número, auto-incrementa)
- notas_internas (texto largo)
- requiere_convenio_confidencialidad (boolean)
```

### Objeto: Checklist_Documentacion__c
```
Campos (todos boolean + fecha de recepción):
- acta_constitutiva (boolean)
- acta_constitutiva_fecha (fecha)
- poder_notarial (boolean)
- poder_notarial_fecha (fecha)
- poder_notarial_vigente (boolean) ← el abogado debe verificar que no esté revocado
- comprobante_domicilio (boolean)
- comprobante_domicilio_fecha (fecha)
- ine_representante (boolean)
- ine_representante_fecha (fecha)
- csf_constancia_situacion_fiscal (boolean)
- csf_fecha (fecha)
- constancia_cumplimiento_obligaciones (boolean)
- constancia_cumplimiento_fecha (fecha)
- estados_financieros_obligado (boolean)
- estados_financieros_fecha (fecha)
- garantia_tipo (lista): "Depósito / Carta de crédito / Fianza / Garantía corporativa / Sin garantía"
- garantia_documento (boolean)
- garantia_fecha (fecha)
- convenio_confidencialidad_requerido (boolean) ← algunos clientes lo piden
- convenio_confidencialidad_firmado (boolean)
- checklist_completo (fórmula boolean: todos los obligatorios = true)
- completado_por (relación → User)
- fecha_completado (fecha)
```

### Objeto: Version_Documento__c
```
Campos:
- caso_legal (relación → Caso_Legal__c)
- numero_version (número auto-incrementa, ej: V1, V2, V3)
- fecha_generacion (fecha)
- generado_por (relación → User → abogado)
- fecha_envio_cliente (fecha)
- enviado_por (relación → User)
- fecha_respuesta_cliente (fecha)
- respuesta_cliente (lista): "Acepta / Solicita cambios / Sin respuesta"
- cambios_solicitados (texto largo, visible si respuesta = Solicita cambios)
- cambios_son_aceptables (boolean, lo evalúa el abogado)
- requiere_escalamiento (boolean, si cambios no son estándar)
- documento_adjunto (archivo)
- es_version_final (boolean)
- notas (texto)
```

### Objeto: Flujo_Firmas__c
```
Campos:
- caso_legal (relación → Caso_Legal__c)
- orden (número: 1, 2, 3, 4)
- firmante_nombre (texto)
- firmante_rol (lista): 
    "Subdirector Legal" / 
    "Director General" / 
    "Apoderado FUNO 1" / 
    "Apoderado FUNO 2" / 
    "Director Jurídico NEXT"
- es_interno (boolean)
- fecha_envio (fecha)
- fecha_firma (fecha)
- estatus (lista): "Pendiente / Firmado / Rechazado"
- comentarios (texto)
```

### Objeto: Acta_Restitucion__c
```
Campos:
- caso_legal (relación → Caso_Legal__c)
- inquilino (relación → Account)
- nave (relación → Nave__c)
- fecha_salida_cliente (fecha)
- fecha_recepcion_acta (fecha)
- dias_retraso_acta (número calculado: fecha_recepcion - fecha_salida)
- estado_nave (lista): "Excelente / Bueno / Con desperfectos / Daños mayores"
- descripcion_desperfectos (texto largo)
- decision_deposito (lista): 
    "Devolver 100% / 
    Devolver parcial / 
    Retener 100% / 
    Aplicar a adeudos"
- porcentaje_devolucion (número, si aplica)
- monto_deposito_original (moneda)
- monto_a_devolver (moneda, calculado)
- monto_a_retener (moneda, calculado)
- justificacion_retencion (texto)
- aprobado_por_comercial (boolean)
- aprobado_por (relación → User)
- fecha_aprobacion (fecha)
- acta_firmada_cliente (boolean)
- documento_acta (archivo adjunto)
```

---

## TIPOS DE DOCUMENTO Y SUS SLAs

```
TIPO 1: Contrato de arrendamiento (cliente nuevo)
  SLA: 60 días hábiles
  Inicia: al recibir Hoja de Acuerdos firmada
  
TIPO 2: Convenio modificatorio de renovación
  SLA: 45 días hábiles
  Inicia: al recibir Hoja de Acuerdos de renovación firmada
  
TIPO 3: Convenio modificatorio de aclaración
  SLA: Variable (urgente: 10 días / normal: 20 días)
  Inicia: al recibir solicitud de modificación
  No requiere Hoja de Acuerdos — inicia directamente desde Legal o Comercial
  
TIPO 4: Convenio de terminación anticipada
  SLA: Variable según negociación
  Inicia: al recibir solicitud formal del cliente
  
TIPO 5: Build-to-suit
  SLA: 90 días hábiles
  Inicia: al recibir Hoja de Acuerdos firmada
  Incluye: anexos técnicos de construcción firmados por Tenant/PHH
```

---

## FLUJO PRINCIPAL — CONTRATO DE ARRENDAMIENTO NUEVO

### Flujo completo

```
[PUNTO DE ENTRADA — ya validado en el sistema]
Hoja de Acuerdos marcada como "Firmada" en el módulo comercial
Checklist de documentación del cliente al 100%
        ↓
TRIGGER AUTOMÁTICO:
  - Sistema crea Caso_Legal con tipo = "Contrato de arrendamiento"
  - SLA inicializado: 60 días hábiles desde hoy
  - Fecha límite SLA calculada automáticamente (excluye sábados y domingos)
  - Estatus semáforo: 🔵 Azul
  - Notificación a Catalina: "Nuevo caso legal — [Empresa] / [Nave] / [Parque]"
  
[PASO 1 — ASIGNACIÓN DE ABOGADO]
Catalina recibe el caso en su dashboard
Catalina revisa carga de trabajo de cada abogado (visible en el sistema)
Catalina asigna el caso a un abogado específico
Sistema notifica al abogado asignado: "Nuevo caso asignado — [Empresa]"
Caso pasa a estatus: "Asignado"
        ↓
[PASO 2 — VERIFICACIÓN DE DOCUMENTACIÓN]
El abogado asignado revisa el checklist de documentación
Documentos adjuntos desde el módulo comercial (ya subidos por el LO)

¿Documentación completa y correcta?
  ├── NO → Ver Flujo B: Documentación incompleta
  └── SÍ → Continuar
        ↓
[PASO 3 — VERIFICACIÓN ESPECIAL: CONVENIO DE CONFIDENCIALIDAD]
¿El cliente requiere NDA previo para compartir documentación?
  ├── SÍ → 
  │     El abogado crea un mini-flujo de NDA:
  │     Genera convenio de confidencialidad estándar
  │     Lo envía al cliente para firma
  │     SLA se pausa hasta recibir NDA firmado
  │     Al recibir NDA: SLA se reanuda, se adjunta al expediente
  └── NO → Continuar
        ↓
[PASO 4 — ELABORACIÓN DEL BORRADOR]
Abogado elabora el borrador del contrato
Sistema genera plantilla base del contrato con los datos de la Hoja de Acuerdos:
  - Razón social del inquilino (desde la cuenta)
  - Nave y parque (desde los objetos vinculados)
  - M², precio/m², renta mensual
  - Plazo, período de gracia, depósito, rentas adelantadas
  - Escalación (INPC o porcentaje fijo)
  - Condiciones especiales (desde la Hoja de Acuerdos)
  
El abogado revisa, ajusta y completa el contrato
Abogado crea registro de Version_Documento V1
Caso pasa a estatus: "En elaboración"
        ↓
[PASO 5 — PRIMERA VERSIÓN AL CLIENTE]
Abogado marca la versión V1 como "Enviada al cliente"
Sistema registra fecha de envío automáticamente (MÉTRICA CLAVE para SLA)
Caso pasa a estatus: "Primera versión enviada"
Estatus semáforo: 🟠 Naranja
Tarea automática al abogado: "Seguimiento de versión enviada — 5 días hábiles"

¿El cliente responde dentro de los 5 días hábiles?
  ├── NO → Tarea de recordatorio automática
  │         Si pasan 10 días sin respuesta: escalamiento al LO de Comercial 
  │         para que contacte al cliente
  └── SÍ → Ver respuesta del cliente
        ↓
¿Qué responde el cliente?
  ├── ACEPTA sin cambios → Ir a Paso 6 (Cotejo)
  └── SOLICITA CAMBIOS →
        Abogado evalúa los cambios solicitados:
        ¿Son aceptables bajo el compliance de Parks Industrial?
          ├── SÍ, son menores → Abogado incorpora y genera V2
          │                      Repite Paso 5 con nueva versión
          ├── SÍ, pero son significativos → 
          │   Requieren validación de Subdirector o Director Legal
          │   Abogado marca "Requiere escalamiento"
          │   Director Legal revisa y aprueba o rechaza los cambios
          │   Si aprueba: se incorporan y se genera nueva versión
          │   Si rechaza: se negocia con el cliente a través de Comercial
          └── NO son aceptables → 
              Se regresa a Comercial para renegociar con el cliente
              Caso vuelve a estatus "En elaboración" 
              SLA continúa corriendo
        ↓
[NÚMERO DE VERSIONES: sin límite, pero cada ronda consume SLA]
El sistema trackea: cuántas versiones hubo, cuánto tiempo tomó cada ronda
        ↓
[PASO 6 — COTEJO DE LA VERSIÓN FIRMADA POR EL CLIENTE]
REQUISITO PREVIO: El cliente debe firmar físicamente antes que Parks Industrial

El cliente firma físicamente el contrato y lo envía de regreso
Catalina recibe el contrato físico firmado por el cliente
        ↓
Catalina realiza el COTEJO:
  Comparación física: versión impresa firmada = ¿última versión digital enviada?
  
¿Las versiones coinciden exactamente?
  ├── NO → 
  │     Catalina registra las discrepancias en el sistema
  │     Se regresa al cliente para corrección o reimpresión
  │     El proceso no puede continuar hasta recibir la versión correcta firmada
  └── SÍ → 
        Catalina marca cotejo como "Aprobado" en el sistema
        Catalina aplica sello de jurídico (físico)
        Catalina registra en el sistema: fecha de recepción firmado + cotejo aprobado
        Caso pasa a estatus: "En flujo de firmas internas"
        ↓
[PASO 7 — FLUJO DE FIRMAS INTERNAS]
El sistema activa el flujo de firmas en cadena:

FIRMA 1 — Subdirector Legal
  Sistema notifica al Subdirector: "Contrato listo para su rúbrica — [Empresa]"
  El Subdirector rubrica físicamente
  Catalina registra en el sistema: fecha de rúbrica del Subdirector
  
FIRMA 2 — Director General (Charles El-Mann Metta)
  Sistema notifica al CEO: "Contrato listo para primera rúbrica — [Empresa]"
  El CEO rubrica físicamente
  Catalina registra en el sistema: fecha de rúbrica del CEO
  
¿Es propiedad de FUNO/FinSA?
  ├── NO (propiedad propia) → Ir a Paso 8 (Cierre)
  └── SÍ → 
        FIRMAS 3 y 4 — Representantes FUNO/NEXT
        Catalina envía el contrato físicamente a los representantes de FUNO/NEXT
        Sistema registra: fecha de envío a FUNO/NEXT
        Los representantes (2 apoderados + director jurídico) firman
        Catalina recibe de vuelta con todas las firmas
        Sistema registra: fecha de recepción firmado por FUNO/NEXT
        ↓
[PASO 8 — CIERRE DEL CONTRATO]
Catalina marca el caso como "Firmado — cerrado"
Catalina sube el contrato firmado como documento final al expediente
Catalina abre y alimenta el expediente digital del cliente:
  - Contrato firmado (PDF)
  - Documentación del cliente
  - Historial de versiones
  - Notas del proceso
        ↓
TRIGGER AUTOMÁTICO DE CIERRE:
Sistema dispara simultáneamente:
  1. Notificación a Comercial (LO y CEM):
     "Contrato firmado — [Empresa] / [Nave] / [Parque]
      Renta mensual: [monto] | Inicio: [fecha] | Vencimiento: [fecha]
      Contacto del cliente: [nombre] [correo] [teléfono]"
  2. Notificación a CxC (Claudia):
     "Nuevo inquilino activo — [Empresa]
      Datos de contacto: [nombre] [correo] [teléfono] ← CRÍTICO
      Nave: [nave] | Parque: [parque] | Moneda: [MXN/USD]
      Renta mensual: [monto] | Depósito: [meses] | Rentas adelantadas: [meses]
      Período de gracia: [meses] | Escalación: [INPC/fijo] | Plazo: [meses]"
  3. Notificación a Contratos/Facturación (Jesús):
     "Alta de contrato — [Empresa]
      Inicio: [fecha] | Períodos de gracia: [meses] | Primera factura: [fecha]
      Escalación INPC en: [fecha próxima escalación]"
  4. Notificación a Tenant:
     "Coordinar entrega de nave — [Empresa] / [Nave] / [Parque]
      Fecha inicio contrato: [fecha]"
  5. Notificación a Administrador del Parque:
     "Nuevo inquilino: [Empresa] | Nave: [nave] | Inicio: [fecha]"
  6. Motor de comisiones activado:
     Si nave.es_propiedad_funo = false → calcular comisión LO + broker (si aplica)
     Si nave.es_propiedad_funo = true → registrar como operación FUNO sin comisión interna
  7. Nave pasa a estatus "Rentada" en el inventario
  8. Oportunidad en Comercial marcada como "Ganada — Contrato firmado"
  9. Caso Legal marcado como "Cerrado"
  10. Semáforo: 🟢 Verde → automáticamente archivado del dashboard activo
```

---

## FLUJO B — DOCUMENTACIÓN INCOMPLETA

```
[TRIGGER]
Abogado detecta que el checklist de documentación tiene ítems pendientes
O que un documento enviado tiene errores / está vencido / no tiene las facultades correctas
        ↓
Abogado registra en el sistema cuáles documentos faltan o tienen error
Caso pasa a estatus: "Documentación incompleta"
Sistema pausa el contador del SLA ← CRÍTICO
Sistema registra fecha de inicio de pausa y motivo
        ↓
Sistema notifica automáticamente al LO de Comercial:
  "⚠️ Documentación incompleta — [Empresa]
   Documentos faltantes/erróneos:
   - [ítem 1]: [descripción del error o faltante]
   - [ítem 2]: [descripción]
   Plazo para entregar: 5 días hábiles"
        ↓
El LO gestiona con el cliente la documentación faltante
El LO sube los documentos al checklist del caso legal
        ↓
¿LO entrega documentación en 5 días hábiles?
  ├── SÍ → 
  │     Abogado verifica que los nuevos documentos son correctos
  │     Si son correctos: 
  │       Caso pasa a "Asignado" de nuevo
  │       SLA se reanuda (no se reinicia — continúa desde donde se pausó)
  │       Sistema registra total de días pausados como dato de métrica
  └── NO →
        Alerta automática al CEM: "Documentación de [Empresa] sigue pendiente — 5 días sin entrega"
        Si pasan 10 días: alerta al Director Legal
        Si pasan 15 días: alerta al CEO
        El SLA permanece pausado hasta que se complete la documentación

REGLA CLAVE: El SLA de Legal no corre mientras la pausa está activa.
Los días de pausa por documentación incompleta son responsabilidad de Comercial, no de Legal.
```

---

## FLUJO C — RENOVACIÓN (CONVENIO MODIFICATORIO)

```
[PUNTO DE ENTRADA — desde el módulo de alertas de renovación]
Alerta automática generada por el sistema cuando un contrato vence en 12 meses
  → Se crea Oportunidad de Renovación en Comercial
  → Comercial negocia con el cliente
  → Se genera Hoja de Acuerdos de Renovación
  → Hoja de Acuerdos firmada → TRIGGER para Legal
        ↓
Sistema crea Caso_Legal con:
  tipo = "Convenio de renovación"
  SLA = 45 días hábiles (no 60)
  Referencia al contrato original activo
  Estatus semáforo: 🔵 Azul
        ↓
[PASO 1 — ASIGNACIÓN]
Catalina asigna abogado
Sistema muestra la carga de trabajo de cada abogado para facilitar la decisión
Preferencia: el mismo abogado que trabajó el contrato original del cliente (si disponible)
        ↓
[PASO 2 — VERIFICACIÓN DE DOCUMENTACIÓN]
Para renovaciones la documentación es simplificada:
  - Si el cliente no cambió representante legal: no se pide acta ni poder de nuevo
  - Si hubo cambio de representante: se pide nuevo poder + INE del nuevo rep
  - La CSF se actualiza si el cliente tiene más de 1 año con el RFC en el sistema
  - Se verifica que no haya adeudos activos con CxC antes de proceder
  
VALIDACIÓN CRÍTICA: 
  ¿El cliente tiene adeudos activos en CxC?
  ├── SÍ → Sistema alerta al Director Legal y al CEM
  │         No se puede renovar a un cliente con adeudos sin autorización de dirección
  │         Si dirección autoriza (con condiciones de pago): se continúa
  └── NO → Continuar normalmente
        ↓
[PASO 3 — ELABORACIÓN DEL CONVENIO DE RENOVACIÓN]
El convenio referencia el contrato original
Incluye las nuevas condiciones: plazo, renta, escalación, período de gracia (si hubo negociación)
El sistema auto-completa con los datos de la Hoja de Acuerdos de renovación
        ↓
[PASOS 4-8: IGUAL AL FLUJO PRINCIPAL]
Versiones → Cotejo → Firmas internas → Cierre
Con la diferencia del SLA (45 días vs 60)
        ↓
[AL CERRAR LA RENOVACIÓN]
Sistema actualiza el contrato original con la nueva fecha de vencimiento
Sistema calcula y registra la próxima alerta de renovación (12 meses antes del nuevo vencimiento)
Notificación a Jesús/Facturación para actualizar condiciones en Oracle (nueva renta, nuevo plazo, próxima escalación)
Notificación a CxC de las nuevas condiciones del contrato

CASO ESPECIAL — Contrato ya vencido al llegar a Legal:
  Si la Hoja de Acuerdos llega cuando el contrato ya está vencido:
  → El SLA de 45 días inicia desde HOY (fecha de Hoja de Acuerdos)
  → El cliente permanece en holdover ACTIVO durante el proceso de renovación
  → Sistema mantiene alerta de holdover activo hasta que el convenio esté firmado
  → Al firmar: holdover se cierra, facturas de holdover emitidas pasan a negociación de condonación
```

---

## FLUJO D — CONVENIO MODIFICATORIO DE ACLARACIÓN

```
[CUÁNDO APLICA]
El cliente necesita modificar una cláusula sin ampliar renta ni vigencia:
  - Aclaración de domicilio
  - Cambio de representante legal
  - Corrección de RFC o razón social
  - Ajuste de descripción de la nave
  - Cualquier cambio no comercial
        ↓
[PUNTO DE ENTRADA]
El cliente o Comercial contacta a Legal directamente (sin Hoja de Acuerdos comercial)
Legal puede iniciar este flujo sin pasar por el módulo comercial
        ↓
Sistema crea Caso_Legal con:
  tipo = "Convenio modificatorio de aclaración"
  SLA = urgente (10 días) o normal (20 días) según criterio del Director Legal
  Vinculado al contrato activo del cliente
        ↓
Abogado elabora el modificatorio
Flujo de firmas igual al principal:
  Subdirector → Director General → FUNO/NEXT (si aplica)
        ↓
Al cerrar: 
  Actualización de los datos del cliente en el sistema
  Sin cambios en comisiones
  Sin notificación a CxC (a menos que el modificatorio afecte datos de facturación)
```

---

## FLUJO E — CONVENIO DE TERMINACIÓN ANTICIPADA

```
[CUÁNDO APLICA]
El cliente quiere salir antes de que venza su contrato
Puede ser por: cambio de operación, quiebra, traslado, expansión a otro proveedor, etc.
        ↓
[PUNTO DE ENTRADA]
El LO recibe la solicitud del cliente y la registra en el sistema
El sistema notifica a Legal y abre un Caso_Legal tipo "Terminación anticipada"
        ↓
[PASO 1 — EVALUACIÓN LEGAL]
Abogado revisa el contrato vigente:
  - ¿Tiene cláusula de terminación anticipada?
  - ¿Cuál es la penalización pactada?
  - ¿Cuántos meses faltan para el vencimiento natural?
  - ¿El cliente tiene adeudos activos?
        ↓
Sistema calcula automáticamente:
  Penalización sugerida = [fórmula según cláusula del contrato]
  Adeudos activos = [dato de CxC vía integración]
  Meses restantes del contrato
        ↓
[PASO 2 — NEGOCIACIÓN DE PENALIZACIÓN]
Abogado presenta al Director Legal los términos
¿El Director General puede condonar parte o toda la penalización?
  ├── SÍ, pero requiere negociación → 
  │     LO o Director Comercial negocia con el cliente
  │     Si hay condonación parcial/total: requiere aprobación del CEO
  │     CEO aprueba en el sistema (flujo de aprobación)
  └── NO hay condonación → Se notifica al cliente la penalización completa
        ↓
[PASO 3 — ELABORACIÓN DEL CONVENIO]
Abogado elabora el convenio de terminación
Incluye: fecha efectiva de salida, penalización acordada, condiciones de devolución de la nave
        ↓
[PASO 4 — FLUJO DE FIRMAS]
Mismo flujo que el contrato principal
        ↓
[PASO 5 — COORDINACIÓN DE ENTREGA DE LA NAVE]
Al firmar el convenio:
  Sistema notifica a Tenant: "Coordinar acta de restitución — [Empresa] / [Nave]"
  Sistema notifica a CxC: "Cliente [Empresa] sale el [fecha] — preparar proceso de adeudos y depósito"
  Sistema notifica a Facturación (Jesús): "Congelar facturación de [Empresa] a partir de [fecha]"
  Sistema notifica al Administrador del Parque
        ↓
[PASO 6 — ACTA DE RESTITUCIÓN]
Tenant levanta el acta con el estado de la nave
Tenant sube el acta al sistema (Acta_Restitucion__c)
Catalina recibe y procesa el acta:
  - Evalúa estado del inmueble
  - Define decisión del depósito en garantía (con Comercial y dirección)
  - Sistema calcula: monto a devolver / monto a retener / aplicar a adeudos
        ↓
Cuando el acta está procesada:
  CxC recibe notificación con decisión del depósito
  Nave pasa a estatus "Disponible" en el inventario
  Sistema verifica si hay oportunidades perdidas por falta de disponibilidad de esa nave → reactivación
  Jesús recibe instrucción de emitir últimas facturas pendientes o cancelar facturas posteriores a la fecha de salida
```

---

## FLUJO F — HOLDOVER (CONTRATO VENCIDO SIN RENOVACIÓN)

```
[TRIGGER AUTOMÁTICO]
fecha_hoy >= contrato.fecha_vencimiento 
AND convenio_renovacion.estatus != "Firmado"
        ↓
Sistema activa HOLDOVER:
  - Contrato pasa a estatus "Holdover activo"
  - Semáforo: 🔴 Rojo
  - Alerta simultánea a: Legal (Catalina + Director), Comercial (LO + CEM), CxC (Claudia)
  - Notificación a Jesús/Facturación para emitir factura de holdover (doble de la renta)
        ↓
Sistema registra:
  - Fecha de inicio del holdover
  - Monto de renta normal
  - Monto de holdover (doble)
  - Facturas de holdover emitidas (se actualizan automáticamente)
        ↓
El cliente permanece en la nave durante el holdover (sigue operando y pagando)
CxC da seguimiento del cobro del holdover como cualquier otra factura
        ↓
MEDIDAS DE PRESIÓN (autorizadas por el Director General):
  Nivel 1: Factura de holdover emitida → CxC notifica al cliente
  Nivel 2: Si no hay Hoja de Acuerdos en 30 días → 
            Sistema sugiere corte de servicios al Director General para su aprobación
  Nivel 3: Si el DG aprueba → 
            Notificación al Administrador del Parque para ejecutar corte de agua y acceso
            Estas acciones quedan registradas en el caso con fecha y responsable
        ↓
¿Se firma el convenio de renovación durante el holdover?
  ├── SÍ → 
  │     Holdover se cierra
  │     Sistema marca la fecha de cierre del holdover
  │     Facturas de holdover: el DG decide si se condonan o se cobran
  │     Si se condonan: flujo de nota de crédito con aprobación de dirección
  │     Si se cobran: CxC da seguimiento de cobro normalmente
  └── NO (el cliente decide salir) →
        Abrir Flujo E: Terminación anticipada
        En este caso el holdover acumulado puede ser parte de la negociación de penalización
```

---

## FLUJO G — PROPIEDAD FUNO / FinSA (FLUJO DIFERENCIADO)

```
IDENTIFICADOR: nave.es_propiedad_funo == true
        ↓
Este flag activa diferencias en los siguientes puntos:

1. FLUJO DE FIRMAS EXTENDIDO:
   Además de las firmas internas (Subdirector + DG), se requieren:
   - Firma de Apoderado Legal FUNO 1
   - Firma de Apoderado Legal FUNO 2
   - Firma de Director Jurídico NEXT
   Catalina envía físicamente el contrato a los representantes de FUNO/NEXT
   Sistema registra: fecha de envío + fecha de recepción de regreso

2. EXPEDIENTE FÍSICO:
   Los expedientes físicos de contratos FUNO los guarda FUNO, no Parks Industrial
   Catalina envía el expediente a FUNO para su archivo
   Sistema registra que el expediente físico está en FUNO (no en las oficinas de Parks)
   Catalina guarda copia digital en el sistema

3. COMISIONES:
   Las operaciones en propiedades FUNO NO generan comisión interna
   Sistema automáticamente marca la comisión como "No aplica — Propiedad FUNO"
   El registro queda para efectos de reporte pero sin monto de comisión

4. REPORTES MENSUALES A FUNO:
   Todas las renovaciones y contratos de propiedades FUNO se reportan mensualmente a FUNO
   Sistema genera automáticamente el reporte mensual de operaciones FUNO
   Catalina lo descarga y lo envía a FUNO en los primeros 5 días de cada mes
```

---

## FLUJO H — JUNTA QUINCENAL DE RENOVACIONES

```
[AUTOMATIZACIÓN QUINCENAL]
Cada 15 días (lunes), antes de la junta:
  Sistema genera automáticamente el reporte de renovaciones activas con:
    - Todos los contratos en pipeline de renovación
    - Estatus de cada caso (semáforo)
    - SLA transcurrido vs disponible por caso
    - Días sin actividad por caso
    - Alertas de contratos ya vencidos (holdover)
    - Próximos contratos a vencer en los siguientes 90 días
        ↓
El reporte se envía automáticamente a: Catalina, Director Legal, CEM, CEO
        ↓
Durante la junta:
  El Director revisa el dashboard en pantalla
  Se asignan nuevos responsables de Comercial para casos sin actividad
  Se toman decisiones sobre holdovers y condonaciones
  Las decisiones se registran en el sistema durante la junta o post-junta
        ↓
Post-junta:
  Catalina actualiza los estatus en el sistema según las decisiones tomadas
  El sistema envía notificaciones a los LOs asignados con las instrucciones del Director
```

---

## HISTORIAS DE USUARIO — ÁREA LEGAL

**US-LEG-001**
```
COMO Catalina (Admin Legal)
QUIERO recibir una notificación inmediata cuando llegue un caso legal nuevo
PARA asignarlo a un abogado en el menor tiempo posible y no consumir días del SLA

Criterios de aceptación:
- Recibo notificación en el sistema y por correo cuando una Hoja de Acuerdos se marca como firmada
- La notificación incluye: empresa, nave, parque, tipo de contrato, fecha de inicio del SLA
- Veo la carga de trabajo actual de cada abogado para decidir la asignación
- Al asignar, el abogado recibe notificación inmediata
- El SLA empieza a correr desde el momento en que se crea el caso, no desde la asignación
```

**US-LEG-002**
```
COMO Abogado asignado
QUIERO ver toda la información de la Hoja de Acuerdos y los documentos del cliente
PARA elaborar el borrador sin tener que pedirle información a nadie

Criterios de aceptación:
- Al entrar a mi caso veo: datos del inquilino, nave, parque, condiciones comerciales (de la Hoja de Acuerdos)
- Veo el checklist de documentación con los archivos adjuntos que subió el LO
- Puedo ver el historial del cliente si ya ha tenido contratos anteriores con Parks
- Puedo descargar todos los documentos desde un solo lugar
```

**US-LEG-003**
```
COMO Abogado asignado
QUIERO registrar cada versión del contrato que envío al cliente
PARA tener trazabilidad completa del proceso y cumplir con el SLA

Criterios de aceptación:
- Puedo crear una nueva versión con: número de versión, fecha de envío, documento adjunto
- El sistema registra automáticamente la fecha de envío al marcarla
- Puedo registrar la respuesta del cliente: acepta / solicita cambios / sin respuesta
- Si solicita cambios, registro los cambios pedidos y evalúo si son aceptables
- El SLA se calcula considerando el tiempo total incluyendo todas las versiones
```

**US-LEG-004**
```
COMO Catalina (Admin Legal)
QUIERO pausar el SLA cuando la documentación está incompleta
PARA que los días de espera por el cliente no se cuenten en el SLA de Legal

Criterios de aceptación:
- Puedo pausar el SLA con un motivo específico
- Al pausar, el sistema notifica automáticamente al LO con la lista de documentos faltantes
- El SLA reanuda automáticamente cuando el checklist queda completo
- En el reporte de SLA se muestra: días de SLA activos + días pausados (separados)
- Los días pausados son trazables y auditables
```

**US-LEG-005**
```
COMO Catalina (Admin Legal)
QUIERO registrar el cotejo del contrato firmado por el cliente
PARA garantizar que la versión impresa coincide con la última versión digital autorizada

Criterios de aceptación:
- Al registrar el cotejo, el sistema me muestra la última versión digital enviada al cliente para comparar
- Puedo marcar el resultado: "Versiones coinciden" o "Discrepancia detectada"
- Si hay discrepancia: registro cuáles son y el caso vuelve a "En espera de firma correcta del cliente"
- Si coinciden: el caso avanza automáticamente al flujo de firmas internas
- El sistema registra quién realizó el cotejo, fecha y resultado
```

**US-LEG-006**
```
COMO Catalina (Admin Legal)
QUIERO gestionar el flujo de firmas internas en el sistema
PARA saber en todo momento en qué punto está el contrato y quién es el siguiente firmante

Criterios de aceptación:
- Veo el flujo de firmas como una línea de tiempo con 4 pasos (o 2 para propiedades no-FUNO)
- Cada paso muestra: firmante, rol, fecha esperada, estatus (pendiente/firmado)
- Registro manualmente la fecha de cada firma una vez que la recibo físicamente
- Si el contrato es de propiedad FUNO: el sistema activa automáticamente los pasos adicionales de FUNO/NEXT
- Al completar la última firma: el caso se cierra automáticamente y se disparan todas las notificaciones
```

**US-LEG-007**
```
COMO Director Legal
QUIERO ver el dashboard de todos los casos activos con su semáforo en tiempo real
PARA gestionar el equipo y detectar problemas antes de que el SLA se venza

Criterios de aceptación:
- Vista de todos los casos activos con semáforo de color
- Filtros por: abogado asignado / tipo de documento / parque / días restantes de SLA
- Los casos con SLA vencido aparecen en rojo al tope de la lista
- Puedo ver el detalle de cada caso sin salir del dashboard
- Los casos con documentación pausada se muestran diferenciado (en gris) para no confundirse con casos activos en riesgo
```

**US-LEG-008**
```
COMO Director Legal
QUIERO ver las métricas de desempeño de cada abogado
PARA identificar cuellos de botella y gestionar la carga de trabajo del equipo

Criterios de aceptación:
- Por abogado veo: casos activos, tiempo promedio a primera versión, tiempo promedio total, cumplimiento de SLA
- Comparativa del equipo: quién cierra más rápido, quién tiene más retrasos
- Tendencia mensual: ¿el equipo mejora o empeora en tiempos?
- Puedo exportar el reporte para la junta quincenal
```

**US-LEG-009**
```
COMO Catalina (Admin Legal)
QUIERO que el sistema genere automáticamente el reporte de renovaciones quincenal
PARA no tener que preparar el Excel manualmente antes de cada junta

Criterios de aceptación:
- El reporte se genera automáticamente cada 15 días (lunes) antes de las 8 AM
- Incluye: empresa, nave, parque, fecha de vencimiento, días restantes, estatus, abogado/LO asignado, semáforo
- Se envía automáticamente a: Catalina, Director Legal, CEM, CEO
- El formato es el mismo que hoy tienen en Excel (para facilitar la adopción)
- Puedo acceder al reporte online en el sistema además del correo
```

**US-LEG-010**
```
COMO Sistema automático
QUIERO detectar contratos vencidos sin renovación firmada
PARA activar el proceso de holdover sin que nadie tenga que detectarlo manualmente

Criterios de aceptación:
- El sistema verifica diariamente los contratos activos contra su fecha de vencimiento
- Al detectar vencimiento sin renovación: activa estatus "Holdover" automáticamente
- Notifica simultáneamente a Legal, Comercial y CxC
- Notifica a Facturación (Jesús) para emitir factura de holdover
- El dashboard de Legal muestra los holdovers activos con días de holdover acumulados
- Registra el monto de holdover acumulado vs cobrado
```

**US-LEG-011**
```
COMO Director General (CEO)
QUIERO aprobar o rechazar condonaciones de holdover desde el sistema
PARA que estas decisiones queden documentadas y auditables

Criterios de aceptación:
- Recibo notificación cuando se solicita una condonación de holdover para mi aprobación
- Veo el contexto: empresa, monto del holdover, razón de la solicitud, días de holdover acumulados
- Puedo aprobar con comentario o rechazar con justificación
- La decisión queda registrada en el expediente del cliente con fecha, monto y firmante
- Si apruebo: el sistema notifica a CxC para iniciar el proceso de nota de crédito
```

**US-LEG-012**
```
COMO Catalina (Admin Legal)
QUIERO procesar el Acta de Restitución cuando un cliente sale
PARA determinar qué pasa con el depósito en garantía y cerrar el ciclo del cliente

Criterios de aceptación:
- Puedo crear el acta en el sistema con: fecha de salida, estado de la nave, desperfectos, decisión del depósito
- El sistema calcula automáticamente: monto a devolver / retener según el porcentaje que defina
- La decisión debe ser aprobada por Comercial en el sistema antes de notificar a CxC
- Al finalizar: CxC recibe notificación con la decisión y el monto exacto
- La nave pasa automáticamente a "Disponible" en el inventario
- El sistema verifica si hay oportunidades perdidas por falta de disponibilidad de esa nave
```

---

## AUTOMATIZACIONES REQUERIDAS — LEGAL

```javascript
// AUTOMATION 1: Inicio del caso legal
trigger: Hoja_de_Acuerdos.estatus == "Firmada" 
         AND Hoja_de_Acuerdos.checklist_documentacion == 100%
action: [
  crear_caso_legal(tipo, sla_segun_tipo, datos_de_hoja_de_acuerdos),
  iniciar_contador_sla(fecha_inicio: hoy),
  calcular_fecha_limite_sla(excluir: sabados_y_domingos),
  notificar(catalina, detalles_completos_incluyendo_contacto_cliente),
  estatus_semaforo: "Azul"
]

// AUTOMATION 2: Asignación de abogado
trigger: Caso_Legal.abogado_asignado cambia de null a [usuario]
action: [
  notificar(abogado, "Nuevo caso asignado: [empresa] | SLA: [dias] días | Vence: [fecha]"),
  crear_tarea(abogado, "Revisar documentación y elaborar borrador", hoy + 3_dias_habiles)
]

// AUTOMATION 3: Seguimiento de versión enviada
trigger: Version_Documento.fecha_envio_cliente != null AND Version_Documento.fecha_respuesta_cliente == null
action: 
  si pasan 5 dias_habiles sin respuesta:
    crear_tarea(abogado, "Sin respuesta del cliente — hacer seguimiento vía Comercial")
  si pasan 10 dias_habiles sin respuesta:
    notificar(lo_comercial, "⚠️ Cliente [empresa] no ha respondido el contrato enviado — se requiere su apoyo")
    crear_tarea(lo_comercial, "Contactar al cliente para avanzar con el contrato")

// AUTOMATION 4: Pausa del SLA
trigger: Caso_Legal.sla_pausado cambia a true
action: [
  registrar_fecha_inicio_pausa(hoy),
  estatus_caso: "Documentación incompleta",
  notificar(lo_comercial, documentos_faltantes, plazo: 5_dias_habiles),
  crear_tarea(lo_comercial, "Entregar documentación faltante a Legal", hoy + 5_dias_habiles)
]

trigger: Caso_Legal.checklist_documentacion == 100%
action: [
  reanudar_sla(),
  registrar_dias_pausados(),
  estatus_caso: "Asignado",
  notificar(abogado, "Documentación completa — continuar con el proceso")
]

// AUTOMATION 5: Alertas de SLA
trigger: Caso_Legal.sla_dias_restantes == 15 AND sla_pausado == false
action: notificar(abogado, director_legal, "⚠️ SLA vence en 15 días — [empresa]")

trigger: Caso_Legal.sla_dias_restantes == 7 AND sla_pausado == false
action: notificar(abogado, director_legal, catalina, "🚨 SLA vence en 7 días — [empresa]")

trigger: Caso_Legal.sla_dias_restantes <= 0 AND estatus != "Firmado — cerrado"
action: [
  notificar(director_legal, ceo, "🔴 SLA VENCIDO — [empresa] / [tipo_documento]"),
  estatus_semaforo: "Rojo",
  crear_tarea(director_legal, "Revisar y gestionar caso con SLA vencido", hoy)
]

// AUTOMATION 6: Cierre del contrato
trigger: Caso_Legal.estatus == "Firmado — cerrado"
action: [
  notificar(lo_comercial + cem, datos_cierre_completos),
  notificar(cxc_claudia, datos_cobro_completos_con_contacto_cliente), // ← incluir contacto
  notificar(jesus_contratos, datos_alta_oracle_con_fechas),
  notificar(tenant, datos_entrega_nave),
  notificar(admin_parque, datos_nuevo_inquilino),
  activar_motor_comisiones_si_no_es_funo(),
  actualizar_nave_estatus("Rentada"),
  marcar_oportunidad_comercial("Ganada"),
  estatus_semaforo: "Verde",
  archivar_de_dashboard_activo()
]

// AUTOMATION 7: Holdover
trigger: Contrato.fecha_vencimiento < hoy 
         AND Caso_Legal_Renovacion.estatus != "Firmado — cerrado"
action: [
  contrato.estatus = "Holdover activo",
  estatus_semaforo: "Rojo",
  notificar(catalina, director_legal, lo_comercial, cem, cxc_claudia,
    "🔴 HOLDOVER ACTIVO — [empresa] / [nave] vencido el [fecha]. Días en holdover: [N]"),
  notificar(jesus_facturacion, "Emitir factura de holdover — [empresa] | Monto: [doble_renta]"),
  registrar_inicio_holdover(fecha: hoy)
]

// AUTOMATION 8: Reporte quincenal de renovaciones
trigger: cada_lunes_7am_cada_14_dias
action: [
  generar_reporte_renovaciones_activas(),
  enviar_reporte_por_correo(destinatarios: [catalina, director_legal, cem, ceo]),
  publicar_reporte_en_dashboard()
]

// AUTOMATION 9: Liberación de nave al cerrar contrato/terminación
trigger: Contrato.estatus == "Terminado" OR Acta_Restitucion.procesada == true
action: [
  nave.estatus = "Disponible",
  buscar_oportunidades_perdidas_por_falta_disponibilidad(metros: nave.metros ±20%, ubicacion: nave.parque.estado),
  para cada match: notificar(lo_original, "La nave [nave] quedó disponible — [empresa] la buscaba")
]

// AUTOMATION 10: Reporte mensual FUNO
trigger: primer_dia_habil_del_mes
action: [
  generar_reporte_operaciones_funo(mes: mes_anterior),
  notificar(catalina, "Reporte FUNO listo para revisión y envío"),
  crear_tarea(catalina, "Revisar y enviar reporte FUNO", hoy + 2_dias)
]
```

---

## REGLAS DE NEGOCIO Y VALIDACIONES — LEGAL

```
REGLA 1 — Punto de entrada bloqueado:
  Un Caso Legal NO puede crearse sin una Hoja de Acuerdos firmada vinculada
  (Ya validado en el sistema — no modificar esta validación)

REGLA 2 — SLA por tipo de documento:
  Contrato de arrendamiento nuevo → 60 días hábiles
  Convenio de renovación → 45 días hábiles
  Build-to-suit → 90 días hábiles
  Modificatorio de aclaración → 10 días (urgente) o 20 días (normal)
  Terminación anticipada → variable, definido por Director Legal al crear el caso

REGLA 3 — Pausa de SLA:
  El SLA se pausa SOLO cuando: documentación incompleta o NDA pendiente
  El SLA NO se pausa por: tiempo de respuesta del cliente, renegociación, demora en firmas
  Los días pausados se reportan separados de los días activos de SLA

REGLA 4 — Cotejo obligatorio:
  Ningún contrato puede pasar al flujo de firmas sin que Catalina registre el cotejo como aprobado
  Si hay discrepancia: el proceso se detiene hasta recibir la versión correcta

REGLA 5 — Flujo de firmas (orden estricto):
  1. Subdirector Legal → 2. Director General → 3+4. FUNO/NEXT (solo si es propiedad FUNO)
  El orden no puede alterarse en el sistema
  Si una firma se rechaza: el caso vuelve a "En elaboración"

REGLA 6 — Propiedad FUNO:
  Si nave.es_propiedad_funo = true:
    Flujo de firmas incluye FUNO/NEXT (pasos 3 y 4 obligatorios)
    Expediente físico va a FUNO (Catalina solo retiene copia digital)
    Motor de comisiones = "No aplica"
    Reporte mensual FUNO incluye esta operación

REGLA 7 — Renovación y adeudos:
  No se puede renovar a un cliente con adeudos activos sin aprobación del Director General
  El sistema verifica automáticamente el estatus de pagos del cliente con CxC antes de abrir el caso

REGLA 8 — Holdover y condonación:
  Solo el Director General puede condonar facturas de holdover
  La condonación requiere aprobación en el sistema y queda en el historial del cliente

REGLA 9 — Acta de Restitución:
  La nave no puede pasar a "Disponible" sin que el acta esté registrada en el sistema
  La decisión del depósito en garantía debe ser aprobada por Comercial en el sistema

REGLA 10 — Visibilidad por rol:
  Abogados: solo ven sus casos asignados
  Catalina: ve todos los casos
  Director Legal / Subdirector: ven todos los casos con permisos de edición
  CxC y Comercial: ven el semáforo y estatus del caso, sin acceso a documentos
```

---

## DASHBOARDS Y REPORTES — ÁREA LEGAL

### Dashboard de Abogado
```
- Mis casos activos con semáforo de SLA
- Mis tareas pendientes del día
- Versiones de contratos esperando respuesta del cliente
- Casos en flujo de firmas (en qué paso están)
```

### Dashboard de Catalina (Admin)
```
- Todos los casos activos por estatus y semáforo
- Cola de nuevos casos sin asignar
- Casos con SLA en riesgo (menos de 10 días)
- Casos pausados por documentación incompleta
- Holdovers activos con días acumulados
- Casos en flujo de firmas con próximos firmantes
- Vista de carga de trabajo por abogado (para asignación)
```

### Dashboard del Director Legal
```
- Resumen general del portafolio de casos
- SLA cumplido vs vencido (por abogado y por tipo)
- Renovaciones activas con semáforo y días restantes
- Holdovers activos con monto acumulado
- Contratos por vencer próximos 90 días (para anticipar carga)
- Métricas de desempeño del equipo (tiempo promedio por tipo de documento)
```

### Dashboard Ejecutivo (CEO) — sección legal
```
- Contratos activos totales (todos los parques)
- Contratos por vencer 30/60/90/180 días
- Holdovers activos con riesgo legal
- Renovaciones en proceso con SLA status
- Condonaciones pendientes de aprobación
```

### Reportes automáticos
```
- Reporte quincenal de renovaciones (lunes cada 15 días, antes de la junta)
- Reporte mensual de operaciones FUNO (primer día hábil del mes)
- Reporte mensual de SLA cumplido/vencido por abogado (para gestión del equipo)
- Reporte de holdovers activos y monto acumulado (semanal, a Director Legal y CEO)
```

---

## MÉTRICAS CLAVE DEL ÁREA LEGAL

```
Tiempo a primera versión:
  Medición: días desde asignación del caso hasta envío de V1 al cliente
  Meta sugerida (a definir con Parks Industrial): ≤ 10 días hábiles

Tiempo a versión final:
  Medición: días desde envío V1 hasta versión aceptada por el cliente
  Depende del cliente pero monitorea cuántas rondas de negociación hubo

Tiempo de firma del cliente:
  Medición: días desde envío de versión final hasta recepción del contrato firmado
  Este tiempo es del cliente — Legal no lo controla pero lo monitorea

Tiempo total del caso (SLA real):
  Medición: días totales desde recepción de Hoja de Acuerdos hasta contrato firmado
  Incluyendo pausas + tiempo activo

Cumplimiento de SLA:
  % de casos cerrados dentro del plazo
  Por abogado, por tipo de documento, por mes

Casos por abogado (simultáneos):
  Carga de trabajo activa en un momento dado
  Útil para balancear asignaciones

Índice de renegociación:
  Cuántas versiones promedio por contrato
  Alta renegociación puede indicar condiciones comerciales que Legal rechaza frecuentemente

Tiempo promedio de holdover:
  Días promedio que un contrato pasa en holdover antes de renovarse
  Indica eficiencia del proceso de renovación comercial
```

---

## INTEGRACIÓN CON OTROS MÓDULOS

### ← Módulo Comercial (entrada)
```
Recibe: Hoja de Acuerdos firmada + Checklist de documentación completo
Contiene: todos los datos del inquilino, nave, condiciones comerciales, broker
```

### → Módulo CxC (salida al cerrar)
```
Envía: 
  - Datos del inquilino (empresa, RFC, representante, correo, teléfono) ← incluir siempre
  - Datos de la nave y parque
  - Condiciones financieras: renta, depósito, rentas adelantadas, período de gracia
  - Fecha de inicio del contrato y vencimiento
  - Escalación INPC: próxima fecha de incremento
  - Tipo de moneda (MXN / USD — confirmar con Parks Industrial)
```

### → Módulo Contratos/Facturación — Jesús Gazón (salida al cerrar)
```
Envía:
  - Alta del contrato: empresa, nave, parque, fechas
  - Configuración de períodos de gracia en Oracle
  - Primera fecha de facturación
  - Fecha de próxima escalación INPC
  - Instrucción de emisión de facturas iniciales (depósito + rentas adelantadas)
```

### → Módulo Inventario (actualización)
```
Al cerrar contrato: Nave → "Rentada"
Al procesar Acta de Restitución: Nave → "Disponible"
Al iniciar build-to-suit: Nave → "En construcción"
```

---

## NOTAS DE IMPLEMENTACIÓN PARA CURSOR

```
1. VALIDACIÓN YA EXISTENTE EN EL SISTEMA:
   No se puede crear un Caso Legal sin una Hoja de Acuerdos firmada. 
   No modificar esta validación — es correcta y crítica.

2. OBJETOS BASE YA EXISTENTES:
   - Opportunity → usar para vincular el caso legal
   - Account → inquilino
   - User → abogados, Catalina, Director Legal, CEO
   - Task / Activity → registro de acciones

3. OBJETOS CUSTOM NUEVOS A CREAR:
   - Caso_Legal__c (objeto principal del módulo)
   - Checklist_Documentacion__c (hijo de Caso_Legal)
   - Version_Documento__c (hijo de Caso_Legal)
   - Flujo_Firmas__c (hijo de Caso_Legal)
   - Acta_Restitucion__c (hijo de Caso_Legal)

4. CÁLCULO DE DÍAS HÁBILES:
   El SLA usa días hábiles (excluir sábados y domingos)
   Contemplar si se deben excluir también días festivos oficiales de México
   Implementar función: calcular_dias_habiles(fecha_inicio, dias_habiles)

5. PAUSA DE SLA:
   El SLA debe poder pausarse y reanudarse
   El sistema debe trackear: días activos + días pausados (separados para reportes)

6. SEMÁFORO AUTOMÁTICO:
   El color del semáforo se calcula automáticamente según SLA restante:
   🔵 Azul: Caso nuevo / en elaboración / SLA > 20 días
   🟠 Naranja: Primera versión enviada / SLA entre 10-20 días
   🟡 Amarillo: Sin avance o SLA entre 5-10 días
   🔴 Rojo: SLA < 5 días o vencido o holdover activo
   🟢 Verde: Firmado y cerrado

7. CONTACTO DEL CLIENTE EN NOTIFICACIÓN A CxC:
   El mayor dolor de CxC es que el ticket de Legal no incluye el contacto del cliente.
   La notificación automática DEBE incluir: nombre, correo y teléfono del representante del cliente.
   Este dato viene del objeto Contacto vinculado a la Cuenta en el módulo comercial.

8. PROPIEDAD FUNO:
   El campo nave.es_propiedad_funo es el switch que activa/desactiva:
   - Pasos adicionales en el flujo de firmas
   - Generación del reporte mensual FUNO
   - Inhibición del motor de comisiones
   Este campo debe ser visible pero NO editable desde el módulo legal.
   Solo puede modificarse desde el objeto Nave.

9. DATOS PARA LA DEMO:
   
   Caso 1 — Contrato nuevo en proceso:
     Empresa: LogiMex S.A. de C.V.
     Tipo: Contrato de arrendamiento
     Abogado: Abogado 1
     SLA: 32 días transcurridos de 60 | Estatus: 🟠 Naranja
     Estatus caso: "Primera versión enviada — esperando respuesta del cliente"
     V1 enviada hace 4 días
   
   Caso 2 — Renovación en riesgo:
     Empresa: Empresa Manufactura GDL
     Tipo: Convenio de renovación
     SLA: 38 días transcurridos de 45 | Estatus: 🔴 Rojo
     Estatus caso: "En revisión con cliente — segunda versión enviada"
     Contrato vence en 3 semanas sin firma
   
   Caso 3 — Holdover activo:
     Empresa: Distribuciones Norte S.A.
     Contrato venció hace 52 días
     Holdover activo: $543,780 acumulado (doble renta × días)
     Facturas de holdover emitidas: 2
     Renovación en negociación: Hoja de Acuerdos sin firma
   
   Caso 4 — Propiedad FUNO:
     Empresa: Samsung Electronics México
     Tipo: Contrato de arrendamiento
     es_propiedad_funo: TRUE
     Estatus: "Enviado a FUNO/NEXT — esperando firmas externas"
     Comisión: No aplica
   
   Caso 5 — Terminación anticipada:
     Empresa: Cliente que sale 14 meses antes
     Tipo: Convenio de terminación anticipada
     Penalización en negociación
     Condonación del 50% pendiente de aprobación del CEO

10. MONEDA:
    Confirmar con Parks Industrial: ¿los contratos son en MXN o USD?
    La empresa hermana ALLUX usa MXN
    La industria industrial típicamente cotiza en USD
    El sistema debe soportar ambas monedas con conversión si es necesario
```

---

*Documento preparado por Bridge Studio — Julio 2026*
*Base de implementación para demo Salesforce CRM — Parks Industrial*
*Versión 1.0 — Área Legal completa*
*Para uso en Cursor — módulo a extender sobre CRM base ya montado*
