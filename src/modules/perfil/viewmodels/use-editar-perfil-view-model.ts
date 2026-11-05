import { useState } from 'react';
import type { Perfil } from '../models/perfil';
import { HttpPerfilService } from '../services/perfil-service';
import { userError } from '@/shared/adapters/user-error';

const service = new HttpPerfilService();
export function useEditarPerfilViewModel(perfil: Perfil, onSaved: () => Promise<void>) {
  const [nombre, setNombre] = useState(perfil.nombre);
  const [telefono, setTelefono] = useState(perfil.telefono ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  function changeName(value: string) { setNombre(value); setError(null); setSaved(false); }
  function changePhone(value: string) { setTelefono(value); setError(null); setSaved(false); }
  async function save() {
    if (busy) return;
    if (!nombre.trim()) { setError('Ingresa tu nombre.'); return; }
    if (telefono.trim() && !/^[\d+()\s-]{7,30}$/.test(telefono.trim())) { setError('Ingresa un teléfono válido.'); return; }
    setBusy(true); setError(null); setSaved(false);
    try { await service.actualizar(nombre, telefono); await onSaved(); setSaved(true); }
    catch (reason) { setError(userError(reason, 'editar-perfil').message); }
    finally { setBusy(false); }
  }
  return { nombre, setNombre: changeName, telefono, setTelefono: changePhone, busy, error, saved, save };
}
