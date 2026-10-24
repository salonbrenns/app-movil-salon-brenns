import { useState } from 'react';
import { authService } from '../services/auth-service';
import { validarCorreo } from './auth-validation';

export function useRecuperacionViewModel(token?: string) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [visible, setVisible] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function ejecutar(accion: () => Promise<void>) {
    if (ocupado) return;
    setError(null);
    setOcupado(true);
    try { await accion(); setEnviado(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo completar la solicitud.'); }
    finally { setOcupado(false); }
  }

  return { correo, setCorreo, password, setPassword, confirmacion, setConfirmacion, visible, setVisible, ocupado, error, enviado,
    solicitar: () => { const invalid = validarCorreo(correo).correo; if (invalid) { setError(invalid); return; } void ejecutar(() => authService.recuperarContrasena(correo)); },
    guardar: () => { if (!token?.trim()) { setError('Abre el enlace de recuperación recibido en tu correo.'); return; } if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; } if (password !== confirmacion) { setError('Las contraseñas deben coincidir.'); return; } void ejecutar(() => authService.restablecerContrasena(token, password)); },
  };
}
