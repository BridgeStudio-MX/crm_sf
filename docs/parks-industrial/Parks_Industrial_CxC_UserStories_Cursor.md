# Parks Industrial — Área de Cuentas por Cobrar (CxC)
## Flujo Completo + Historias de Usuario para implementación en CRM
### Documento técnico para Cursor

---

## CONTEXTO GENERAL

Este documento define el flujo completo del área de Cuentas por Cobrar de Parks Industrial. El área de CxC toma el proceso donde Legal lo deja: desde la notificación de que un contrato fue firmado, hasta el cierre del ciclo de vida del cliente cuando sale del parque.

CxC gestiona un portafolio de ~600 contratos activos con 3 ejecutivos. Los procesos son altamente manuales hoy — este módulo los automatiza, agrega inteligencia artificial donde aporta valor real, y conecta los flujos de retroalimentación hacia Legal y Comercial.

**Responsable del área:** Claudia Rodríguez (Gerente)
**Equipo:** 3 ejecutivos de cobranza
**Estructura de asignación:** Por cuenta (cliente), no por contrato — un ejecutivo ve todos los contratos del mismo cliente

---

## ROLES DEL ÁREA CxC Y ACTORES RELACIONADOS

```
Gerente CxC (Claudia)
├── Ejecutivo CxC 1 (~200 cuentas)
├── Ejecutivo CxC 2 (~200 cuentas)
└── Ejecutivo CxC 3 (~200 cuentas)

Actores externos al área pero en el flujo:
├── Jesús Gazón (Contratos y Facturación) — emite facturas en Oracle
├── Gestión y Control — genera reportes diarios de facturación y pagos
├── Tesorería Fibra Uno — asigna cuentas bancarias, registra pagos (1 día desfasado)
├── Legal (Catalina) — envía ticket de contrato firmado, procesa actas
├── Comercial (LO + CEM) — maneja información del cliente, INPC en disputa
└── Director General (CEO) — aprueba condonaciones y notas de crédito
```

---

## OBJETOS DEL SISTEMA (CUSTOM)

### Objeto: Cuenta_CxC__c (extensión del Account)
```
Campos adicionales en Account para gestión CxC:
- ejecutivo_cxc_asignado (relación → User)
- estatus_pagos (lista): "Al corriente / Mora leve / Mora grave / Holdover / Inactivo"
- score_riesgo_pago (número 0-100, calculado por IA) ← CAMPO IA
- score_riesgo_label (lista): "Bajo / Medio / Alto / Crítico" ← CAMPO IA
- tipo_cliente (lista): "Sin portal / Con portal / Portal múltiple"
- dia_pago_acordado (lista): "Día 5 / Día 10 / Día 15 / Día 20 / Personalizado"
- dia_pago_personalizado (número, si aplica)
- moneda_contrato (lista): "MXN / USD"
- cuenta_bancaria_asignada (texto, asignada por Fibra Uno)
- fecha_asignacion_cuenta_bancaria (fecha)
- tiene_adeudos_activos (boolean, calculado)
- monto_adeudo_total (moneda, calculado desde facturas pendientes)
- dias_en_mora (número, calculado)
- ultima_fecha_pago (fecha, actualizado por integración Oracle)
- contratos_activos_count (número, calculado)
- requiere_oc_para_factura (boolean) ← clientes con portal que piden OC primero
- portal_cobro_url (texto, si aplica)
- notas_cobranza (texto largo)
```

### Objeto: Ciclo_Facturacion__c
```
- cuenta (relación → Account)
- contrato (relación → Caso_Legal__c)
- jesús_contrato_dado_alta (boolean) ← confirmación de que Jesús lo subió a Oracle
- fecha_alta_oracle (fecha)
- fecha_primera_factura (fecha, calculada)
- periodo_gracia_meses (número, desde el contrato)
- fecha_inicio_cobranza_real (fecha, calculada: fecha_inicio + gracia)
- renta_mensual (moneda)
- dia_de_corte_mensual (número)
- escalacion_tipo (lista): "INPC / Porcentaje fijo"
- proxima_fecha_escalacion (fecha)
- porcentaje_escalacion (número)
- nueva_renta_tras_escalacion (moneda, calculada)
- estatus (lista): "Gracia / Activo / Holdover / Terminado"
- facturas_pendientes_count (número, de Oracle)
- monto_pendiente_total (moneda, de Oracle)
```

### Objeto: Factura_CxC__c (reflejo de Oracle en SF)
```
- cuenta (relación → Account)
- ciclo_facturacion (relación → Ciclo_Facturacion__c)
- numero_factura (texto, de Oracle)
- tipo_factura (lista): 
    "Depósito garantía / 
    Renta adelantada / 
    Renta mensual / 
    Holdover / 
    Penalización / 
    Ajuste"
- monto (moneda)
- fecha_emision (fecha)
- fecha_limite_pago (fecha)
- dias_vencida (número calculado)
- estatus (lista): 
    "Emitida / 
    OC_pendiente / 
    En_portal_cliente / 
    Pago_programado / 
    Pagada / 
    Vencida / 
    En_disputa / 
    Cancelada"
- fecha_pago_real (fecha)
- monto_pagado (moneda)
- forma_pago (lista): "Transferencia / Portal cliente / Cheque"
- aplicada_en_oracle (boolean)
- fecha_aplicacion_oracle (fecha)
- nota_credito_vinculada (relación → Nota_Credito__c)
```

### Objeto: Orden_Compra__c (para clientes con portal)
```
- cuenta (relación → Account)
- factura (relación → Factura_CxC__c)
- numero_oc (texto)
- fecha_recepcion_oc (fecha)
- fecha_vencimiento_oc (fecha)
- fecha_carga_portal (fecha)
- fecha_pago_programada_segun_portal (fecha)
- dias_credito_portal (número)
- estatus (lista): 
    "Esperando OC / 
    OC Recibida / 
    Cargada en portal / 
    Error en portal / 
    Pago programado / 
    Pagada"
- errores_portal (texto)
- intentos_recordatorio (número, para IA)
- respuesta_cliente (lista): "Sin respuesta / Responde rápido / Responde lento / Problema recurrente"
```

### Objeto: Nota_Credito__c
```
- cuenta (relación → Account)
- facturas_afectadas (relación → Factura_CxC__c, múltiple)
- tipo (lista): "Pronto pago / Renovación anticipada / Error facturación / Condonación holdover / Otro"
- monto_nota_credito (moneda)
- justificacion (texto largo)
- soporte_documental (texto: referencia al contrato o acuerdo)
- formato_facturacion_creado (boolean) ← Jesús crea el formato
- enviado_a_aprobacion (boolean)
- aprobado_por_direccion (boolean)
- fecha_aprobacion (fecha)
- aprobado_por (relación → User → CEO)
- estatus (lista): "Borrador / En aprobación / Aprobada / Rechazada / Aplicada"
- comentario_aprobador (texto)
```

### Objeto: Deposito_Garantia__c
```
- cuenta (relación → Account)
- contrato (relación → Caso_Legal__c)
- monto_original (moneda)
- meses_deposito (número)
- fecha_cobro (fecha)
- estatus (lista): "Retenido / En proceso de devolución / Devuelto parcial / Devuelto total / Aplicado a adeudos"
- monto_a_devolver (moneda)
- monto_a_retener (moneda)
- razon_retencion (texto)
- acta_restitución (relación → Acta_Restitucion__c)
- aprobado_por_comercial (boolean)
- fecha_aprobacion_comercial (fecha)
- solicitud_devolucion_recibida (boolean)
- caratula_bancaria_recibida (boolean)
- carta_solicitud_recibida (boolean)
- en_proceso_firmas_internas (boolean)
- fecha_devolucion_efectiva (fecha)
- monto_devuelto (moneda)
```

