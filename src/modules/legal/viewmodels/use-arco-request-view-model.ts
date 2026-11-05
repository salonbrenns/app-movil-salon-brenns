import { useState } from 'react';
import { useEmailDraft } from './use-email-draft';

export const ARCO_RIGHTS = ['Acceso', 'Rectificación', 'Cancelación', 'Oposición'] as const;
export type ArcoRight = (typeof ARCO_RIGHTS)[number];

export function useArcoRequestViewModel() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [right, setRight] = useState<ArcoRight | null>(null);
  const [description, setDescription] = useState('');
  const [dataDetails, setDataDetails] = useState('');
  const [requestedChange, setRequestedChange] = useState('');
  const [validation, setValidation] = useState<string | null>(null);
  const draft = useEmailDraft();

  async function prepare() {
    if (draft.busy) return;
    draft.resetFeedback();
    if (!name.trim() || !email.trim() || !right || !description.trim()) {
      setValidation('Completa nombre, correo, derecho ARCO y descripción de la solicitud.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidation('Escribe un correo electrónico válido para recibir la respuesta.');
      return;
    }
    if (right !== 'Acceso' && !dataDetails.trim()) {
      setValidation('Describe los datos personales involucrados en tu solicitud.');
      return;
    }
    if (right === 'Rectificación' && !requestedChange.trim()) {
      setValidation('Indica qué cambio solicitas para rectificar tus datos.');
      return;
    }
    setValidation(null);
    const clean = (value: string) => value.trim().replace(/[ \t]+/g, ' ');
    const body = [
      `Nombre completo: ${clean(name)}`,
      `Correo para respuesta: ${email.trim()}`,
      `Derecho ARCO: ${right}`,
      `Descripción: ${clean(description)}`,
      dataDetails.trim() ? `Datos involucrados: ${clean(dataDetails)}` : '',
      right === 'Rectificación' ? `Cambio solicitado: ${clean(requestedChange)}` : '',
      '',
      'Solicito indicaciones para verificar mi identidad por un medio seguro.',
    ].filter(Boolean).join('\n');
    await draft.open(`Solicitud ARCO - ${right} - Salón Brenn's`, body);
  }

  return { name, setName, email, setEmail, right, setRight, description, setDescription,
    dataDetails, setDataDetails, requestedChange, setRequestedChange, validation, prepare,
    mailError: draft.error, mailOpened: draft.opened, mailBusy: draft.busy,
    copyEmail: draft.copyEmail, copyRequest: draft.copyRequest, copyError: draft.copyError, copied: draft.copied };
}
