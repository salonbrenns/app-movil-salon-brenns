import { useRef, useState } from 'react';
import { HttpPerfilService } from '../services/perfil-service';
import { seguridadError } from './seguridad-error';

const service = new HttpPerfilService();
export function useSeguridadViewModel() {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [visibilidad, setVisibilidad] = useState({ actual: false, nueva: false, confirmacion: false });
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const enviando = useRef(false);
  function cambiarActual(value: string) { setActual(value); setError(null); setGuardado(false); }
  function cambiarNueva(value: string) { setNueva(value); setError(null); setGuardado(false); }
  function cambiarConfirmacion(value: string) { setConfirmacion(value); setError(null); setGuardado(false); }
  function alternarVisibilidad(campo: keyof typeof visibilidad) {
    setVisibilidad((value) => {
      if (campo === 'actual') return { ...value, actual: !value.actual };
      if (campo === 'nueva') return { ...value, nueva: !value.nueva };
      return { ...value, confirmacion: !value.confirmacion };
    });
  }
  async function guardar() {
    if (enviando.current) return;
    setGuardado(false);
    if (!actual) { setError('Ingresa tu contraseña actual.'); return; }
    if (!nueva) { setError('Ingresa una nueva contraseña.'); return; }
    if (nueva.length < 8) { setError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (!confirmacion) { setError('Confirma la nueva contraseña.'); return; }
    if (nueva !== confirmacion) { setError('Las contraseñas nuevas no coinciden.'); return; }
    enviando.current = true;
    setError(null); setOcupado(true);
    try {
      await service.cambiarPassword(actual, nueva);
      setActual(''); setNueva(''); setConfirmacion('');
      setVisibilidad({ actual: false, nueva: false, confirmacion: false });
      setGuardado(true);
    } catch (reason) { setError(seguridadError(reason)); }
    finally { enviando.current = false; setOcupado(false); }
  }
  return { actual, setActual: cambiarActual, nueva, setNueva: cambiarNueva, confirmacion, setConfirmacion: cambiarConfirmacion,
    visibilidad, alternarVisibilidad,
    ocupado, error, guardado, guardar };
}
