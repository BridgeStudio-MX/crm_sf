import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { envConfig } from '../config/env.config';
import {
  type FichaTecnicaLink,
  type FichaTecnicaSentVia,
} from '../types/ficha-tecnica.types';

const DATA_DIR = join(__dirname, '../../data');
const FICHAS_PATH = join(DATA_DIR, 'ficha-links.json');

const fichaLinks = new Map<string, FichaTecnicaLink>();

const generateToken = (): string => randomBytes(12).toString('hex');

// Public URL must go through Caddy /parks-api in production
const resolvePublicBaseUrl = (): string => {
  if (process.env.PARKS_PUBLIC_BASE_URL) {
    return process.env.PARKS_PUBLIC_BASE_URL.replace(/\/$/, '');
  }

  const workspaceOrigin = (
    process.env.TWENTY_WORKSPACE_ORIGIN ??
    process.env.SERVER_URL ??
    ''
  ).replace(/\/$/, '');

  if (workspaceOrigin.startsWith('http')) {
    return `${workspaceOrigin}/parks-api`;
  }

  return `http://localhost:${envConfig.port}`;
};

const loadFromDisk = (): void => {
  if (!existsSync(FICHAS_PATH)) {
    return;
  }

  try {
    const parsed = JSON.parse(readFileSync(FICHAS_PATH, 'utf8')) as
      | FichaTecnicaLink[]
      | Record<string, FichaTecnicaLink>;

    const links = Array.isArray(parsed)
      ? parsed
      : Object.values(parsed);

    for (const link of links) {
      if (link?.token) {
        fichaLinks.set(link.token, link);
      }
    }
  } catch {
    // Corrupt file — start empty; next write will overwrite
  }
};

const persistToDisk = (): void => {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  writeFileSync(
    FICHAS_PATH,
    JSON.stringify(Array.from(fichaLinks.values()), null, 2),
    'utf8',
  );
};

loadFromDisk();

export const fichaLinkStore = {
  create: (
    input: Omit<
      FichaTecnicaLink,
      'token' | 'publicUrl' | 'viewCount' | 'sentVia' | 'createdAt'
    >,
  ): FichaTecnicaLink => {
    const token = generateToken();
    const publicBaseUrl = resolvePublicBaseUrl();
    const link: FichaTecnicaLink = {
      ...input,
      token,
      publicUrl: `${publicBaseUrl}/commercial/ficha/${token}`,
      viewCount: 0,
      sentVia: null,
      createdAt: new Date().toISOString(),
    };

    fichaLinks.set(token, link);
    persistToDisk();

    return link;
  },

  upsert: (link: FichaTecnicaLink): FichaTecnicaLink => {
    fichaLinks.set(link.token, link);
    persistToDisk();

    return link;
  },

  get: (token: string): FichaTecnicaLink | null =>
    fichaLinks.get(token) ?? null,

  listByOpportunity: (opportunityId: string): FichaTecnicaLink[] =>
    Array.from(fichaLinks.values())
      .filter((link) => link.opportunityId === opportunityId)
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),

  recordView: (token: string): FichaTecnicaLink | null => {
    const link = fichaLinks.get(token);

    if (!link) {
      return null;
    }

    link.viewCount += 1;
    link.lastViewedAt = new Date().toISOString();
    persistToDisk();

    return link;
  },

  markSent: (
    token: string,
    sentVia: FichaTecnicaSentVia,
  ): FichaTecnicaLink | null => {
    const link = fichaLinks.get(token);

    if (!link) {
      return null;
    }

    link.sentVia = sentVia;
    link.sentAt = new Date().toISOString();
    persistToDisk();

    return link;
  },
};
