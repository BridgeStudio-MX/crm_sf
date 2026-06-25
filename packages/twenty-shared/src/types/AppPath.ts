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
  ParksContratos = '/parks/contratos',
  ParksContratoAprobacion = '/parks/contratos/:contratoId/aprobacion',
  ParksComisiones = '/parks/comisiones',
  ParksRenovaciones = '/parks/renovaciones',
  ParksReservas = '/parks/reservas',
  ParksMapa = '/parks/mapa',
  ParksNotificaciones = '/parks/notificaciones',
  ParksMiDesempeno = '/parks/mi-desempeno',

  Settings = `settings`,
  SettingsCatchAll = `/${Settings}/*`,
  Developers = `developers`,
  DevelopersCatchAll = `/${Developers}/*`,

  Authorize = '/authorize',

  // 404 page not found
  NotFoundWildcard = '*',
  NotFound = '/not-found',
}