### Objeto: Escalacion_INPC__c
```
- ciclo_facturacion (relación → Ciclo_Facturacion__c)
- cuenta (relación → Account)
- fecha_aplicacion (fecha)
- renta_anterior (moneda)
- porcentaje_inpc_aplicado (número)
- renta_nueva (moneda)
- notificacion_enviada_cliente (boolean)
- fecha_notificacion (fecha)
- cliente_acepta (boolean)
- cliente_disputa (boolean)
- motivo_disputa (texto)
- escalado_a_comercial (boolean)
- resolucion_comercial (lista): "Aplica INPC completo / Aplica INPC parcial / Sin incremento este período"
- fecha_resolucion (fecha)
- resuelto_por (relación → User)
- nueva_renta_acordada (moneda, si hubo negociación)
- estatus (lista): "Pendiente / Notificado / Aceptado / En disputa / Resuelto"
```

---

## FLUJO PRINCIPAL — ONBOARDING DE NUEVO INQUILINO

### Punto de entrada desde Legal

```
[TRIGGER AUTOMÁTICO desde módulo Legal]
Caso_Legal marcado como "Firmado — cerrado"
        ↓
CxC recibe notificación automática con:
  ✅ Razón social del cliente
  ✅ RFC del cliente
  ✅ Nombre del representante / contacto de pagos ← antes no llegaba
  ✅ Correo del contacto de pagos ← antes no llegaba
  ✅ Teléfono del contacto de pagos ← antes no llegaba
  ✅ Nave y parque
  ✅ Renta mensual (monto y moneda)
  ✅ Período de gracia (meses)
  ✅ Depósito en garantía (meses)
  ✅ Rentas adelantadas (meses)
  ✅ Escalación: tipo (INPC / fijo) + próxima fecha
  ✅ Fecha de inicio del contrato
  ✅ Fecha de vencimiento del contrato
  ✅ Es propiedad FUNO (boolean)
        ↓
Sistema crea automáticamente:
  1. Registro Ciclo_Facturacion__c vinculado a la cuenta
  2. Registro Deposito_Garantia__c si corresponde
  3. Alerta a Claudia: "Nuevo inquilino asignado — revisar y asignar ejecutivo"
```

### Paso 1 — Solicitud de cuenta bancaria a Fibra Uno

```
Claudia o el ejecutivo asignado solicita a Tesorería de Fibra Uno:
  - Razón social del cliente
  - Moneda del contrato (MXN / USD)
  - Parque / nave donde está ubicado

Fibra Uno asigna una cuenta bancaria personalizada para ese cliente
Ejecutivo registra en el sistema:
  - Número de cuenta asignada
  - Fecha de asignación
  - CLABE / instrucciones de pago

Sistema actualiza el perfil del cliente con la cuenta bancaria
Sistema genera automáticamente el correo de bienvenida al cliente:
  "Hola [nombre], su contrato en Parks Industrial ha sido activado.
   Para sus pagos mensuales use la siguiente cuenta: [datos]
   Su ejecutivo de cuenta es: [nombre ejecutivo] | [correo] | [teléfono]
   Su próxima fecha de pago es: [fecha, considerando período de gracia]"
```

### Paso 2 — Verificación de alta en Oracle (con Jesús)

```
VALIDACIÓN: El sistema verifica si Jesús confirmó el alta del contrato en Oracle
  ├── NO confirmado en 3 días →
  │     Tarea automática al ejecutivo: "Confirmar con Jesús que el contrato está dado de alta en Oracle"
  │     Si no se confirma en 5 días: escalamiento a Claudia
  └── SÍ confirmado →
        Ejecutivo marca en el sistema: jesús_contrato_dado_alta = true
        Sistema calcula fecha de primera factura (considerando períodos de gracia)
        Ciclo de facturación activo
```

### Paso 3 — Asignación del ejecutivo CxC

```
Claudia asigna el nuevo cliente a un ejecutivo CxC:
  - Preferencia: ejecutivo que ya maneja otras cuentas del mismo grupo empresarial
  - Si es cliente sin historial: asignar al ejecutivo con menor carga actual
  - El sistema muestra la distribución actual de cuentas por ejecutivo

REGLA: si el cliente tiene múltiples contratos en diferentes naves o parques:
  → Un solo ejecutivo ve TODOS los contratos de ese cliente
  → No se distribuyen los contratos de un mismo cliente entre varios ejecutivos
```

---

## FLUJO DE COBRO MENSUAL ESTÁNDAR

### Para clientes SIN portal de compras

```
[DÍA 1 DEL MES]
Jesús emite la factura mensual desde Oracle
Sistema recibe confirmación de emisión (integración Oracle)
Ejecutivo verifica en el reporte diario de facturación que la factura fue emitida
        ↓
¿La factura fue emitida correctamente?
  ├── NO → Ver Flujo: Factura no emitida en tiempo
  └── SÍ → Sistema registra la factura en SF
        ↓
Ejecutivo envía la factura al cliente por correo
(o el cliente ya la recibe desde el sistema de Jesús — confirmar flujo exacto)
        ↓
[DÍA 5 o 10 según contrato]
Fecha límite de pago del cliente
        ↓
¿El pago cayó en la cuenta bancaria del cliente?
  ├── SÍ → Ver Flujo: Aplicación de pago en Oracle
  └── NO → Ver Flujo: Cliente no paga en fecha acordada
```

### Para clientes CON portal de compras

```
[DÍA 1 DEL MES o antes]
Ejecutivo verifica si el cliente ya envió la Orden de Compra (OC)
        ↓
¿Llegó la OC del cliente?
  ├── SÍ, antes del día 1 →
  │     Ejecutivo solicita a Jesús que emita la factura
  │     Jesús emite la factura
  │     Ejecutivo descarga la factura + información requerida por el portal
  │     Ejecutivo entra al portal del cliente y carga la factura
  │     Sistema registra: fecha de carga en portal
  │     El portal del cliente acepta y genera fecha de pago programada
  │     Ejecutivo registra en SF: fecha de pago programada por el portal
  │     
  └── NO llegó la OC antes del día 1 →
        Ver Flujo: OC pendiente de cliente con portal
        
[DÍAS SIGUIENTES AL DÍA 1]
El pago llega en la fecha que el portal programó (5, 10, 15, 20 días después de la carga)
Ejecutivo verifica en el reporte diario de pagos que el pago cayó
Ejecutivo aplica el pago en Oracle a la factura correspondiente
```

---

## FLUJO A — OC PENDIENTE DE CLIENTE CON PORTAL

