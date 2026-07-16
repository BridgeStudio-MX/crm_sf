import { AppRouterProviders } from '@/app/components/AppRouterProviders';
import { LazyRoute } from '@/app/components/LazyRoute';
import { SettingsRoutes } from '@/app/components/SettingsRoutes';
import { VerifyLoginTokenEffect } from '@/auth/components/VerifyLoginTokenEffect';

import { VerifyEmailEffect } from '@/auth/components/VerifyEmailEffect';
import indexAppPath from '@/navigation/utils/indexAppPath';
import { RecordIndexSkeletonLoader } from '@/object-record/record-index/components/RecordIndexSkeletonLoader';
import { BlankLayout } from '@/ui/layout/page/components/BlankLayout';
import { DefaultLayout } from '@/ui/layout/page/components/DefaultLayout';
import { MainAppLayoutWithSidePanel } from '@/ui/layout/page/components/MainAppLayoutWithSidePanel';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  PARKS_COMITE_DETAIL_PATH,
  PARKS_COMITE_PATH,
  PARKS_CXC_PATH,
  PARKS_DASHBOARD_COMERCIAL_PATH,
  PARKS_INQUILINO_360_PATH,
  PARKS_LEADS_CEM_PATH,
  PARKS_LEGAL_DASHBOARD_PATH,
  PARKS_LEGAL_PIPELINE_PATH,
  PARKS_LO_CAMPO_PATH,
  PARKS_MIS_PENDIENTES_PATH,
  PARKS_VALOR_AGREGADO_PATH,
  PARKS_ASIGNACION_PATH,
} from '@/parks-industrial/constants/parks-routes.constants';
import { ParksProtectedRoute } from '@/parks-industrial/components/navigation/ParksProtectedRoute';

import { lazy, type ReactNode } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';

const RecordIndexPage = lazy(() =>
  import('~/pages/object-record/RecordIndexPage').then((module) => ({
    default: module.RecordIndexPage,
  })),
);

const RecordShowPage = lazy(() =>
  import('~/pages/object-record/RecordShowPage').then((module) => ({
    default: module.RecordShowPage,
  })),
);

const SignInUp = lazy(() =>
  import('~/pages/auth/SignInUp').then((module) => ({
    default: module.SignInUp,
  })),
);

const PasswordReset = lazy(() =>
  import('~/pages/auth/PasswordReset').then((module) => ({
    default: module.PasswordReset,
  })),
);

const Authorize = lazy(() =>
  import('~/pages/auth/Authorize').then((module) => ({
    default: module.Authorize,
  })),
);

const WorkspaceActivation = lazy(() =>
  import('~/pages/onboarding/WorkspaceActivation').then((module) => ({
    default: module.WorkspaceActivation,
  })),
);

const CreateProfile = lazy(() =>
  import('~/pages/onboarding/CreateProfile').then((module) => ({
    default: module.CreateProfile,
  })),
);

const SyncEmails = lazy(() =>
  import('~/pages/onboarding/SyncEmails').then((module) => ({
    default: module.SyncEmails,
  })),
);

const InviteTeam = lazy(() =>
  import('~/pages/onboarding/InviteTeam').then((module) => ({
    default: module.InviteTeam,
  })),
);

const ChooseYourPlan = lazy(() =>
  import('~/pages/onboarding/ChooseYourPlan').then((module) => ({
    default: module.ChooseYourPlan,
  })),
);

const PaymentSuccess = lazy(() =>
  import('~/pages/onboarding/PaymentSuccess').then((module) => ({
    default: module.PaymentSuccess,
  })),
);

const BookCallDecision = lazy(() =>
  import('~/pages/onboarding/BookCallDecision').then((module) => ({
    default: module.BookCallDecision,
  })),
);

const BookCall = lazy(() =>
  import('~/pages/onboarding/BookCall').then((module) => ({
    default: module.BookCall,
  })),
);

