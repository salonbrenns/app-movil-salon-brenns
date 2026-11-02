import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { useRef, useState } from 'react';
import { business } from '../data/business';
import { emailDraftText, emailDraftUri, type EmailDraft } from '../services/email-draft';

export function useEmailDraft() {
  const [error, setError] = useState(false);
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prepared, setPrepared] = useState<EmailDraft | null>(null);
  const [copyError, setCopyError] = useState(false);
  const [copied, setCopied] = useState<'email' | 'request' | null>(null);
  const opening = useRef(false);

  async function copy(value: string, kind: 'email' | 'request') {
    setCopyError(false);
    setCopied(null);
    try {
      const saved = await Clipboard.setStringAsync(value, { android: { isSensitive: true } });
      if (!saved) throw new Error('No se pudo copiar.');
      setCopied(kind);
    } catch {
      setCopyError(true);
    }
  }

  return {
    error, opened, busy, copyError, copied,
    resetFeedback: () => {
      setError(false);
      setOpened(false);
      setCopyError(false);
      setCopied(null);
    },
    open: async (subject: string, body: string) => {
      if (opening.current) return;
      opening.current = true;
      setBusy(true);
      setPrepared({ subject, body });
      setError(false);
      setOpened(false);
      setCopyError(false);
      setCopied(null);
      try {
        await Linking.openURL(emailDraftUri(subject, body));
        setOpened(true);
      } catch {
        setError(true);
      } finally {
        opening.current = false;
        setBusy(false);
      }
    },
    copyEmail: () => copy(business.email, 'email'),
    copyRequest: async () => {
      if (prepared) await copy(emailDraftText(prepared), 'request');
    },
  };
}
