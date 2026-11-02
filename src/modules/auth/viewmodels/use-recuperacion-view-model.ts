import { useState } from 'react';
import { authService } from '../services/auth-service';
import { validarCorreo } from './auth-validation';
import { authError, authErrorMessage } from '../adapters/auth-error-adapter';

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
    catch (reason) { setError(authErrorMessage(authError(reason, 'Recuperación de contraseña'))); }
    finally { setOcupado(false); }
  }

  return { correo, setCorreo: (value: string) => { setCorreo(value); setError(null); }, password, setPassword: (value: string) => { setPassword(value); setError(null); }, confirmacion, setConfirmacion: (value: string) => { setConfirmacion(value); setError(null); }, visible, setVisible, ocupado, error, enviado,
    solicitar: () => { const invalid = validarCorreo(correo).correo; if (invalid) { setError(invalid); return; } void ejecutar(() => authService.recuperarContrasena(correo)); },
    guardar: () => { if (!token?.trim()) { setError('Abre el enlace de recuperación recibido en tu correo.'); return; } if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; } if (password !== confirmacion) { setError('Las contraseñas deben coincidir.'); return; } void ejecutar(() => authService.restablecerContrasena(token, password)); },
  };
}