```
[CONTEXTO]
Algunos clientes tienen implementado un sistema de portales de compras.
Estos clientes requieren enviar primero una Orden de Compra (OC) a Parks Industrial.
Solo cuando Parks recibe la OC puede emitir la factura y cargarla al portal.
Hoy este proceso es 100% manual y consume tiempo desproporcionado.
        ↓
[AUTOMATIZACIÓN CON IA] ← PUNTO DE IA #1
Sistema conoce el comportamiento histórico de cada cliente con portal:
  - Promedio de días que tarda en enviar la OC (ej: Empresa X siempre manda la OC el día 28 del mes anterior)
  - Patrón de respuesta (rápido / lento / problema recurrente)
  - Días de crédito que toma el portal después de la carga

Con esa información, el sistema planifica proactivamente:
  Si el cliente típicamente manda la OC el día 28 del mes anterior:
    → El día 25 el sistema envía recordatorio automático al cliente:
      "Estimado [nombre], su OC de renta correspondiente al mes de [X] 
       vence pronto. Recuerde enviarla para poder emitir su factura a tiempo."
    → El día 28, si no llegó la OC: segundo recordatorio automático
    → El día 1 del mes, sin OC: alerta al ejecutivo + tercera notificación al cliente
        ↓
[FLUJO MANUAL CUANDO LA OC LLEGA TARDE]
El ejecutivo es notificado por el sistema cada 2 días hábiles sin OC:
  Día 1 sin OC: recordatorio automático al cliente (sistema)
  Día 3 sin OC: recordatorio automático al cliente (sistema)
  Día 5 sin OC: tarea al ejecutivo "Llamar directamente al cliente"
  Día 8 sin OC: escalamiento a Claudia
  Día 12 sin OC: escalamiento al Director de Comercial (CEM) para apoyo
        ↓
Cuando llega la OC:
  Ejecutivo registra en SF: fecha de recepción de OC
  Ejecutivo solicita factura a Jesús (o Jesús emite automáticamente si está configurado)
  Ejecutivo carga la factura en el portal del cliente
        ↓
¿El portal acepta la factura sin errores?
  ├── SÍ →
  │     Ejecutivo registra: fecha de carga, fecha de pago programada por el portal
  │     Sistema trackea los días de crédito del portal
  │     Alerta automática cuando se acerca la fecha de pago programada
  └── NO — Error en el portal →
        Ejecutivo registra el error en el sistema
        Ejecutivo resuelve el error con el área de cuentas por pagar del cliente
        Si el error no se resuelve en 3 días: escalamiento a Claudia
        El sistema registra todos los intentos y errores (dato para IA de riesgo)
```

---

## FLUJO B — CLIENTE NO PAGA EN FECHA ACORDADA

```
[TRIGGER AUTOMÁTICO]
fecha_limite_pago ha pasado AND factura.estatus != "Pagada"
        ↓
[IA — CLASIFICACIÓN DE RIESGO] ← PUNTO DE IA #2
Antes de iniciar acciones de cobranza, el sistema evalúa el perfil de riesgo del cliente:

Score de riesgo considera:
  - Historial de pagos (¿siempre paga tarde? ¿es la primera vez?)
  - Días promedio de retraso histórico
  - Monto del adeudo vs monto habitual
  - Antigüedad del cliente con Parks Industrial
  - Tiene otros contratos al corriente o también retrasados
  - Señales del portal (si aplica): pagos programados vs ejecutados

Resultado del score:
  🟢 Riesgo Bajo (score 0-30): 
     Cliente históricamente confiable con retraso aislado
     Acción: recordatorio gentil automático, esperar 3 días
     
  🟡 Riesgo Medio (score 31-60): 
     Patrón de pagos tardíos pero siempre paga
     Acción: recordatorio firme + llamada del ejecutivo en 2 días
     
  🟠 Riesgo Alto (score 61-80): 
     Adeudos recurrentes o monto inusualmente alto
     Acción: llamada inmediata del ejecutivo + copia a Claudia
     
  🔴 Riesgo Crítico (score 81-100): 
     Historial de incumplimiento grave o señales de abandono
     Acción: escalamiento inmediato a Claudia + notificación a Director Legal
        ↓
[PROCESO DE COBRANZA SEGÚN RIESGO]

DÍA 1 después de fecha límite:
  → Recordatorio automático al cliente (correo)
  → Tarea al ejecutivo según nivel de riesgo
  
DÍA 3 sin pago:
  → Segundo correo automático al cliente
  → Si riesgo Alto/Crítico: llamada obligatoria del ejecutivo (tarea)
  
DÍA 7 sin pago:
  → Tercer correo automático con aviso de posibles consecuencias contractuales
  → Escalamiento a Claudia para revisión
  → Notificación a Legal: "Cliente [empresa] con [N] días sin pago"
  
DÍA 15 sin pago:
  → Escalamiento a Director Legal y CEM
  → Sistema evalúa si aplica activar cláusulas contractuales
  → Alerta al CEO si el monto es significativo
  
DÍA 30 sin pago:
  → Sistema marca al cliente como "Mora grave"
  → Notificación automática al Director Legal para evaluar acciones legales
  → Si el contrato está próximo a renovarse: notificación a Legal de que NO se puede renovar 
    sin resolver adeudos (validación bloqueante para el proceso de renovación)
```

---

## FLUJO C — APLICACIÓN DE PAGOS EN ORACLE

```
[CONTEXTO]
Los pagos caen en las cuentas bancarias de Fibra Uno (personalizadas por cliente)
Gestión y Control genera un reporte diario de los pagos caídos
El ejecutivo entra a Oracle y aplica cada pago a la factura correspondiente
Fibra Uno verifica diariamente, mensualmente y anualmente que todos los pagos estén aplicados
        ↓
[AUTOMATIZACIÓN CON IA] ← PUNTO DE IA #3
El sistema sugiere automáticamente a qué factura aplicar cada pago:

Si el pago = monto exacto de una factura específica:
  → Sistema sugiere: "Aplicar a Factura #[X] de [mes] — renta mensual"
  
Si el pago < monto total de deuda:
  → IA sugiere el orden de aplicación:
    Opción A: Aplicar a la factura más antigua primero (criterio contable)
    Opción B: Aplicar a la factura más grande (maximizar %)
    Opción C: Aplicar al depósito de garantía (si es pago inicial)
  → El ejecutivo selecciona y confirma — la IA no aplica sola, solo sugiere
  
Si el pago > monto de la factura actual:
  → Sistema alerta: "El pago supera el monto de la factura actual — 
    ¿Aplicar excedente a adeudos anteriores?"
        ↓
El ejecutivo confirma la aplicación en el sistema SF
El ejecutivo aplica en Oracle (integración bidireccional)
Oracle registra el pago como aplicado
En el siguiente reporte diario, la factura aparece como "Pagada" en SF
        ↓
Sistema actualiza automáticamente:
  - estatus_pagos del cliente
  - ultima_fecha_pago
  - dias_en_mora (se resetea si estaba en mora)
  - score_riesgo_pago (IA recalibra el score con el nuevo dato)
```

---

## FLUJO D — ESCALACIÓN INPC (CRUCE CON LEGAL Y COMERCIAL)

