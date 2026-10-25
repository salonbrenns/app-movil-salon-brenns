import { useState } from 'react';
import { HttpPerfilService } from '../services/perfil-service';

const service = new HttpPerfilService();
export function useSeguridadViewModel() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  async function guardar() {
    if (ocupado) return;
    if (!actual || nueva.length < 8 || nueva !== confirmacion) { setError('Revisa la contraseña actual y confirma una nueva de al menos 8 caracteres.'); return; }
    setError(null); setGuardado(false); setOcupado(true);
    try { await service.cambiarPassword(actual, nueva); setGuardado(true); setActual(''); setNueva(''); setConfirmacion(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cambiar la contraseña.'); }
    finally { setOcupado(false); }
  }
  return { actual, setActual, nueva, setNueva, confirmacion, setConfirmacion, ocupado, error, guardado, guardar };
}
