import { empresaBrokerService } from '../services/empresa-broker.service';
import { twentyDataService } from '../services/twenty-data.service';

// One-time migration: the broker object used to represent a firm + its
// contact person as a single flat row. Each existing broker becomes its own
// empresaBroker (using the same firm-level fields) and stays linked back by
// empresaBrokerId — broker.id never changes, so every comision /
// hojaDeAcuerdos / opportunity relation that already points at a broker
// keeps working untouched.
export const migrateBrokersToEmpresasService = {
  run: async (): Promise<void> => {
    console.log('[migrate:brokers-to-empresas] Starting…');

    const brokers = await twentyDataService.findAllBrokers();
    const pendingBrokers = brokers.filter((broker) => !broker.empresaBrokerId);

    if (pendingBrokers.length === 0) {
      console.log(
        '[migrate:brokers-to-empresas] Nothing to migrate — all brokers already linked.',
      );
      return;
    }

    for (const broker of pendingBrokers) {
      const nombre = broker.empresa?.trim() || broker.contacto?.trim();

      if (!nombre) {
        console.warn(
          `[migrate:brokers-to-empresas] Skipping broker ${broker.id}: no empresa/contacto to derive a company name`,
        );
        continue;
      }

      console.log(
        `[migrate:brokers-to-empresas] Creating empresaBroker "${nombre}" for broker ${broker.id} (${broker.contacto ?? 'sin contacto'})`,
      );

      const empresaBroker = await empresaBrokerService.create({
        nombre,
        contactoPrincipal: broker.contacto,
        email: broker.email,
        telefono: broker.telefono,
        clasificacion: broker.clasificacion,
        zonasOperacion: broker.zonasOperacion,
        activo: broker.activo ?? true,
      });

      await twentyDataService.updateBroker(broker.id, {
        empresaBrokerId: empresaBroker.id,
      });

      console.log(
        `[migrate:brokers-to-empresas]   → linked broker ${broker.id} to empresaBroker ${empresaBroker.id}`,
      );
    }

    console.log('[migrate:brokers-to-empresas] Done.');
  },
};
