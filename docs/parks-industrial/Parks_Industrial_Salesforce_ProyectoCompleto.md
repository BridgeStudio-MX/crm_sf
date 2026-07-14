# Parks Industrial × Bridge Studio

## Implementación Salesforce CRM — Documento Maestro del Proyecto

### Versión 2.0 — Actualizado con todos los discoveries

**Clasificación:** Confidencial — Uso interno Bridge Studio \+ Base para demo con IA **Última actualización:** Julio 2026 **Basado en:** 4 transcripts de videollamadas \+ 3 sesiones de discovery (Legal, Comercial, CxC)

---

## 1\. CONTEXTO DEL CLIENTE

### 1.1 Quiénes son

- **Empresa:** Parks Industrial  
- **Giro:** Administración, operación y construcción de parques industriales a nivel nacional en México  
- **Estructura:** Parte de un grupo empresarial más grande que incluye hotelería, plazas comerciales y otros sectores  
- **Situación:** Las empresas hermanas llevan 4+ años con Salesforce implementado. Parks Industrial es la única sin él. El CEO quiere homologar métricas para presentarlas en reuniones de consejo del grupo.  
- **Referencia importante:** La empresa hermana ALLUX ya tiene Salesforce implementado con un módulo llamado "Comité ALLUX" que captura condiciones comerciales antes del cierre. Este modelo es la base de referencia para Parks Industrial.

### 1.2 Contactos clave del proyecto

| Nombre | Área | Rol en el proyecto | Prioridad de acceso SF |
| :---- | :---- | :---- | :---- |
| Lilibeth López de la Cruz | Mercadotecnia | Punto de contacto principal, líder interno | Alta |
| Charles El-Mann Metta | Dirección General (CEO) | Tomador de decisión final | Dashboard ejecutivo |
| Catalina Moreno Monroy | Legal | Referente del proceso contractual | Admin legal |
| Héctor Montelongo | Comercial | Director Comercial (CEM) | Admin comercial |
| Claudia Rodríguez | Cuentas por Cobrar | Gerente CxC — 3 ejecutivos a cargo | Usuario CxC |
| Jesús Gazón | Contratos y Facturación | Alta de contratos en Oracle, facturación, Rent Roll | Usuario Contratos ⚠️ Pendiente discovery |
| Liz | Parks Industrial | Participó en sesión CxC | Por definir |

### 1.3 Tipos de propiedad — distinción crítica para el motor de comisiones

| Tipo | Descripción | Comisión interna |
| :---- | :---- | :---- |
| **Propiedad propia** | Naves de Parks Industrial | ✅ Genera comisión para equipo comercial y brokers |
| **Propiedad FUNO / FinSA** | Naves administradas para la FIBRA | ❌ Comisión va directo a la FIBRA — no al equipo interno |

⚠️ Esta distinción debe estar modelada desde el diseño inicial. El campo `Es_Propiedad_FUNO__c` en el objeto Nave determina automáticamente si aplica o no comisión interna.

---

## 2\. MAPA DE RESPONSABILIDADES POR ÁREA

Este mapa es crítico para la demo — define quién hace qué en cada etapa del proceso:

| Área | Responsable | Función principal | Sistema actual |
| :---- | :---- | :---- | :---- |
| **Comercial** | Héctor \+ 3 Leasing Officers | Pipeline, prospectos, brokers, negociación, Hoja de Acuerdos | Monday \+ WhatsApp \+ Excel individual |
| **Legal** | Catalina \+ abogados | Contratos, renovaciones, flujo de firmas, SLAs | Monday \+ Excel "renrol" \+ carpetas físicas |
| **Contratos y Facturación** | Jesús Gazón | Alta en Oracle, facturación mensual, holdover, INPC, Rent Roll | Oracle |
| **Cuentas por Cobrar** | Claudia \+ 3 ejecutivos | Cobro, seguimiento de pagos, conciliación, depósitos | Oracle \+ correo |
| **Gestión y Control** | Sin nombre confirmado | Genera reportes diarios de facturación y pagos | Reporte manual |
| **Tesorería Fibra Uno** | Externo — FUNO | Asigna cuentas bancarias por cliente, registra pagos | Banca digital (1 día desfasado) |
| **Tenant / PHH** | Sin nombre confirmado | Entrega física de naves, actas de restitución | Sin sistema identificado |

---

## 3\. SISTEMAS ACTUALES Y DESTINO EN EL PROYECTO

| Sistema | Área que lo usa | Para qué | Destino |
| :---- | :---- | :---- | :---- |
| **Oracle ERP** | Contratos, Facturación, CxC | Pagos, facturación, alta de contratos, conciliación | Permanece — SF lee vía integración API |
| **Power BI** | Comercial | Inventario de propiedades disponibles — alimentado por Jesús Gazón | ⚠️ Investigar qué alimenta el Power BI — puede ser Oracle u otro sistema |
| **Monday.com** | Comercial \+ Legal | Seguimiento de oportunidades, asignación de abogados, indicadores | Se elimina — todo migra a Salesforce |
| **Excel individual** | Comercial (cada LO) | Leads perdidos, prospectos sin cerrar | Se elimina — migra a SF |
| **Excel "renrol"** | Legal | Control de renovaciones con semáforo de colores | Se elimina — reemplaza con dashboards y alertas SF |
| **Carpetas físicas** | Legal | Expedientes de contratos firmados | Se mantiene físico por directiva del CEO. SF gestiona seguimiento digital |
| **Correo electrónico** | Todas las áreas | Tickets entre áreas, comunicación de cambios, INPC | SF reemplaza la coordinación interna — correo solo para cliente externo |

