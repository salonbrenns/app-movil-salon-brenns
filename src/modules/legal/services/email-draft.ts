import { business } from '../data/business';

export function emailDraftUri(subject: string, body: string): string {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
