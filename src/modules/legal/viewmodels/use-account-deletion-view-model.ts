import { useState } from 'react';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useEmailDraft } from './use-email-draft';

export function useAccountDeletionViewModel() {
  const { session } = useAuthSession();
  const [nameInput, setName] = useState<string | null>(null);
  const [emailInput, setEmail] = useState<string | null>(null);
  const name = nameInput ?? session?.user.name ?? '';
  const email = emailInput ?? session?.user.email ?? '';
  const [confirming, setConfirming] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  const draft = useEmailDraft();

  async function prepare() {
    if (!confirming || draft.busy) return;
    draft.resetFeedback();
    if (!name.trim() || !email.trim()) {
      setValidation('Escribe el nombre del titular y el correo de la cuenta.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidation('Escribe un correo electrónico válido de la cuenta.');
      return;
    }
    setValidation(null);
    const body = [
      "Solicito la eliminación de mi cuenta de Salón Brenn's y la revisión de los datos personales asociados.",
      '',
      `Correo de la cuenta: ${email.trim()}`,
      `Nombre del titular: ${name.trim().replace(/[ \t]+/g, ' ')}`,
      '',
      'Solicito indicaciones para verificar mi identidad por un medio seguro.',
      'Entiendo que algunos datos podrían conservarse cuando exista una obligación legal aplicable.',
    ].join('\n');
    await draft.open("Solicitud de eliminación de cuenta - Salón Brenn's", body);
  }

  return {
    name, setName, email, setEmail, confirming,
    start: () => { draft.resetFeedback(); setConfirming(true); },
    cancel: () => { draft.resetFeedback(); setConfirming(false); setValidation(null); },
    validation, prepare,
    mailError: draft.error, mailOpened: draft.opened, mailBusy: draft.busy,
    copyEmail: draft.copyEmail, copyRequest: draft.copyRequest, copyError: draft.copyError, copied: draft.copied,
  };
}