```
[TRIGGER AUTOMÁTICO — 30 días antes de la fecha de escalación]
Sistema detecta: Ciclo_Facturacion.proxima_fecha_escalacion = hoy + 30_dias
        ↓
[IA — CÁLCULO AUTOMÁTICO] ← PUNTO DE IA #4
Sistema calcula automáticamente:
  - Consulta el INPC oficial del mes que aplica (integración con INEGI si disponible, 
    o campo manual actualizable)
  - Calcula la nueva renta: renta_actual × (1 + INPC/100)
  - Genera el borrador de la notificación al cliente
        ↓
Sistema crea registro Escalacion_INPC__c con:
  - Renta anterior
  - INPC aplicado
  - Nueva renta calculada
  - Fecha de aplicación
        ↓
Facturación (Jesús) recibe alerta:
  "La renta de [Empresa] se incrementa el [fecha]
   Renta actual: [monto] | INPC: [%] | Nueva renta: [nuevo monto]
   Actualizar en Oracle antes del [fecha - 5 días]"
        ↓
Jesús actualiza en Oracle
Jesús envía notificación formal al cliente con el cálculo detallado
Ejecutivo CxC registra en SF: notificacion_enviada_cliente = true
        ↓
¿El cliente acepta el incremento?
  ├── SÍ → 
  │     Registro Escalacion_INPC: cliente_acepta = true
  │     El sistema programa la próxima escalación (generalmente 12 meses después)
  │     La nueva renta se refleja en el ciclo de facturación
  │
  └── NO — Cliente disputa el INPC →
        Ejecutivo registra en SF: cliente_disputa = true + motivo_disputa
        Sistema notifica automáticamente al LO de Comercial:
          "⚠️ [Empresa] disputa el incremento INPC
           Renta actual: [monto] | Incremento propuesto: [%] | Nueva renta: [monto]
           Motivo del cliente: [texto]
           Se requiere su intervención para resolver con el cliente."
        LO de Comercial media la negociación
        LO registra la resolución en SF:
          "Aplica INPC completo / Aplica INPC parcial / Sin incremento este período"
          + nueva renta acordada si hubo negociación
        El resultado se refleja en el ciclo de facturación
        Sistema notifica a CxC y a Jesús con la resolución final
```

---

## FLUJO E — NOTAS DE CRÉDITO Y AJUSTES (CRUCE CON COMERCIAL Y LEGAL)

```
[CUÁNDO APLICA]
- Descuento por pronto pago acordado en el contrato
- Descuento por renovación anticipada o plazo extendido
- Condonación de facturas de holdover aprobada por el CEO
- Error en la facturación (monto incorrecto, concepto erróneo)
- Acuerdo especial entre Comercial y el cliente
        ↓
[ORIGEN DE LA NOTA DE CRÉDITO]

ORIGEN A — Condición del contrato (ya está en el sistema):
  El contrato original tiene condiciones de descuento documentadas
  Cuando aplica la condición (fecha específica, pago realizado, etc.)
  El sistema alerta automáticamente a Jesús y al ejecutivo CxC:
    "Aplica descuento por pronto pago de [X%] a [Empresa] en la factura de [mes]"
  Jesús crea el formato de nota de crédito
  Se envía a aprobación de dirección
        ↓
ORIGEN B — Acuerdo nuevo de Comercial:
  LO de Comercial registra en SF el acuerdo con el cliente:
    tipo de descuento, monto, facturas afectadas, justificación
  Sistema notifica automáticamente al ejecutivo CxC del nuevo acuerdo
    "Comercial acordó nota de crédito con [Empresa]:
     [descripción y monto]
     Revisa y procesa cuando llegue la aprobación de dirección"
  Jesús crea el formato de nota de crédito
  Se envía a aprobación de dirección
        ↓
ORIGEN C — Error de facturación detectado por CxC o el cliente:
  Ejecutivo registra el error en SF con detalle y evidencia
  Sistema notifica a Jesús para corrección
  Jesús emite la nota de crédito y/o la factura correcta
  CxC da seguimiento al proceso
        ↓
[FLUJO DE APROBACIÓN — TODAS LAS NOTAS DE CRÉDITO]
Jesús crea el formato en el sistema:
  - Factura afectada
  - Monto de la nota de crédito
  - Justificación
  - Soporte (contrato, correo de acuerdo, etc.)
        ↓
Formato se envía al CEO para aprobación
Sistema notifica al CEO: "Nota de crédito pendiente de aprobación — [Empresa] / [monto]"
        ↓
CEO aprueba o rechaza en el sistema con comentario
Si aprueba: sistema notifica a Jesús para emitir la nota de crédito en Oracle
Si rechaza: sistema notifica a CxC y Comercial con el comentario del CEO
        ↓
Al emitirse la nota de crédito:
  Sistema actualiza el saldo del cliente
  Si el cliente tenía adeudos que desaparecen: actualizar estatus_pagos
  Si la nota de crédito es por condonación de holdover: cerrar el registro de holdover
```

---

## FLUJO F — HOLDOVER — COBRANZA (CRUCE CON LEGAL)

```
[PUNTO DE ENTRADA — desde módulo Legal]
Legal activa el holdover porque el contrato venció sin renovación firmada
Sistema notifica a CxC:
  "🔴 HOLDOVER ACTIVO — [Empresa] / [Nave] / [Parque]
   Vencimiento del contrato: [fecha]
   Renta normal: [monto] | Renta holdover (doble): [monto]
   Jesús fue notificado para emitir factura de holdover"
        ↓
Facturación (Jesús) emite factura de holdover por el doble de la renta
CxC recibe la factura en el sistema y da seguimiento como cualquier otra factura
        ↓
DIFERENCIA CLAVE: Los clientes en holdover SIEMPRE reclaman esta factura
El cliente sabe que está en holdover pero puede argumentar que no firmó la renovación aún

Ejecutivo CxC maneja con el cliente:
  - Explica la cláusula del contrato que aplica el holdover
  - Registra cada interacción en el sistema
  - Si el cliente amenaza con no pagar: notifica a Claudia
        ↓
[SEGUIMIENTO MENSUAL DE HOLDOVER]
Mientras no se firme el convenio de renovación:
  - Cada mes se emite una nueva factura de holdover (Jesús)
  - CxC da seguimiento de cobro mensualmente
  - El sistema lleva el ACUMULADO de holdover:
    Días en holdover: [N]
    Facturas emitidas: [N] por [monto]
    Facturas cobradas: [N] por [monto]
    Monto pendiente: [monto]
        ↓
[CUANDO SE FIRMA LA RENOVACIÓN]
Legal notifica el cierre del holdover al sistema
Sistema actualiza: contrato.estatus de "Holdover" a "Activo"

Decisión del CEO sobre las facturas de holdover:
  ├── SE COBRAN → CxC continúa el proceso de cobranza de las facturas de holdover pendientes
  └── SE CONDONAN (total o parcial) → 
        CxC registra la solicitud de condonación
        Flujo de nota de crédito con aprobación del CEO
        Una vez aprobada: facturas de holdover se cancelan o reducen
```

---

## FLUJO G — DEPÓSITO EN GARANTÍA — CICLO COMPLETO

