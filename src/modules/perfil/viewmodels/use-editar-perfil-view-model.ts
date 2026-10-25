import { useState } from 'react';
import type { Perfil } from '../models/perfil';
import { HttpPerfilService } from '../services/perfil-service';

const service = new HttpPerfilService();
export function useEditarPerfilViewModel(perfil: Perfil, onSaved: () => Promise<void>) {
  const [nombre, setNombre] = useState(perfil.nombre);
  const [telefono, setTelefono] = useState(perfil.telefono ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  async function save() {
    if (busy) return;
    if (!nombre.trim()) { setError('Ingresa tu nombre.'); return; }
    if (telefono.trim() && !/^[\d+()\s-]{7,30}$/.test(telefono.trim())) { setError('Ingresa un teléfono válido.'); return; }
    setBusy(true); setError(null); setSaved(false);
    try { await service.actualizar(nombre, telefono); await onSaved(); setSaved(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo guardar el perfil.'); }
    finally { setBusy(false); }
  }
  return { nombre, setNombre, telefono, setTelefono, busy, error, saved, save };
}