⚠️ **Alerta crítica sobre inventario:** El equipo comercial confirmó que el inventario de propiedades disponibles vive en **Power BI**, NO en Oracle directamente. Hay que identificar qué fuente alimenta ese Power BI antes de diseñar la integración del módulo de inventario.

---

## 4\. PROCESO COMERCIAL COMPLETO

### 4.1 Equipo comercial

- 1 Director Comercial (CEM / Héctor Montelongo) — asigna los leads directamente  
- 3 Leasing Officers — atienden, dan tours, negocian y cierran  
- Promedio: 22 leads por agente simultáneamente  
- Ciclo de venta: mínimo 1 mes, promedio 4-6 meses, máximo 8 meses

### 4.2 Fuentes de prospecto (canales de origen)

Confirmados en discovery:

- Recomendaciones de clientes actuales  
- Call Center  
- Clientes de CEM (Director Comercial)  
- LinkedIn  
- Página web  
- Brokers externos (contactan al LO, agendan tour — el LO siempre cierra)

### 4.3 Pipeline — 4 etapas actuales (a expandir en SF)

Hoy manejan: **Llamada → Visita → Seguimiento → Cierre**

Pipeline recomendado para Salesforce (9 etapas):

| \# | Etapa SF | Probabilidad | Descripción |
| :---- | :---- | :---- | :---- |
| 1 | Lead recibido | 10% | Prospecto registrado, pendiente calificar |
| 2 | Calificado | 20% | Tiene definido qué quiere — m², zona, plazo |
| 3 | Tour / Visita | 35% | Visitó parque o nave — interés confirmado |
| 4 | Cotización enviada | 50% | Propuesta económica formal entregada |
| 5 | En negociación | 65% | Condiciones siendo negociadas |
| 6 | Hoja de Acuerdos firmada | 85% | LOI firmada — pasa a Legal |
| 7 | En proceso legal | 95% | Contrato en elaboración y firma |
| 8 | Ganado — Contrato firmado | 100% | Contrato completo con todas las firmas |
| 9 | Perdido | 0% | Con razón de pérdida registrada |

### 4.4 Campos requeridos por prospecto (confirmados en discovery)

- Nombre y apellidos  
- Empresa  
- Correo electrónico  
- Giro de la empresa  
- M² requeridos  
- Ubicación deseada  
- Plazo del contrato (meses)  
- Presupuesto mensual  
- Años de renta deseados

### 4.5 Calificación de leads

**Situación actual:** No hay criterios formales. Se da seguimiento a todos los leads. Los prospectos perdidos quedan en Excel individual de cada LO — sin base compartida, sin nurturing.

**Criterio mínimo identificado:** "Que tenga bien definido lo que quiere."

**Acción requerida:** Antes del go-live hay que construir un modelo de calificación con Héctor. Sin esto el CRM se llenará de leads sin valor.

### 4.6 Brokers externos

- Solo contactan al Leasing Officer y agendan el tour  
- El LO siempre cierra el trato — el broker nunca cierra solo  
- El broker es una fuente de lead, no un actor activo en el cierre  
- Los brokers NO tienen acceso a Salesforce — solo reciben su pago

### 4.7 Motor de comisiones — 3 esquemas confirmados

| Esquema | Descripción |
| :---- | :---- |
| Esquema 1 | Cerrado por recursos propios del LO (sin broker) |
| Esquema 2 | Cerrado con broker externo top 10 |
| Esquema 3 | Cerrado con broker externo fuera del top 10 |

⚠️ Los porcentajes exactos de cada esquema no fueron revelados en el discovery. Hay que obtenerlos antes de configurar el motor de comisiones. Sin eso la Fase 5 no puede arrancar.

### 4.8 Decisores del lado del cliente

Entre 2 y 5 personas involucradas:

- Dueño de la empresa  
- Director de logística  
- Gerente de operaciones  
- Gerente de ampliación  
- Broker representando al cliente (cuando aplica)

### 4.9 Metas individuales

No hay cuotas individuales por ejecutivo. Todos pueden prospectar a cualquier cliente en cualquier zona.

### 4.10 Marketing y mailing

- 2 envíos de mailing al mes  
- Opera mercadotecnia — actualmente por correo directo manual  
- Account Engagement automatiza y añade tracking de apertura y segmentación

### 4.11 Reportes comerciales actuales

Comparativa mensual de:

- M² rentados mes actual vs mes anterior  
- M² rentados mes actual vs mismo mes año anterior  
- M² prospectados  
- M² en construcción

Estos son los primeros dashboards que deben estar listos el día del go-live.

---

## 5\. PROCESO LEGAL COMPLETO

### 5.1 Punto de entrada

El proceso legal inicia ÚNICAMENTE cuando Comercial entrega la **Hoja de Acuerdos firmada**. Sin este documento Legal no puede iniciar ningún proceso.

### 5.2 Tipos de documento

| Tipo | SLA |
| :---- | :---- |
| Contrato de arrendamiento nuevo | 60 días hábiles |
| Convenio modificatorio de renovación | 45 días hábiles |
| Convenio modificatorio de aclaración | Variable |
| Convenio de terminación anticipada | Variable |
| Build-to-suit | 90 días hábiles |