```
[CUANDO EL CLIENTE ENTRA]
Al activarse el contrato (Flujo Principal):
  Sistema crea registro Deposito_Garantia__c:
    - monto_original (calculado: renta_mensual × meses_deposito)
    - estatus: "Retenido"
  Ejecutivo CxC cobra el depósito (incluido en los pagos iniciales)
  Jesús emite la factura de depósito
  Al recibir el pago: ejecutivo aplica en Oracle y actualiza SF
        ↓
[DURANTE EL CONTRATO]
El depósito permanece retenido
Si el cliente incumple pagos: el sistema alerta que existe un depósito
El Director General puede decidir aplicar el depósito a adeudos (caso extremo, requiere aprobación)
        ↓
[CUANDO EL CLIENTE SALE]
Legal procesa el Acta de Restitución y define la decisión del depósito:
  - Devolver 100% (cliente sin adeudos, nave en buen estado)
  - Devolver parcial (hay desperfectos o adeudos menores)
  - Retener 100% (adeudos mayores o daños significativos)
  - Aplicar a adeudos (adeudos pendientes = o > depósito)
        ↓
Legal notifica a CxC con la decisión
CxC recibe en el sistema: Deposito_Garantia.decision = [decisión]
        ↓
¿Hay devolución total o parcial?
  ├── NO (retener 100%) →
  │     Ejecutivo notifica al cliente la decisión con justificación
  │     Sistema cierra el registro del depósito: estatus = "Aplicado a adeudos"
  │     Si hay excedente de adeudos sobre el depósito: continúa proceso de cobranza del excedente
  │
  └── SÍ (devolver algo) →
        Ejecutivo contacta al cliente para iniciar proceso de devolución
        Ejecutivo solicita al cliente:
          1. Carátula bancaria (CLABE y datos de la cuenta de destino)
          2. Carta firmada solicitando la devolución del depósito
        Cliente envía ambos documentos
        Ejecutivo registra recepción en SF y adjunta documentos
        Ejecutivo inicia proceso de firmas internas de autorización
        Sistema registra el progreso del proceso de firmas
        Al completar las firmas: 
          Tesorería ejecuta la transferencia al cliente
          Ejecutivo registra: fecha_devolucion_efectiva + monto_devuelto
          Depósito cierra como: "Devuelto total" o "Devuelto parcial"
```

---

## FLUJO H — SALIDA DEL CLIENTE — PROCESO COMPLETO (CRUCE CON LEGAL, COMERCIAL Y FACTURACIÓN)

```
[TRIGGER — desde Legal]
Convenio de terminación anticipada firmado O contrato vencido sin renovación (salida natural)
Legal notifica a CxC la fecha efectiva de salida del cliente
        ↓
[CHECKLIST AUTOMÁTICO DE SALIDA EN CxC]
Sistema genera automáticamente el checklist de salida del cliente:

  Fase 1 — Verificación de adeudos:
  □ Verificar que no hay facturas de renta pendientes hasta la fecha de salida
  □ Verificar si hay facturas de holdover pendientes
  □ Verificar si hay notas de crédito pendientes de aplicar
  □ Calcular monto total de adeudos del cliente

  Fase 2 — Congelamiento de facturación:
  □ Notificar a Jesús: congelar facturación de [Empresa] a partir de [fecha de salida]
  □ Confirmar que Jesús congeló la facturación en Oracle
  □ Cancelar facturas emitidas posteriores a la fecha de salida

  Fase 3 — Depósito en garantía:
  □ Procesar Acta de Restitución (viene de Legal)
  □ Definir decisión del depósito (con Comercial y dirección)
  □ Ejecutar devolución o retención según la decisión
        ↓
[PROBLEMA ACTIVO A RESOLVER — Actas tardías]
El mayor dolor de CxC hoy es que el Acta de Restitución llega 1-2 meses después 
de que el cliente ya salió, pero Facturación sigue emitiendo facturas.

SOLUCIÓN EN EL SISTEMA:
  En el momento en que Legal registra la terminación del contrato:
  → El sistema inmediatamente notifica a Jesús:
    "🛑 CONGELAR FACTURACIÓN — [Empresa] sale el [fecha]
     No emitir más facturas después de [fecha de salida]"
  → Sistema trackea si Jesús confirmó el congelamiento
  → Si no confirma en 24 horas: alerta a Claudia
  → Si el sistema detecta que Jesús emitió una factura DESPUÉS de la fecha de salida:
    alerta automática al ejecutivo CxC para gestionar la cancelación inmediatamente
    (sin esperar el Acta)
        ↓
[IA — PREDICCIÓN DE CANCELACIONES] ← PUNTO DE IA #5
El sistema aprende a detectar señales de que un cliente está por salir:
  - Solicitudes recurrentes de información sobre terminación anticipada
  - Retraso súbito en pagos de un cliente históricamente puntual
  - Comunicaciones registradas en el sistema sobre su proceso de salida
  - Contrato que no avanza en renovación a menos de 90 días del vencimiento

Cuando la IA detecta alto riesgo de salida:
  → Alerta al LO de Comercial: "Alta probabilidad de que [Empresa] no renueve"
  → Alerta a CxC: "Posible salida de [Empresa] — preparar proceso de cierre"
  → Esto da tiempo para preparar el proceso ANTES de que el Acta llegue
```

---

## FLUJO I — RECONCILIACIÓN Y REPORTES DIARIOS

```
[PROCESO DIARIO — 8 AM]
Gestión y Control publica los dos reportes del día:
  1. Reporte de facturación: todas las facturas emitidas hasta ayer
  2. Reporte de pagos: todos los pagos registrados hasta ayer

[IA — DETECCIÓN DE ANOMALÍAS] ← PUNTO DE IA #6
El sistema analiza automáticamente ambos reportes y detecta:

  Anomalías de facturación:
  - ¿Hay clientes a quienes no se emitió factura este mes?
  - ¿Hay facturas con monto diferente al esperado según el contrato?
  - ¿Hay facturas emitidas a clientes cuyo contrato ya venció?
  - ¿Se aplicó el INPC correctamente en el mes que correspondía?

  Anomalías de pagos:
  - ¿Hay pagos sin identificar (monto no coincide con ninguna factura)?
  - ¿Hay clientes que pagaron pero el monto es diferente al esperado?
  - ¿Hay pagos duplicados?

  El sistema genera un "Resumen de anomalías del día" para el ejecutivo y Claudia:
    "Hoy detecté [N] situaciones que requieren revisión:
     - [Empresa A]: No se emitió factura este mes
     - [Empresa B]: Pago recibido sin identificar ($[monto])
     - [Empresa C]: Factura emitida con monto diferente al contrato"
        ↓
Ejecutivos y Claudia revisan y resuelven las anomalías
Resolución registrada en el sistema para aprendizaje de la IA
```

---

## FLUJO J — RENOVACIÓN DE CONTRATO (CRUCE CON LEGAL — VALIDACIÓN DE ADEUDOS)

```
[TRIGGER — desde Legal]
Legal recibe Hoja de Acuerdos de renovación
Antes de abrir el caso legal, Legal consulta a CxC el estatus de pagos del cliente
        ↓
Sistema verifica automáticamente:
  ¿El cliente tiene adeudos activos?
  ├── NO →
  │     Sistema confirma a Legal: "Cliente al corriente — proceder con renovación"
  │     Legal abre el caso de renovación normalmente
  │
  └── SÍ →
        Sistema alerta a Legal Y al CEM:
          "⚠️ [Empresa] tiene adeudos activos por $[monto] 
           NO se puede renovar hasta regularizar la situación
           Contactos: [datos de CxC ejecutivo asignado]"
        El caso de renovación queda BLOQUEADO hasta resolución
        
        Opciones de resolución:
        A) El cliente paga los adeudos → 
           CxC confirma que el cliente está al corriente
           Sistema desbloquea el caso de renovación en Legal
           
        B) Dirección autoriza renovar con plan de pago → 
           CEO aprueba en el sistema con las condiciones del plan
           Legal puede proceder con la renovación
           CxC continúa el cobro de adeudos en paralelo
           
        C) El cliente no paga y no hay acuerdo → 
           La renovación no procede
           Legal gestiona la terminación del contrato
```