const StandalonePageLayoutPage = lazy(() =>
  import('~/pages/page-layout/StandalonePageLayoutPage').then((module) => ({
    default: module.StandalonePageLayoutPage,
  })),
);

const NotFound = lazy(() =>
  import('~/pages/not-found/NotFound').then((module) => ({
    default: module.NotFound,
  })),
);

const ParksLazyRoute = ({ children }: { children: ReactNode }) => (
  <ParksProtectedRoute>
    <LazyRoute>{children}</LazyRoute>
  </ParksProtectedRoute>
);

const ParksDashboardPage = lazy(() =>
  import('~/pages/parks-industrial/ParksDashboardPage').then((module) => ({
    default: module.ParksDashboardPage,
  })),
);

const ParksStackingPlanIndexPage = lazy(() =>
  import('~/pages/parks-industrial/ParksStackingPlanIndexPage').then(
    (module) => ({
      default: module.ParksStackingPlanIndexPage,
    }),
  ),
);

const ParksStackingPlanPage = lazy(() =>
  import('~/pages/parks-industrial/ParksStackingPlanPage').then((module) => ({
    default: module.ParksStackingPlanPage,
  })),
);

const ParksPipelinePage = lazy(() =>
  import('~/pages/parks-industrial/ParksPipelinePage').then((module) => ({
    default: module.ParksPipelinePage,
  })),
);

const ParksLeadsCemPage = lazy(() =>
  import('~/pages/parks-industrial/ParksLeadsCemPage').then((module) => ({
    default: module.ParksLeadsCemPage,
  })),
);

const ParksProspectSearchPage = lazy(() =>
  import('~/pages/parks-industrial/ParksProspectSearchPage').then((module) => ({
    default: module.ParksProspectSearchPage,
  })),
);

const ParksContratosPage = lazy(() =>
  import('~/pages/parks-industrial/ParksContratosPage').then((module) => ({
    default: module.ParksContratosPage,
  })),
);

const ParksContratoAprobacionPage = lazy(() =>
  import('~/pages/parks-industrial/ParksContratoAprobacionPage').then(
    (module) => ({
      default: module.ParksContratoAprobacionPage,
    }),
  ),
);

const ParksLegalPipelinePage = lazy(() =>
  import('~/pages/parks-industrial/ParksLegalPipelinePage').then((module) => ({
    default: module.ParksLegalPipelinePage,
  })),
);

const ParksLegalDashboardPage = lazy(() =>
  import('~/pages/parks-industrial/ParksLegalDashboardPage').then((module) => ({
    default: module.ParksLegalDashboardPage,
  })),
);

const ParksCxcDashboardPage = lazy(() =>
  import('~/pages/parks-industrial/ParksCxcDashboardPage').then((module) => ({
    default: module.ParksCxcDashboardPage,
  })),
);

const ParksComitePage = lazy(() =>
  import('~/pages/parks-industrial/ParksComitePage').then((module) => ({
    default: module.ParksComitePage,
  })),
);

const ParksValorAgregadoPage = lazy(() =>
  import('~/pages/parks-industrial/ParksValorAgregadoPage').then((module) => ({
    default: module.ParksValorAgregadoPage,
  })),
);

const ParksAsignacionPage = lazy(() =>
  import('~/pages/parks-industrial/ParksAsignacionPage').then((module) => ({
    default: module.ParksAsignacionPage,
  })),
);

const ParksLoCampoPage = lazy(() =>
  import('~/pages/parks-industrial/ParksLoCampoPage').then((module) => ({
    default: module.ParksLoCampoPage,
  })),
);

const ParksMisPendientesPage = lazy(() =>
  import('~/pages/parks-industrial/ParksMisPendientesPage').then((module) => ({
    default: module.ParksMisPendientesPage,
  })),
);

const ParksDashboardComercialPage = lazy(() =>
  import('~/pages/parks-industrial/ParksDashboardComercialPage').then(
    (module) => ({
      default: module.ParksDashboardComercialPage,
    }),
  ),
);