El SLA inicia cuando Comercial entrega la Hoja de Acuerdos — no cuando el cliente decide renovar.

### 5.3 Flujo de autorización del contrato

Cliente firma físicamente (REQUISITO PREVIO — directiva CEO)

        ↓

Catalina realiza cotejo (versión impresa \= última versión digital)

        ↓

Sello de jurídico

        ↓

Subdirector Legal rubrica

        ↓

Director General (Charles El-Mann Metta) — primera rúbrica

        ↓

Representantes FUNO / NEXT (cuando aplica) — 2 apoderados \+ director jurídico

        ↓

Contrato cerrado → Flow automático notifica a todas las áreas

⚠️ TODO ES FÍSICO. Por directiva del CEO las firmas deben ser autógrafas. Salesforce gestiona el seguimiento digital pero NO reemplaza la firma física.

### 5.4 Checklist de documentación del cliente (bloqueante)

- [ ] Acta constitutiva  
- [ ] Poder notarial del representante legal  
- [ ] Comprobante de domicilio fiscal  
- [ ] INE del representante legal  
- [ ] Constancia de Situación Fiscal (CSF)  
- [ ] Constancia de cumplimiento de obligaciones  
- [ ] Estados financieros auditados (obligado solidario)  
- [ ] Garantía: carta de crédito bancaria, fianza o garantía corporativa

### 5.5 Sistema de semáforo de renovaciones (migrar de Excel a SF)

| Color | Estatus | Acción |
| :---- | :---- | :---- |
| 🔵 Azul | Caso recién asignado | Iniciar elaboración |
| 🟠 Naranja | En revisión con cliente | Seguimiento vía Comercial |
| 🟡 Amarillo | Cliente próximo a salir | Escalar a dirección |
| 🟢 Verde | Firmado | Cerrar y notificar |
| 🔴 Rojo | Vencido sin firmar | Holdover activo — acción urgente |

### 5.6 Permisos de acceso

| Perfil | Modificar | Leer | Solo ver |
| :---- | :---- | :---- | :---- |
| Director Legal, Subdirector, CEO, Catalina | ✅ | ✅ | ✅ |
| Abogados asignados | ❌ | ✅ | ✅ |
| CxC | ❌ | ❌ | ✅ |

### 5.7 Ticket de notificación al cerrar contrato

Al firmar, Catalina notifica a:

- Comercial → calcula comisión  
- Cuentas por Cobrar → inicia proceso de cobro  
- Contratos / Facturación (Jesús) → da de alta en Oracle y emite facturas iniciales  
- Tenant → coordina entrega física de la nave  
- Administrador del Parque → recibe al nuevo inquilino

**En Salesforce:** Este ticket manual se convierte en un Flow automático que notifica simultáneamente a todas las áreas.

### 5.8 Holdover

- Cuando un contrato vence sin renovación firmada  
- Jesús (Facturación) emite factura por el doble de la renta mensual  
- CxC da seguimiento de cobro como cualquier otra factura  
- Como presión adicional: corte de agua y acceso a casetas del parque  
- El Director General puede condonar la factura de holdover

⚠️ Situación activa de riesgo: existen contratos sin renovación firmada desde diciembre — 5+ meses — con inquilinos operando sin documento legal vigente.

---

## 6\. PROCESO DE CONTRATOS Y FACTURACIÓN (JESÚS GAZÓN)

⚠️ Este proceso requiere una sesión de discovery pendiente con Jesús Gazón. Lo que sabemos viene de lo mencionado por Claudia en CxC.

### 6.1 Responsabilidades confirmadas de Jesús

- Alta del contrato en Oracle una vez recibido firmado  
- Configuración de períodos de gracia en Oracle  
- Emisión de facturas mensuales recurrentes  
- Emisión de facturas de holdover  
- Notificación de incrementos INPC al cliente con cálculo detallado  
- Generación del Rent Roll (reporte maestro de contratos)  
- Elaboración de formatos de notas de crédito para aprobación de dirección

### 6.2 Flujo de facturación mensual

1. Jesús da de alta el contrato en Oracle con inicio, períodos de gracia y fechas de incremento  
2. Oracle emite facturas automáticamente según el calendario configurado  
3. CxC valida mensualmente que las facturas se estén emitiendo en tiempo y forma  
4. Si falta una factura: CxC manda correo a Jesús solicitando emisión

### 6.3 Incrementos INPC

- Facturación notifica al cliente por correo con el cálculo exacto: renta actual, índice INPC del mes que aplica, porcentaje y nueva renta  
- Si el cliente disputa el incremento: Comercial interviene en la negociación  
- **Problema activo:** A veces se olvida aplicar el incremento en la fecha correcta y se aplica retroactivo al mes siguiente. Salesforce debe generar alerta automática a Jesús antes de cada fecha de incremento.

### 6.4 Acta de Restitución — proceso de salida del cliente

1. Cliente entrega la nave a Tenant  
2. Tenant levanta acta con estado del inmueble y desperfectos  
3. Acta llega a CxC especificando si se devuelve depósito total, parcial o se retiene  
4. Comercial define la decisión de retención según adeudos  
5. Facturación cancela facturas posteriores a la fecha de salida  
6. **Problema activo:** El acta llega con 1-2+ meses de retraso. Mientras tanto Facturación sigue emitiendo facturas que después hay que cancelar. El proceso de cancelación tarda 2-3 meses adicionales por autorizaciones de dirección. Genera falsos adeudos en reportes.