---

## FLUJO K — FORECAST DE COBRANZA (IA)

```
[IA — PROYECCIÓN DE INGRESOS] ← PUNTO DE IA #7
Todos los días al cierre del día, el sistema proyecta:

Próximos 7 días:
  - Facturas con fecha de pago = esta semana
  - Probabilidad de cobro por cliente (basada en score de riesgo)
  - Monto esperado cobrable esta semana

Próximos 30 días:
  - Pipeline de cobros mes actual
  - Estimado de cobros según comportamiento histórico
  - Identificación de cuentas de alto riesgo que afectarán el forecast

Próximos 90 días:
  - Proyección de ingresos por renta
  - INPC incrementos programados
  - Renovaciones próximas a vencer (posible churn = impacto en ingresos)

El forecast se publica en el dashboard ejecutivo para Claudia y el CEO:
  "Proyección de cobros:
   Esta semana: $[X] esperados | Riesgo de no cobro: $[Y]
   Este mes: $[X] esperados | Probabilidad: [%]
   Próximos 90 días: $[X] | Contratos en riesgo de no renovar: [N]"
```

---

## HISTORIAS DE USUARIO — ÁREA CxC

**US-CXC-001**
```
COMO Ejecutivo CxC
QUIERO recibir una notificación completa cuando se active un nuevo contrato
PARA poder iniciar inmediatamente el proceso de onboarding sin buscar información

Criterios de aceptación:
- Recibo notificación con: todos los datos del inquilino incluyendo correo y teléfono de contacto de pagos
- La notificación incluye las condiciones financieras del contrato: renta, depósito, gracia, escalación
- Al recibir la notificación, el sistema ya creó el Ciclo_Facturacion automáticamente
- Tengo una tarea inmediata: "Solicitar cuenta bancaria a Fibra Uno para [Empresa]"
```

**US-CXC-002**
```
COMO Ejecutivo CxC
QUIERO un dashboard diario que me muestre las facturas pendientes de cobro por cliente
PARA priorizar mis acciones del día sin descargar reportes manualmente

Criterios de aceptación:
- El dashboard se actualiza automáticamente cada mañana con los datos de los reportes diarios
- Veo mis cuentas ordenadas por: urgencia (días vencidos) y monto
- El score de riesgo de pago de la IA aparece junto a cada cuenta
- Puedo marcar acciones tomadas directamente desde el dashboard
- Veo qué clientes tienen OC pendiente vs los que no tienen portal
```

**US-CXC-003**
```
COMO Ejecutivo CxC
QUIERO que el sistema gestione automáticamente los recordatorios a clientes con portal
PARA no estar enviando correos manualmente cada 2-3 días

Criterios de aceptación:
- El sistema envía recordatorios automáticos a los clientes con portal cuando no han mandado su OC
- Los recordatorios se envían en los días configurados (día 1, día 3, día 5 sin OC)
- Recibo notificación cuando el sistema envió un recordatorio y cuándo respondió el cliente
- Si el cliente responde y manda la OC, el sistema crea la tarea para que yo cargue la factura al portal
- Veo el historial completo de comunicaciones con el cliente sin buscar correos
```

**US-CXC-004**
```
COMO Ejecutivo CxC
QUIERO que el sistema me sugiera a qué factura aplicar cada pago recibido
PARA hacer la conciliación en Oracle más rápido y con menos errores

Criterios de aceptación:
- El sistema cruza automáticamente el monto del pago contra las facturas pendientes del cliente
- Me muestra la sugerencia de aplicación con su justificación
- Si el pago no coincide exactamente con ninguna factura, me muestra las opciones posibles
- Yo apruebo la aplicación sugerida con un clic
- El sistema registra la decisión final (la mía, no la de la IA sola)
```

**US-CXC-005**
```
COMO Gerente CxC (Claudia)
QUIERO ver el score de riesgo de pago de cada cliente en tiempo real
PARA priorizar a qué cuentas darle seguimiento especial antes de que venza el pago

Criterios de aceptación:
- El score se actualiza cada vez que hay una nueva transacción o actividad del cliente
- El score considera: historial de pagos, días de mora promedio, comportamiento reciente
- Puedo ver qué factores están impactando el score de un cliente específico
- Puedo filtrar mi cartera por nivel de riesgo: Bajo / Medio / Alto / Crítico
- Recibo alerta proactiva cuando el score de un cliente cambia significativamente (ej: pasa de Bajo a Alto)
```

**US-CXC-006**
```
COMO Ejecutivo CxC
QUIERO recibir una alerta inmediata cuando un cliente en proceso de renovación tiene adeudos
PARA coordinar con Legal antes de que el proceso de renovación avance sin resolver el problema

Criterios de aceptación:
- Cuando Legal abre un caso de renovación, el sistema verifica automáticamente el estatus de pagos
- Si hay adeudos: el caso en Legal queda bloqueado y yo recibo la tarea de resolver
- Puedo confirmar en el sistema cuando el cliente solventa su adeudo, y esto desbloquea automáticamente el proceso en Legal
- Si dirección autoriza renovar con adeudos: queda registrado con la autorización del CEO
```

**US-CXC-007**
```
COMO Ejecutivo CxC
QUIERO gestionar el proceso de devolución del depósito en garantía desde el sistema
PARA no perder el rastro de en qué paso está el proceso y qué documentos faltan

Criterios de aceptación:
- Veo el checklist del proceso de devolución: carátula bancaria, carta del cliente, firmas internas
- Puedo adjuntar los documentos directamente al registro del depósito
- El sistema me dice en qué paso de las firmas internas está el proceso
- Al completar todo, el sistema notifica a Tesorería para ejecutar la transferencia
- Queda registro de fecha y monto de devolución para auditoría
```

**US-CXC-008**
```
COMO Gerente CxC (Claudia)
QUIERO ver el reporte de anomalías del día generado por la IA
PARA resolver inconsistencias antes de que se conviertan en problemas

Criterios de aceptación:
- El reporte aparece automáticamente en mi dashboard cada mañana
- Me muestra: facturas faltantes, montos incorrectos, pagos sin identificar
- Puedo asignar cada anomalía a un ejecutivo para resolución
- El ejecutivo registra cómo resolvió la anomalía (para aprendizaje del sistema)
- Las anomalías que se repiten generan una alerta especial: "Patrón detectado"
```

**US-CXC-009**
```
COMO Gerente CxC (Claudia)
QUIERO ver la proyección de cobros de los próximos 30 y 90 días
PARA reportarle a dirección el forecast de ingresos con datos reales

Criterios de aceptación:
- El forecast muestra: monto esperado, monto en riesgo, probabilidad de cobro
- Se actualiza automáticamente con los cambios en el portafolio (nuevos contratos, renovaciones, salidas)
- Puedo ver el impacto en el forecast de los INPC programados
- Puedo exportar el forecast en PDF para las reuniones de dirección
```

**US-CXC-010**
```
COMO Sistema automático
QUIERO detectar cuando un cliente está por salir antes de que el Acta llegue
PARA congelar la facturación a tiempo y evitar facturas que después hay que cancelar

Criterios de aceptación:
- En el momento que Legal registra cualquier terminación, el sistema notifica INMEDIATAMENTE a Jesús
- Jesús confirma el congelamiento en el sistema (si no confirma en 24h: alerta a Claudia)
- Si el sistema detecta una factura emitida DESPUÉS de la fecha de salida del cliente: alerta inmediata
- El ejecutivo CxC recibe la tarea de gestionar la cancelación inmediatamente (sin esperar el Acta)
```

