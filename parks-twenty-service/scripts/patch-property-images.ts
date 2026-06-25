import dotenv from 'dotenv';

import { patchPropertyImages } from '../src/seed/patch-property-images.service';

dotenv.config();

const main = async (): Promise<void> => {
  try {
    await patchPropertyImages();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[patch:images] Failed:', message);
    process.exit(1);
  }
};

main();