---

## 7\. PROCESO DE CUENTAS POR COBRAR (CLAUDIA)

### 7.1 Cómo inicia el proceso

CxC recibe el ticket de Legal por correo. Hay dos versiones:

- **Word (previo):** Sin firmas — puede cambiar. Se usa como antecedente pero NO activa facturación.  
- **PDF firmado:** Versión oficial autorizada por dirección. Este es el trigger real para CxC.

**En Salesforce:** El Flow a CxC solo se dispara cuando el contrato alcanza estatus "Firmado" — nunca con el previo en Word.

### 7.2 Problema crítico en el ticket actual

El ticket de Legal no incluye los datos de contacto del cliente (correo, teléfono). CxC tiene que pedirlos a Comercial o Legal, lo que retrasa el inicio del cobro.

**En Salesforce:** El Flow debe incluir automáticamente nombre, correo y teléfono del contacto principal desde el expediente de la oportunidad.

### 7.3 Cuentas bancarias por cliente (desde enero 2026\)

Desde enero 2026 hubo una migración: cada cliente tiene una cuenta bancaria personalizada asignada por Tesorería de Fibra Uno. Al recibir un contrato nuevo, CxC debe solicitar a Fibra Uno la asignación de la cuenta indicando: razón social del cliente, moneda y parque/nave.

### 7.4 Proceso de cobro mensual

**Clientes sin portal:**

- Reciben factura el día 1  
- Pagan entre el día 5 y el día 10 del mes  
- CxC da seguimiento si no hay pago en esas fechas

**Clientes con portal (creciente número):**

- El cliente primero envía una Orden de Compra  
- CxC solo puede emitir factura cuando llega la OC  
- Carga la factura \+ información en el portal del cliente  
- El cliente cuenta sus días de crédito desde esa fecha  
- Hay clientes que tardan hasta el día 15 en mandar la OC — todo el seguimiento es manual

**Problema activo:** No hay automatización para recordatorios a clientes de portal. CxC manda correos manuales cada 2-3 días. Con 200 contratos por ejecutivo esto consume tiempo desproporcionado.

### 7.5 Registro y conciliación de pagos

- Reportes diarios generados por Gestión y Control (no por CxC)  
- Los pagos llegan con 1 día de desfase — lo que CxC ve hoy es lo que cayó ayer  
- CxC entra a Oracle y aplica manualmente cada pago a la factura correspondiente  
- Si el cliente tiene facturas vencidas: CxC decide a cuál aplicar el pago  
- Fibra Uno hace revisiones continuas (diario, mensual, anual) de que todos los pagos estén aplicados

### 7.6 Depósito en garantía — ciclo completo

1. Se cobra al inicio del contrato (90% de los casos — 2 meses en el ejemplo de ALLUX)  
2. Al salir el cliente: Tenant levanta Acta de Restitución  
3. Acta especifica si se devuelve total, parcial (50-60%) o se retiene  
4. Si no hay adeudos: CxC inicia proceso de devolución  
5. CxC solicita al cliente: carátula bancaria \+ carta de solicitud de devolución  
6. CxC ejecuta proceso interno de firmas de autorización  
7. Todo con firma de conformidad del cliente

### 7.7 Notas de crédito y descuentos

- Descuentos por pronto pago  
- Descuentos por renovación anticipada o plazo extendido  
- Notas de crédito por errores de facturación  
- Todos requieren: soporte por escrito \+ formato de Facturación \+ aprobación de Dirección  
- **No son muchos casos pero todos pasan por dirección** — cuello de botella en autorizaciones

### 7.8 Casos especiales de contratos (descubiertos en discovery)

- Descuento del X% si el cliente paga antes del día 10  
- Período de gracia distribuido: 1 mes el primer año, 1 mes el segundo año, 1 mes el tercer año  
- Combinaciones atípicas documentadas en el contrato pero no en ningún sistema centralizado  
- **Problema activo:** CxC no siempre está enterada de estas condiciones especiales porque todo se negocia por correo entre Comercial y el cliente.

### 7.9 Reportes de CxC

| Reporte | Frecuencia | Generado por | Consumido por |
| :---- | :---- | :---- | :---- |
| Facturación del día | Diario (mañana) | Gestión y Control | CxC |
| Pagos aplicados | Diario (mañana) | Gestión y Control | CxC |
| Rent Roll | Periódico | Jesús Gazón | Todas las áreas |
| Revisión de pagos aplicados FUNO | Diario \+ mensual \+ anual | Fibra Uno | CxC |

### 7.10 Volumen y estructura del área

- 3 ejecutivos \+ Claudia (gerente)  
- \~600 contratos activos  
- \~200 contratos por ejecutivo  
- Asignación por CUENTA, no por contrato — un ejecutivo ve todos los contratos del mismo cliente

### 7.11 SLAs y KPIs de CxC

**Situación actual:** No existen SLAs ni KPIs formales en el área. No hay protocolo definido para escalar situaciones.

**Acción requerida antes del go-live:** Proponer parámetros a Parks Industrial. Ejemplos:

