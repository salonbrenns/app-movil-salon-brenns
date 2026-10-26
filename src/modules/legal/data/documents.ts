import type { LegalDocument } from '../models/legal-document';
import { privacyDocument } from './privacy';
import { termsDocument } from './terms';
import { policiesDocument } from './policies';
import { pickupDocument } from './pickup';
import { arcoDocument } from './arco';
import { deletionDocument } from './deletion';

export const legalDocuments = {
  privacidad: privacyDocument,
  terminos: termsDocument,
  politicas: policiesDocument,
  compras: pickupDocument,
  arco: arcoDocument,
  eliminacion: deletionDocument,
} as const satisfies Record<string, LegalDocument>;

export type LegalDocumentKey = keyof typeof legalDocuments;

export function getLegalDocument(key: LegalDocumentKey): LegalDocument {
  switch (key) {
    case 'privacidad': return privacyDocument;
    case 'terminos': return termsDocument;
    case 'politicas': return policiesDocument;
    case 'compras': return pickupDocument;
    case 'arco': return arcoDocument;
    case 'eliminacion': return deletionDocument;
    default: {
      const exhaustive: never = key;
      return exhaustive;
    }
  }
}
