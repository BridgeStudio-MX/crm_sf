import { ApprovalPage } from '@/components/approval/ApprovalPage';
import { Card } from '@/components/ui/primitives';
import { getTwentyConfig } from '@/lib/twenty-api';

type PageProps = {
  params: { contratoId: string };
};

const ContratoAprobacionRoute = async ({ params }: PageProps) => {
  if (!getTwentyConfig().hasApiKey) {
    return (
      <Card>
        <h1 className="text-xl font-semibold">Configuración requerida</h1>
      </Card>
    );
  }

  return <ApprovalPage casoLegalId={params.contratoId} />;
};

export default ContratoAprobacionRoute;