- Máximo X días para que una factura sea emitida desde que se da de alta el contrato  
- Máximo X días para que un pago sea aplicado en Oracle  
- Escalamiento automático si un cliente no paga en X días después de la fecha acordada

### 7.12 Mayor dolor del área (confirmado por Claudia)

Errores en facturación y cancelaciones tardías por Acta de Restitución. Proceso: cliente sale → acta llega 1-2 meses después → Facturación necesita 2-3 meses adicionales para cancelar facturas por autorizaciones de dirección → mientras tanto hay falsos adeudos en los reportes.

---

## 8\. REFERENCIA ALLUX — MÓDULO "COMITÉ"

La empresa hermana ALLUX tiene Salesforce implementado con un módulo llamado "Comité ALLUX" que es la referencia más directa para Parks Industrial. Los campos confirmados en su implementación:

| Campo ALLUX | Equivalente Parks Industrial |
| :---- | :---- |
| Portafolio | Parque industrial |
| Fecha Comité ALLUX | Fecha de aprobación interna |
| Nombre del parque industrial | Nombre del parque |
| Cotización | Número de oportunidad |
| Nombre del comercio | Razón social del inquilino |
| Giro / Subgiro | Sector de la empresa |
| Nomenclatura (BOD PA-1H ETAPA 1\) | Clave de la nave |
| GLA Cliente / GLA Local | M² rentados |
| Costo por m² | Precio USD o MXN/m²/mes |
| Renta mensual | Calculado automáticamente |
| % de Incremento | INPC |
| Plazo forzoso | Meses del contrato |
| Prórroga | Meses de extensión |
| Guante pactado | Incentivo al broker o inquilino |
| Depósitos en Garantía | Meses de depósito |
| Rentas adelantadas | Meses adelantados |
| Período de gracia | Meses sin pago |
| Broker | Nombre del broker |
| Condiciones especiales | Cláusulas fuera de estándar |
| Observaciones | Estado de entrega de la nave |

**Menú de navegación de ALLUX (referencia de objetos a replicar):** Inicio → Chatter → Prospectos → Cuentas → Contactos → Oportunidades → Comité

---

## 9\. PRODUCTOS SALESFORCE — STACK DEFINITIVO

### 9.1 Productos a implementar

| Producto | Justificación | Usuarios |
| :---- | :---- | :---- |
| **Sales Cloud Enterprise** | Core del CRM. Pipeline, leads, oportunidades, automatizaciones, API Oracle. Enterprise requerido por integraciones custom | Todos los usuarios |
| **CRM Analytics (BI)** | Dashboards ejecutivos para CEO y dirección. Métricas homologadas con el grupo | Solo dirección (\~10 usuarios) |
| **Account Engagement** | Automatización de 2 mailings mensuales, segmentación, tracking de apertura | 1 organización |
| **S-Docs** | Generación automática de PDFs para los 4 tipos de contrato desde datos de SF | Usuarios legales \+ comerciales |
| **Salesforce Platform** | Para usuarios ligeros (CxC, Tenant, Admin de parque) que solo visualizan | Usuarios de solo lectura |
| **Almacenamiento adicional** | Expedientes digitales, PDFs, documentos | Por GB adicional |

### 9.2 Productos descartados

| Producto | Razón |
| :---- | :---- |
| **Salesforce Maps** | No aplica — no hay vendedores en campo con rutas diarias |
| **S-Sign** | Firmas autógrafas obligatorias por directiva del CEO. Módulo opcional si la política cambia |
| **MuleSoft / Salesforce Connect** | Integración Oracle vía API custom por Bridge — sin licencia adicional |
| **DocuSign** | Mismo argumento que S-Sign |

---

## 10\. ARQUITECTURA DEL SISTEMA

### 10.1 Objetos custom a crear en Salesforce

| Objeto | Campos clave |
| :---- | :---- |
| **Parque** | Nombre, ubicación, m² totales, m² rentados, administrador, estatus |
| **Nave** | M², altura libre, andenes, carga de piso, potencia eléctrica, estatus, `Es_Propiedad_FUNO__c`, parque vinculado |
| **Inquilino** | Empresa, contacto principal, historial de contratos, estatus, ejecutivo asignado |
| **Broker** | Empresa, contacto, tipo (top 10 / no top 10), comisiones históricas |
| **Hoja de Acuerdos** | Condiciones comerciales, fecha de firma, ejecutivo, broker, m², precio/m², plazo, gracia, depósito |
| **Expediente de Contrato** | Tipo, inquilino, nave, parque, fechas, renta, FUNO flag, SLA, estatus semáforo |
| **Comisión** | Tipo (interna/broker/FUNO), monto, operación vinculada, estatus de pago, esquema aplicado |
| **Acta de Restitución** | Cliente, nave, fecha de salida, estado del inmueble, decisión de depósito, adeudos pendientes |
| **Nota de Crédito** | Cliente, factura vinculada, monto, razón, aprobación de dirección, fecha |

### 10.2 Integración Oracle

Oracle ERP

    │

    ├── Pagos realizados por inquilinos ──────────────► SF: actualiza estatus de pago en expediente

    ├── Contratos dados de alta ─────────────────────► SF: confirma activación del contrato

    ├── Facturas emitidas ───────────────────────────► SF: registra emisión en expediente

    │

    ◄─── SF: notifica cierre de contrato / renovación ──── Salesforce CRM

    ◄─── SF: notifica inicio de holdover

    ◄─── SF: notifica salida de cliente (Acta de Restitución)

