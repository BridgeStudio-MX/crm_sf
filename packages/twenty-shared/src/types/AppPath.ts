export enum AppPath {
  // Not logged-in
  Verify = '/verify',
  VerifyEmail = '/verify-email',
  SignInUp = '/welcome',
  Invite = '/invite/:workspaceInviteHash',
  ResetPassword = '/reset-password/:passwordResetToken',

  // Onboarding
  WorkspaceActivation = '/workspace-activation',
  CreateProfile = '/create/profile',
  SyncEmails = '/sync/emails',
  InviteTeam = '/invite-team',
  PlanRequired = '/plan-required',
  PlanRequiredSuccess = '/plan-required/payment-success',
  BookCallDecision = '/book-call-decision',
  BookCall = '/book-call',

  // Onboarded
  Index = '/',
  TasksPage = '/objects/tasks',
  OpportunitiesPage = '/objects/opportunities',

  RecordIndexPage = '/objects/:objectNamePlural',
  RecordShowPage = '/object/:objectNameSingular/:objectRecordId',
  PageLayoutPage = '/page/:pageLayoutId',

  ParksDashboard = '/parks/dashboard',
  ParksStackingPlanIndex = '/parks/stacking-plan',
  ParksStackingPlan = '/parks/parque/:parqueId/stacking-plan',
  ParksPipeline = '/parks/pipeline',
  ParksLeadsCem = '/parks/leads-cem',
  ParksContratos = '/parks/contratos',
  ParksContratoAprobacion = '/parks/contratos/:contratoId/aprobacion',
  ParksComisiones = '/parks/comisiones',
  ParksBrokers = '/parks/brokers',
  ParksRenovaciones = '/parks/renovaciones',
  ParksReservas = '/parks/reservas',
  ParksMapa = '/parks/mapa',
  ParksNotificaciones = '/parks/notificaciones',
  ParksMisPendientes = '/parks/mis-pendientes',
  ParksDashboardComercial = '/parks/dashboard-comercial',
  ParksMiDesempeno = '/parks/mi-desempeno',
  ParksInquilino360 = '/parks/inquilinos/:inquilinoId',
  ParksProspectos = '/parks/prospectos',
  ParksLegalPipeline = '/parks/legal-pipeline',
  ParksLegalDashboard = '/parks/legal-dashboard',
  ParksCxc = '/parks/cxc',
  ParksCxcCartera = '/parks/cxc/cartera',
  ParksComite = '/parks/comite',
  ParksComiteDetail = '/parks/comite/:comiteId',
  ParksValorAgregado = '/parks/valor-agregado',
  ParksAsignacion = '/parks/asignacion',
  ParksLoCampo = '/parks/campo',

  Settings = `settings`,
  SettingsCatchAll = `/${Settings}/*`,
  Developers = `developers`,
  DevelopersCatchAll = `/${Developers}/*`,

  Authorize = '/authorize',

  // 404 page not found
  NotFoundWildcard = '*',
  NotFound = '/not-found',
}