---

## AUTOMATIZACIONES REQUERIDAS — CxC

```javascript
// AUTOMATION 1: Onboarding nuevo inquilino
trigger: Caso_Legal.estatus == "Firmado — cerrado"
action: [
  crear_ciclo_facturacion(datos_contrato),
  crear_deposito_garantia(si aplica),
  asignar_ejecutivo_cxc(cliente, regla: mismo_grupo_empresarial_first || menor_carga),
  crear_tarea(ejecutivo, "Solicitar cuenta bancaria a Fibra Uno para [Empresa]", hoy + 1_dia),
  generar_correo_bienvenida_cliente(plantilla_automatica)
]

// AUTOMATION 2: Recordatorios OC clientes con portal
trigger: Ciclo_Facturacion.dia_facturacion = hoy 
         AND Account.requiere_oc_para_factura = true
action: 
  si OC_del_mes_actual no recibida:
    dia_1: enviar_correo_automatico(cliente, template: recordatorio_oc_gentil)
    dia_3: enviar_correo_automatico(cliente, template: recordatorio_oc_firme)
    dia_5: [crear_tarea(ejecutivo, "Llamar al cliente sobre OC"), enviar_correo]
    dia_8: [notificar(claudia), escalar]
    dia_12: notificar(cem, "Se requiere apoyo con [Empresa] para obtener OC")

// AUTOMATION 3: Seguimiento de cobranza por días vencidos
trigger: Factura.fecha_limite_pago < hoy AND Factura.estatus != "Pagada"
action:
  dia_1: enviar_recordatorio_automatico(cliente, cortés)
  dia_3: 
    enviar_recordatorio_automatico(cliente, firme)
    si score_riesgo >= 61: crear_tarea(ejecutivo, "Llamar al cliente")
  dia_7: [
    enviar_aviso_formal(cliente),
    notificar(claudia),
    notificar(legal, "Cliente [empresa] con [7] días sin pago")
  ]
  dia_15: notificar([director_legal, cem])
  dia_30: [
    cliente.estatus_pagos = "Mora grave",
    notificar(director_legal),
    bloquear_proceso_renovacion_si_existe()
  ]

// AUTOMATION 4: Alerta de INPC próximo
trigger: Ciclo_Facturacion.proxima_fecha_escalacion = hoy + 30_dias
action: [
  calcular_nueva_renta_inpc(),
  crear_escalacion_inpc_record(),
  notificar(jesus_facturacion, "Incremento INPC pendiente — [empresa] el [fecha]"),
  crear_tarea(ejecutivo, "Verificar que Jesús notificó al cliente sobre INPC")
]

// AUTOMATION 5: Validación de adeudos para renovación
trigger: Caso_Legal_Renovacion.creado = true
action: [
  verificar_adeudos(cuenta),
  si adeudos > 0:
    bloquear_caso_legal(motivo: "Adeudos pendientes"),
    notificar(legal + cem + ejecutivo_cxc, detalles_adeudo),
    crear_tarea(ejecutivo, "Coordinar pago de adeudos de [Empresa] antes de renovación")
  si adeudos = 0:
    notificar(legal, "Cliente al corriente — proceder con renovación")
]

// AUTOMATION 6: Congelamiento de facturación al salir cliente
trigger: Caso_Legal.tipo == "Terminación anticipada" AND estatus == "Firmado"
         OR Contrato.vencido = true AND renovacion = false
action: [
  notificar(jesus_facturacion, "🛑 CONGELAR FACTURACIÓN INMEDIATA — [empresa] sale el [fecha]"),
  crear_tarea(jesus, "Confirmar congelamiento en Oracle", hoy),
  crear_tarea(ejecutivo_cxc, "Iniciar checklist de salida del cliente"),
  iniciar_checklist_salida()
]

// AUTOMATION 7: Alerta de factura post-salida
trigger: Factura.fecha_emision > Contrato.fecha_salida AND Contrato.estatus == "Terminado"
action: [
  notificar(ejecutivo_cxc + claudia, 
    "⚠️ ALERTA: Se emitió una factura a [empresa] DESPUÉS de su fecha de salida. 
     Gestionar cancelación inmediatamente."),
  crear_tarea(ejecutivo, "Cancelar factura indebida de [empresa]", hoy, prioridad: "Urgente")
]

// AUTOMATION 8: Score de riesgo IA (recalibración)
trigger: Factura.pago_registrado OR Factura.vencida OR cliente.actividad_relevante
action: [
  recalcular_score_riesgo_ia(cliente),
  si score_cambio_significativo (>20 puntos):
    notificar(ejecutivo + claudia, "El perfil de riesgo de [empresa] cambió: [anterior] → [nuevo]")
]

// AUTOMATION 9: Forecast diario
trigger: cada_dia_6pm
action: [
  calcular_forecast_cobros(7_dias, 30_dias, 90_dias),
  publicar_en_dashboard(claudia, ceo),
  si cambio_significativo_vs_ayer:
    notificar(claudia, "El forecast de cobros cambió significativamente — revisar")
]

// AUTOMATION 10: Anomalías diarias
trigger: reporte_diario_disponible (8_am)
action: [
  analizar_reporte_facturacion(ia),
  analizar_reporte_pagos(ia),
  generar_reporte_anomalias(),
  publicar_en_dashboard(claudia, ejecutivos),
  si anomalias_criticas > 0:
    notificar(claudia, "🚨 [N] anomalías críticas detectadas hoy — revisión urgente")
]
```

---

## PUNTOS DE IA — RESUMEN

| # | Funcionalidad IA | Dónde aplica | Valor |
|---|---|---|---|
| 1 | Recordatorios proactivos de OC | Clientes con portal | Elimina seguimiento manual diario |
| 2 | Score de riesgo de pago | Todos los clientes | Priorización inteligente de cobranza |
| 3 | Sugerencia de aplicación de pagos | Conciliación Oracle | Reduce errores y tiempo de aplicación |
| 4 | Cálculo automático de INPC | Escalaciones anuales | Elimina error manual en cálculos |
| 5 | Predicción de salida de clientes | Retención / Cierre anticipado | Evita facturas tardías y pérdidas de ingresos |
| 6 | Detección de anomalías | Reportes diarios | Detecta errores que hoy se ven semanas después |
| 7 | Forecast de cobranza | Proyección de ingresos | Visibilidad financiera para dirección |

---

## REGLAS DE NEGOCIO — CxC