⚠️ Sobre Power BI e inventario: el equipo comercial confirmó que el inventario de propiedades disponibles se consulta en Power BI alimentado por Jesús Gazón. Antes de diseñar la integración hay que confirmar si Oracle es la fuente que alimenta ese Power BI o si es un sistema separado.

### 10.3 Integración con Fibra Uno / FUNO

- Fibra Uno asigna cuentas bancarias personalizadas por cliente  
- Fibra Uno registra pagos (con 1 día de desfase)  
- Fibra Uno hace revisiones de pagos aplicados (diario, mensual, anual)  
- Esta integración es externa — Salesforce debe reflejar el estatus de pagos que viene de Oracle (donde Fibra Uno registra)

---

## 11\. MÓDULOS DEL SISTEMA — DESCRIPCIÓN COMPLETA

### Módulo 01 — Pipeline Comercial

**Qué hace:**

- 9 etapas de pipeline adaptadas al proceso real de Parks Industrial  
- Asignación de LOs y brokers por oportunidad  
- Seguimiento de m² por oportunidad  
- Origen del lead (canal de entrada)  
- Campos obligatorios bloqueantes por etapa  
- Alertas si una oportunidad lleva \+15 días sin actividad

**Datos de la demo:**

- 22 leads promedio por LO activos simultáneamente  
- Ciclo promedio: 4-6 meses

### Módulo 02 — Ecosistema de Brokers

**Qué hace:**

- Registro de brokers con clasificación (top 10 / no top 10\)  
- Vinculación de broker a oportunidad  
- Trazabilidad de participación por operación  
- Base para motor de comisiones (3 esquemas)  
- Brokers sin acceso a SF — solo reciben pago

### Módulo 03 — Gestión Contractual

**Qué hace:**

- 4 tipos de documento con flujos diferenciados  
- Checklist de documentación bloqueante  
- Generación automática de PDFs con S-Docs  
- Flujo de 4 firmas internas (Subdirector → DG → FUNO/NEXT)  
- Registro de auditoría: quién hizo qué y cuándo  
- Flow automático de ticket al cerrar contrato

**Referencia:** Módulo "Comité" de ALLUX es el modelo base

### Módulo 04 — Alertas de Renovación

**Qué hace:**

- Semáforo automático (reemplaza Excel "renrol")  
- Alertas escalonadas: 12, 6, 3 y 1 mes antes del vencimiento  
- Detección automática de holdover al vencer sin renovación firmada  
- Dashboard para junta quincenal de Legal  
- SLAs trackeados: 45/60/90 días con escalamiento automático

### Módulo 05 — Motor de Comisiones

**Qué hace:**

- 3 esquemas de comisión diferenciados (propios / broker top 10 / broker no top 10\)  
- Distinción automática propiedad propia vs FUNO  
- Cálculo automático al cerrar contrato  
- Registro histórico por operación

**Lógica crítica:**

Al cerrar contrato:

    SI nave.Es\_Propiedad\_FUNO \= true

        → No generar comisión interna → Registrar como operación FUNO

    SI nave.Es\_Propiedad\_FUNO \= false

        → Identificar esquema (propio / broker top10 / broker no top10)

        → Calcular comisión según porcentaje del esquema

        → Registrar comisión pendiente de pago

⚠️ Los porcentajes de cada esquema no fueron revelados. Obtener de Héctor antes de configurar.

### Módulo 06 — Integración Oracle \+ Power BI

**Qué hace:**

- Conexión bidireccional Oracle para pagos y estatus de facturación  
- SF lee pagos aplicados de Oracle  
- SF notifica a Oracle cierres de contrato, renovaciones y salidas de clientes  
- Investigar fuente que alimenta Power BI para integrar inventario

### Módulo 07 — Dashboard Ejecutivo (BI)

**KPIs confirmados:**

- % M² ocupados vs totales — filtrable por parque, zona, ejecutivo  
- Pipeline activo (oportunidades en proceso)  
- Contratos por vencer (30, 60, 90, 180 días)  
- Tasa de renovación vs churn  
- Holdovers activos  
- Comisiones generadas por período y por perfil  
- Tiempo promedio de ciclo comercial  
- Comparativa mensual de m² (actual vs mes anterior vs mismo mes año anterior)  
- Falsos adeudos por cancelaciones pendientes

---

## 12\. FLOWS AUTOMÁTICOS CRÍTICOS

| Flow | Trigger | Acciones automáticas |
| :---- | :---- | :---- |
| **Notificación de contrato firmado** | Contrato marcado "Firmado" en SF | Notifica simultáneamente a: CxC (con datos de contacto del cliente), Jesús/Contratos, Tenant, Admin del Parque, Comercial |
| **Alerta de renovación** | Contrato a 12/6/3/1 mes de vencer | Notificación escalonada a Comercial, Legal y Dirección |
| **Inicio de SLA legal** | Recepción de Hoja de Acuerdos | Crea caso legal, asigna abogado, inicia contador SLA |
| **Holdover** | Contrato vencido sin renovación firmada | Alerta a Legal y CxC, notifica a Jesús para emitir factura holdover, estatus rojo en dashboard |
| **Documentación incompleta** | Checklist pendiente al avanzar etapa | Bloquea avance, notifica a Comercial con lista de faltantes |
| **Escalamiento de aprobación** | Condición especial en cotización | Envía a Director Comercial o CEO según nivel del descuento |
| **Recordatorio OC a cliente** | Cliente con portal sin OC después de X días | Recordatorio automático al ejecutivo de CxC |
| **Alerta de incremento INPC** | X días antes de fecha de incremento del contrato | Notifica a Jesús con cálculo del nuevo monto para que notifique al cliente |
| **Alerta de salida de cliente** | Acta de Restitución recibida | Notifica a Jesús para congelar facturación; alerta a CxC para proceso de depósito |
| **Reactivación de prospecto** | 6 meses desde pérdida | Tarea automática al LO para recontactar |
| **Ticket de cancelación de facturas** | Acta de Restitución tardía | Notifica a Jesús y genera formato de cancelación para aprobación de dirección |

