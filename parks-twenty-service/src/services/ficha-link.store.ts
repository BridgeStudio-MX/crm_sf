import { randomBytes } from 'node:crypto';

import { envConfig } from '../config/env.config';
import {
  type FichaTecnicaLink,
  type FichaTecnicaSentVia,
} from '../types/commercial.types';

const fichaLinks = new Map<string, FichaTecnicaLink>();

const generateToken = (): string => randomBytes(12).toString('hex');

const resolvePublicBaseUrl = (): string =>
  process.env.PARKS_PUBLIC_BASE_URL ??
  `http://localhost:${envConfig.port}`;

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

    return link;
  },
};