const ParksComisionesPage = lazy(() =>
  import('~/pages/parks-industrial/ParksComisionesPage').then((module) => ({
    default: module.ParksComisionesPage,
  })),
);

const ParksBrokersPage = lazy(() =>
  import('~/pages/parks-industrial/ParksBrokersPage').then((module) => ({
    default: module.ParksBrokersPage,
  })),
);

const ParksMapPage = lazy(() =>
  import('~/pages/parks-industrial/ParksMapPage').then((module) => ({
    default: module.ParksMapPage,
  })),
);

const SettingsProfilePage = lazy(() =>
  import('~/pages/settings/profile/SettingsProfile').then((module) => ({
    default: module.SettingsProfile,
  })),
);

const ParksMiDesempenoPage = lazy(() =>
  import('~/pages/parks-industrial/ParksMiDesempenoPage').then((module) => ({
    default: module.ParksMiDesempenoPage,
  })),
);

const ParksNotificacionesPage = lazy(() =>
  import('~/pages/parks-industrial/ParksNotificacionesPage').then((module) => ({
    default: module.ParksNotificacionesPage,
  })),
);

const ParksInquilino360Page = lazy(() =>
  import('~/pages/parks-industrial/ParksInquilino360Page').then((module) => ({
    default: module.ParksInquilino360Page,
  })),
);

const ParksRenovacionesPage = lazy(() =>
  import('~/pages/parks-industrial/ParksRenovacionesPage').then((module) => ({
    default: module.ParksRenovacionesPage,
  })),
);

const ParksReservasPage = lazy(() =>
  import('~/pages/parks-industrial/ParksReservasPage').then((module) => ({
    default: module.ParksReservasPage,
  })),
);