---

## 13\. CRONOGRAMA — 24 SEMANAS

| Fase | Nombre | Semanas | Traslape |
| :---- | :---- | :---- | :---- |
| 01 | Planning & Discovery detallado | S1–S2 | — |
| 02 | Arquitectura & Pipeline | S2–S5 | Desde S2 |
| 03 | Ecosistema Comercial | S4–S10 | Desde S4 |
| 04 | Gestión Contractual | S9–S14 | Desde S9 |
| 05 | Motor de Comisiones | S12–S18 | Desde S12 |
| 06 | Integración Oracle | S16–S22 | Desde S16 |
| 07 | BI & Go-Live | S22–S24 | Desde S22 |

---

## 14\. HITOS DE PAGO Y ENTREGABLES

### Hito 1 — Firma de contrato · $256,800 MXN \+ IVA

- Kickoff oficial del proyecto  
- Presentación del equipo asignado de Bridge Studio  
- Calendario de trabajo acordado con Parks Industrial

### Hito 2 — Sem 5 · $171,200 MXN \+ IVA

- Documento de arquitectura técnica validado  
- Mapa de procesos completo (Comercial \+ Legal \+ CxC \+ Contratos)  
- Pipeline configurado con 9 etapas reales de Parks Industrial  
- Objetos custom creados: Parque, Nave, Inquilino, Broker, Hoja de Acuerdos  
- Perfiles de usuario y permisos configurados por rol  
- Ambiente de pruebas activo

### Hito 3 — Sem 14 · $171,200 MXN \+ IVA

- Módulo de brokers con 3 esquemas de comisión configurados  
- Flujo de gestión contractual con 4 tipos de documento  
- Alertas de renovación activas con semáforo automático  
- SLAs de 45, 60 y 90 días trackeados  
- Migración de Monday completada  
- Migración de Excels individuales de LOs completada

### Hito 4 — Sem 22 · $171,200 MXN \+ IVA

- Motor de comisiones con distinción propiedad propia vs FUNO  
- Integración Oracle activa y probada  
- Flow de notificación automática a todas las áreas al cerrar contrato  
- Módulo de notas de crédito con flujo de aprobación  
- Gestión de clientes con portal (OC \+ factura)  
- Alerta automática de incrementos INPC

### Hito 5 — Sem 24 · $85,600 MXN \+ IVA

- Dashboard ejecutivo con métricas homologadas al grupo  
- Capacitación completada a todas las áreas  
- Documentación técnica y manual de usuario entregados  
- Sistema en producción con acompañamiento post go-live activo

**TOTAL: $856,000 MXN \+ IVA**

---

## 15\. LICENCIAS SALESFORCE (COSTO DIRECTO AL CLIENTE)

| Producto | Costo unitario/mes |
| :---- | :---- |
| Sales Cloud Enterprise | $175 USD / usuario |
| CRM Analytics (BI) | $140 USD / usuario (solo dirección) |
| Account Engagement | $1,250 USD / organización |
| S-Docs | Cotizar directamente con S-Docs |
| Salesforce Platform | $25 USD / usuario (usuarios ligeros) |
| Almacenamiento adicional | $5 USD / GB |

---

## 16\. CASOS DE USO PARA LA DEMO

### Caso Comercial 1 — Lead directo nuevo cliente

- **Empresa:** LogiMex S.A. de C.V. (logística)  
- **Requerimiento:** 5,000 m², 2 andenes, Guadalajara  
- **Canal:** Página web  
- **Estatus:** Calificado — tour agendado

### Caso Comercial 2 — Lead vía broker, build-to-suit

- **Broker:** Broker top 10  
- **Cliente:** Empresa manufacturera (nearshoring)  
- **Requerimiento:** 12,000 m² build-to-suit, Monterrey  
- **Estatus:** En negociación — condición especial, aprobación CEO pendiente

### Caso Comercial 3 — Prospecto perdido reactivado

- **Empresa:** Buscó espacio en 2024, no había disponibilidad  
- **Situación:** Se liberó la nave que buscaba  
- **Estatus:** SF dispara alerta automática al LO

### Caso Legal 1 — Contrato nuevo en proceso

- **Tipo:** Arrendamiento nuevo  
- **SLA:** 32 días transcurridos de 60  
- **Semáforo:** 🟠 Naranja — primera versión enviada al cliente

### Caso Legal 2 — Renovación en riesgo

- **Tipo:** Convenio de renovación  
- **Situación:** Contrato vence en 6 semanas, sin Hoja de Acuerdos de Comercial  
- **Semáforo:** 🟡 Amarillo — alerta a Director

