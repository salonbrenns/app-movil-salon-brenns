import { business } from '../data/business';

export type EmailDraft = Readonly<{ subject: string; body: string }>;

export function emailDraftUri(subject: string, body: string): string {
  return `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function emailDraftText({ subject, body }: EmailDraft): string {
  return `Para: ${business.email}\nAsunto: ${subject}\n\n${body}`;
}