```
REGLA 1 — Asignación por cuenta:
  Un ejecutivo atiende TODOS los contratos del mismo cliente
  No se distribuyen contratos del mismo cliente entre varios ejecutivos

REGLA 2 — Activación de facturación:
  La facturación NO inicia hasta que Jesús confirme el alta en Oracle
  El sistema bloquea el ciclo de facturación hasta esa confirmación

REGLA 3 — Clientes con portal:
  NO se puede emitir factura sin haber recibido la OC del cliente
  Solo se puede emitir la factura cuando se recibe la OC

REGLA 4 — Aplicación de pagos:
  El ejecutivo CxC siempre decide la aplicación del pago (la IA solo sugiere)
  Un pago aplicado no puede des-aplicarse sin autorización de Claudia

REGLA 5 — Notas de crédito:
  TODAS las notas de crédito requieren aprobación del CEO
  Sin excepción, independientemente del monto

REGLA 6 — Renovación con adeudos:
  No se puede renovar a un cliente con adeudos activos sin autorización del CEO
  El proceso de renovación en Legal queda bloqueado automáticamente

REGLA 7 — Devolución del depósito:
  La devolución del depósito requiere: Acta de Restitución procesada + aprobación de Comercial + proceso de firmas internas
  No se puede ejecutar sin los tres pasos completados en el sistema

REGLA 8 — Congelamiento de facturación:
  En el momento que Legal registra la salida de un cliente:
  El sistema notifica a Jesús INMEDIATAMENTE para congelar Oracle
  No se espera al Acta de Restitución para este paso

REGLA 9 — Score de riesgo:
  El score es informativo — el ejecutivo siempre puede sobrescribir la prioridad
  El sistema nunca toma acciones automáticas de cobranza sin que un ejecutivo lo apruebe
  (excepción: recordatorios automáticos rutinarios que el cliente puede cancelar)
```

---

## DASHBOARDS Y REPORTES — CxC

### Dashboard del Ejecutivo CxC
```
- Mis cuentas activas ordenadas por riesgo y urgencia
- Facturas vencidas hoy y próximas a vencer (7 días)
- Clientes con OC pendiente (con portal)
- Pagos pendientes de aplicar en Oracle
- Tareas del día con prioridad
- Score de riesgo de mis cuentas (semáforo verde/amarillo/naranja/rojo)
```

### Dashboard de Claudia (Gerente)
```
- Vista general de las 3 carteras (ejecutivo 1, 2, 3) con indicadores de salud
- Cuentas en mora por ejecutivo y monto total
- Anomalías del día detectadas por IA (pendientes de resolución)
- Notas de crédito pendientes de aprobación
- Holdovers activos con monto acumulado
- Cuentas en proceso de salida (checklist de cierre)
- Forecast de cobros 7/30/90 días
- Depósitos en proceso de devolución
```

### Dashboard Ejecutivo (CEO) — sección CxC
```
- Monto total de cartera por cobrar
- Cartera vencida vs corriente
- Forecast de cobros del mes
- Holdovers activos con impacto en ingresos
- Notas de crédito pendientes de aprobación (con monto)
- Clientes en mora grave (para decisiones ejecutivas)
```

---

## NOTAS DE IMPLEMENTACIÓN PARA CURSOR

```
1. INTEGRACIÓN CON ORACLE:
   CxC interactúa con Oracle en dos sentidos:
   - Lee: reporte de facturación diario + reporte de pagos diario
   - Escribe: aplicación de pagos a facturas
   La integración debe permitir que SF refleje el estado de Oracle (lectura)
   y que el ejecutivo aplique pagos desde SF (escribe en Oracle)
   Jesús trabaja directamente en Oracle — SF debe sincronizarse

2. REPORTE DIARIO DE GESTIÓN Y CONTROL:
   Hoy este reporte llega por correo. En SF debería:
   - Sincronizarse automáticamente (si hay API disponible de Oracle)
   - O bien: Gestión y Control lo sube al sistema y el SF lo procesa
   La IA de anomalías corre sobre este reporte

3. CLIENTES CON PORTAL — CASOS CONOCIDOS:
   Hay múltiples portales diferentes por cliente (cada empresa tiene el suyo)
   No existe integración directa con los portales de los clientes
   El ejecutivo entra manualmente al portal del cliente
   El sistema debe facilitar el tracking de estado sin integración directa al portal

4. FIBRA UNO — CUENTAS BANCARIAS:
   Desde enero 2026 cada cliente tiene cuenta bancaria personalizada
   La solicitud a Fibra Uno es manual (correo o sistema de Fibra Uno)
   En SF: el ejecutivo registra la cuenta asignada manualmente
   Los pagos llegan identificados por cliente gracias a las cuentas personalizadas

5. MONEDA:
   Algunos contratos son en MXN, otros en USD
   CxC maneja ambas monedas
   El sistema debe manejar el tipo de moneda por contrato
   Si es USD: ¿se cobra en USD o en MXN al tipo del día? → Confirmar con Parks Industrial

6. DATOS PARA LA DEMO:
   
   Ejecutivo 1 — Cartera de 200 cuentas, 3 con OC pendiente de portal
   
   Caso Demo 1 — Cliente puntual recibiendo INPC:
     Empresa: LogiMex S.A. de C.V.
     Score riesgo: 🟢 Bajo (18/100)
     Contrato activo desde hace 2 años
     INPC aplicable en 30 días: 4.2% → renta sube de $425,000 a $442,850 MXN
     
   Caso Demo 2 — Cliente en mora con portal:
     Empresa: Distribuciones Norte S.A.
     Score riesgo: 🔴 Crítico (87/100)
     OC pendiente desde hace 8 días
     Factura de renta de este mes sin emitir por falta de OC
     Monto en riesgo: $318,000 MXN
     
   Caso Demo 3 — Holdover activo:
     Empresa: Empresa Manufactura GDL
     52 días en holdover
     Facturas de holdover emitidas: 2 (una del mes pasado + una de este mes)
     Monto acumulado holdover: $1,072,000 MXN (doble renta × 2 meses)
     CEO debe decidir si condona al momento de renovar
     
   Caso Demo 4 — Devolución de depósito en proceso:
     Empresa: Cliente que salió hace 3 semanas
     Depósito original: $636,000 MXN (2 meses de renta)
     Decisión Legal: devolver 75% ($477,000 MXN) — hay desperfectos menores
     Carátula bancaria: recibida ✅
     Carta de solicitud: recibida ✅
     En proceso de firmas internas
     
   Caso Demo 5 — IA Forecasting:
     Forecast este mes: $12.4M MXN esperados
     En riesgo: $1.8M MXN (3 clientes con score Alto/Crítico)
     Probabilidad de cobro: 86%

7. JESUS GAZÓN — FLUJOS PENDIENTES:
   Hay procesos que involucran a Jesús que aún no tienen discovery completo:
   - Cómo exactly emite las facturas en Oracle (¿automático o manual?)
   - Cómo configura los períodos de gracia
   - Cómo maneja las cancelaciones de facturas por Acta de Restitución
   - Si Oracle puede enviar confirmaciones automáticas a SF
   Estos flujos deben refinarse en la sesión pendiente con Jesús

8. SLAs RECOMENDADOS A PROPONER A PARKS INDUSTRIAL:
   (No existen hoy — hay que proponerlos antes del go-live)
   - Alta del contrato en Oracle por Jesús: ≤ 3 días hábiles desde notificación
   - Primera factura emitida: ≤ 5 días hábiles desde alta en Oracle
   - Aplicación de pagos en Oracle: mismo día o al siguiente día hábil
   - Respuesta a disputas de INPC: ≤ 10 días hábiles
   - Proceso de devolución de depósito: ≤ 15 días hábiles desde Acta completa
   - Cancelación de facturas post-salida: ≤ 5 días hábiles desde notificación de salida
```

---

*Documento preparado por Bridge Studio — Julio 2026*
*Base de implementación para demo Salesforce CRM — Parks Industrial*
*Versión 1.0 — Área de Cuentas por Cobrar completa*
*Para uso en Cursor — módulo a extender sobre CRM base ya montado*