### Caso Legal 3 — Holdover activo

- **Tipo:** Contrato vencido hace 8 semanas sin renovar  
- **Estatus:** Factura de doble renta emitida — 🔴 Rojo crítico

### Caso CxC 1 — Cliente con portal moroso en OC

- **Cliente:** Empresa que requiere OC antes de factura  
- **Situación:** OC sin llegar en 12 días — recordatorios automáticos activos  
- **Estatus:** Alerta escalada al ejecutivo de CxC

### Caso CxC 2 — Cancelación tardía por Acta de Restitución

- **Cliente:** Empresa que salió hace 6 semanas  
- **Situación:** Acta llegó esta semana — hay 6 facturas emitidas que hay que cancelar  
- **Estatus:** Formato de cancelación generado en SF — pendiente aprobación de dirección

### Caso CxC 3 — Descuento por renovación anticipada

- **Cliente:** Renovó 2 años antes del vencimiento  
- **Condición:** Nota de crédito por 3 meses acordada con Comercial  
- **Estatus:** Formato en SF con aprobación de dirección pendiente

---

## 17\. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
| :---- | :---- | :---- | :---- |
| Inventario en Power BI — fuente no confirmada | Alta | Alto | Session urgente con Jesús Gazón — define arquitectura de integración de inventario |
| Reglas de comisión no documentadas | Alta | Alto | Obtener porcentajes de Héctor antes de Fase 5 |
| Equipo técnico Oracle no disponible en Fase 6 | Media | Alto | Confirmar disponibilidad desde el kickoff |
| Resistencia al cambio del proceso físico de Legal | Alta | Medio | Change management desde inicio — SF complementa, no elimina el proceso físico |
| Catalina como single point of failure | Alta | Alto | Distribuir roles de carga en Salesforce sin romper controles de acceso |
| Datos sucios en Monday y Excels individuales | Media | Medio | Auditoría de datos en Fase 3 antes de migrar |
| Contratos vencidos activos al go-live | Alta | Medio | Carga con estatus especial \+ plan de acción para primeros 30 días |
| Cancelaciones masivas de facturas por actas tardías | Alta | Medio | Flow de alerta inmediata cuando Acta de Restitución llega — no esperar |
| Proceso de notas de crédito lento por aprobaciones | Media | Bajo | Flujo digital de aprobación en SF reduce tiempos de autorización |
| KPIs no definidos en CxC | Alta | Medio | Proponer parámetros a Parks Industrial antes del go-live |

---

## 18\. PREGUNTAS PENDIENTES CRÍTICAS

1. **¿Qué alimenta el Power BI de Jesús Gazón?** — ¿Oracle, Excel u otro? Define arquitectura de integración de inventario.  
2. **¿Cuáles son los porcentajes exactos de comisión por cada uno de los 3 esquemas?** — Bloqueante para Fase 5\.  
3. **Sesión de discovery con Jesús Gazón** — Contratos, Facturación y Power BI. Pendiente de agendar.  
4. **¿Cuál es la fuente de datos que confirma disponibilidad de naves?** — ¿Quién actualiza el Power BI y con qué frecuencia?  
5. **SLAs y KPIs de CxC** — ¿Cuántos días para emitir factura? ¿Cuántos para aplicar pago? ¿Umbral de escalamiento?  
6. **¿Cuántos clientes de los 600 contratos usan portal?** — Dimensiona el flujo de automatización de OC.  
7. **¿La moneda de Parks Industrial es MXN o USD?** — ALLUX usa MXN, pero industrial típicamente cotiza en USD.  
8. **¿Tienen acceso al equipo que implementó ALLUX** para compartir arquitectura técnica?  
9. **¿Quién es el área de Gestión y Control?** — Genera reportes diarios para CxC. Nunca fue mencionada en sesiones anteriores.  
10. **¿Qué significan exactamente CEM y el "call center"** como canales de prospecto?

---

## 19\. GARANTÍAS Y PÓLIZAS

| Garantía | Detalle |
| :---- | :---- |
| **Póliza de responsabilidad civil digital** | Hasta $1M USD. Cubre brechas de seguridad atribuibles a desarrollos de Bridge. Contratos desde mayo 2026\. |
| **Fianza de anticipo** | Disponible a solicitud. Garantiza que el anticipo se destina al proyecto. Costo adicional menor. |
| **Soporte post go-live** | Esquema de horas de soporte (a definir con Parks Industrial). No en días calendario. |

---

## 20\. PRÓXIMOS PASOS

1. Agendar sesión de discovery con Jesús Gazón (Contratos y Facturación)  
2. Confirmar fuente que alimenta el Power BI de inventario  
3. Obtener porcentajes de comisión de los 3 esquemas con Héctor  
4. Proponer SLAs y KPIs para CxC antes del go-live  
5. Confirmar si Parks Industrial maneja precios en MXN o USD  
6. Explorar acceso a arquitectura técnica de ALLUX  
7. Presentación ejecutiva presencial con CEO  
8. Validación interna de la propuesta por Parks Industrial  
9. Firma de contrato y primer pago — Kickoff Semana 1

---

*Documento preparado por Bridge Studio — Julio 2026* *Versión 2.0 — Actualizado con discoveries de Comercial, Legal y Cuentas por Cobrar* *Base para configuración de demo Salesforce con IA* *Confidencial — Uso interno*  
