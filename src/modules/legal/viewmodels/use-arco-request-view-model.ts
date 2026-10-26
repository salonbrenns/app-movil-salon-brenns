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
  const [validation, setValidation] = useState<string | null>(null);
  const draft = useEmailDraft();

  async function prepare() {
    if (!name.trim() || !email.trim() || !right || !description.trim()) {
      setValidation('Completa nombre, correo, derecho ARCO y descripción de la solicitud.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidation('Escribe un correo electrónico válido para recibir la respuesta.');
      return;
    }
    setValidation(null);
    const body = [
      `Nombre completo: ${name.trim()}`,
      `Correo para respuesta: ${email.trim()}`,
      `Derecho ARCO: ${right}`,
      `Descripción: ${description.trim()}`,
      dataDetails.trim() ? `Datos involucrados: ${dataDetails.trim()}` : '',
      '',
      'Solicito indicaciones para verificar mi identidad por un medio seguro.',
    ].filter(Boolean).join('\n');
    await draft.open(`Solicitud de derecho ARCO: ${right}`, body);
  }

  return { name, setName, email, setEmail, right, setRight, description, setDescription,
    dataDetails, setDataDetails, validation, prepare, mailError: draft.error, mailOpened: draft.opened };
}
