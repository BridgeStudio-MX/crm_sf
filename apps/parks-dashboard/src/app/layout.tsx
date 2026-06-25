import './globals.css';

import { AppNav } from '@/components/layout/AppNav';
import { parksDataService } from '@/lib/parks-data.service';
import { getTwentyConfig } from '@/lib/twenty-api';

export const metadata = {
  title: 'Sistema de Gestión Parks Industrial',
  description: 'Dashboard operativo Parks Industrial',
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  let defaultParqueId: string | undefined;

  if (getTwentyConfig().hasApiKey) {
    try {
      const parques = await parksDataService.getParques();
      defaultParqueId = parques[0]?.id;
    } catch {
      defaultParqueId = undefined;
    }
  }

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AppNav defaultParqueId={defaultParqueId} />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