export const useCreateAppRouter = (
  isFunctionSettingsEnabled?: boolean,
  isAdminPageEnabled?: boolean,
) =>
  createBrowserRouter(
    createRoutesFromElements(
      <Route
        element={<AppRouterProviders />}
        // To switch state to `loading` temporarily to enable us
        // to set scroll position before the page is rendered
        loader={async () => Promise.resolve(null)}
      >
        <Route element={<DefaultLayout />}>
          <Route path={AppPath.Verify} element={<VerifyLoginTokenEffect />} />
          <Route path={AppPath.VerifyEmail} element={<VerifyEmailEffect />} />
          <Route
            path={AppPath.SignInUp}
            element={
              <LazyRoute fallback={null}>
                <SignInUp />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.Invite}
            element={
              <LazyRoute fallback={null}>
                <SignInUp />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.ResetPassword}
            element={
              <LazyRoute fallback={null}>
                <PasswordReset />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.WorkspaceActivation}
            element={
              <LazyRoute fallback={null}>
                <WorkspaceActivation />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.CreateProfile}
            element={
              <LazyRoute fallback={null}>
                <CreateProfile />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.SyncEmails}
            element={
              <LazyRoute fallback={null}>
                <SyncEmails />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.InviteTeam}
            element={
              <LazyRoute fallback={null}>
                <InviteTeam />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.PlanRequired}
            element={
              <LazyRoute fallback={null}>
                <ChooseYourPlan />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.PlanRequiredSuccess}
            element={
              <LazyRoute fallback={null}>
                <PaymentSuccess />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.BookCallDecision}
            element={
              <LazyRoute fallback={null}>
                <BookCallDecision />
              </LazyRoute>
            }
          />
          <Route
            path={AppPath.BookCall}
            element={
              <LazyRoute fallback={null}>
                <BookCall />
              </LazyRoute>
            }
          />
          <Route element={<MainAppLayoutWithSidePanel />}>
            <Route path={indexAppPath.getIndexAppPath()} element={<></>} />
            <Route
              path={AppPath.RecordIndexPage}
              element={
                <LazyRoute fallback={<RecordIndexSkeletonLoader />}>
                  <RecordIndexPage />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.RecordShowPage}
              element={
                <LazyRoute>
                  <RecordShowPage />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.PageLayoutPage}
              element={
                <LazyRoute>
                  <StandalonePageLayoutPage />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.ParksDashboard}
              element={
                <ParksLazyRoute>
                  <ParksDashboardPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksStackingPlanIndex}
              element={
                <ParksLazyRoute>
                  <ParksStackingPlanIndexPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksStackingPlan}
              element={
                <ParksLazyRoute>
                  <ParksStackingPlanPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksPipeline}
              element={
                <ParksLazyRoute>
                  <ParksPipelinePage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_LEADS_CEM_PATH}
              element={
                <ParksLazyRoute>
                  <ParksLeadsCemPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksProspectos}
              element={
                <ParksLazyRoute>
                  <ParksProspectSearchPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksNotificaciones}
              element={
                <ParksLazyRoute>
                  <ParksNotificacionesPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_MIS_PENDIENTES_PATH}
              element={
                <ParksLazyRoute>
                  <ParksMisPendientesPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_DASHBOARD_COMERCIAL_PATH}
              element={
                <ParksLazyRoute>
                  <ParksDashboardComercialPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksContratos}
              element={
                <ParksLazyRoute>
                  <ParksContratosPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksContratoAprobacion}
              element={
                <ParksLazyRoute>
                  <ParksContratoAprobacionPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_LEGAL_PIPELINE_PATH}
              element={
                <ParksLazyRoute>
                  <ParksLegalPipelinePage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_LEGAL_DASHBOARD_PATH}
              element={
                <ParksLazyRoute>
                  <ParksLegalDashboardPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_CXC_PATH}
              element={
                <ParksLazyRoute>
                  <ParksCxcDashboardPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_COMITE_PATH}
              element={
                <ParksLazyRoute>
                  <ParksComitePage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_COMITE_DETAIL_PATH}
              element={
                <ParksLazyRoute>
                  <ParksComitePage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_VALOR_AGREGADO_PATH}
              element={
                <ParksLazyRoute>
                  <ParksValorAgregadoPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_ASIGNACION_PATH}
              element={
                <ParksLazyRoute>
                  <ParksAsignacionPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_LO_CAMPO_PATH}
              element={
                <ParksLazyRoute>
                  <ParksLoCampoPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksComisiones}
              element={
                <ParksLazyRoute>
                  <ParksComisionesPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksBrokers}
              element={
                <ParksLazyRoute>
                  <ParksBrokersPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksMiDesempeno}
              element={
                <ParksLazyRoute>
                  <ParksMiDesempenoPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={PARKS_INQUILINO_360_PATH}
              element={
                <ParksLazyRoute>
                  <ParksInquilino360Page />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksRenovaciones}
              element={
                <ParksLazyRoute>
                  <ParksRenovacionesPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksReservas}
              element={
                <ParksLazyRoute>
                  <ParksReservasPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path={AppPath.ParksMapa}
              element={
                <ParksLazyRoute>
                  <ParksMapPage />
                </ParksLazyRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <Navigate
                  to={getSettingsPath(SettingsPath.ProfilePage)}
                  replace
                />
              }
            />
            <Route
              path="/settings/profile"
              element={
                <LazyRoute>
                  <SettingsProfilePage />
                </LazyRoute>
              }
            />
            <Route
              path={AppPath.SettingsCatchAll}
              element={
                <SettingsRoutes
                  isFunctionSettingsEnabled={isFunctionSettingsEnabled}
                  isAdminPageEnabled={isAdminPageEnabled}
                />
              }
            />
            <Route
              path={AppPath.NotFoundWildcard}
              element={
                <LazyRoute>
                  <NotFound />
                </LazyRoute>
              }
            />
          </Route>
        </Route>
        <Route element={<BlankLayout />}>
          <Route
            path={AppPath.Authorize}
            element={
              <LazyRoute>
                <Authorize />
              </LazyRoute>
            }
          />
        </Route>
      </Route>,
    ),
  );
