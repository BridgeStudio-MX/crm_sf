import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { Card } from '@/components/ui/primitives';
import { getTwentyConfig } from '@/lib/twenty-api';

const DashboardRoute = async () => {
  if (!getTwentyConfig().hasApiKey) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Configuración requerida</h1>
        <p className="mt-2 text-sm text-slate-600">
          Crea <code>.env.local</code> con <code>TWENTY_API_URL</code> y{' '}
          <code>TWENTY_API_KEY</code> (ver <code>.env.example</code>).
        </p>
      </Card>
    );
  }

  return <DashboardPage />;
};

export default DashboardRoute;
