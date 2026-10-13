import { useRef, useState } from 'react';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import type { CamposAutenticacion, ErroresAutenticacion } from '../models/autenticacion';
import { camposIniciales, SECCIONES_AUTENTICACION, type EstadoAutenticacion } from './autenticacion-state';
import { useAuthSession } from './auth-session-provider';
import { SubmissionGate, validarAcceso } from './auth-validation';
import { authError, authErrorMessage } from '../adapters/auth-error-adapter';
import { loginDestination } from '../models/auth-navigation';

export function useAutenticacionViewModel(seccion = 'login') {
  const auth = useAuthSession();
  const params = useLocalSearchParams<{ returnTo?: string | string[]; token?: string | string[] }>();
  const destino = loginDestination(params.returnTo);
  const section = SECCIONES_AUTENTICACION.find((item) => item === seccion) ?? 'login';
  const [estado, setEstado] = useState<EstadoAutenticacion>({ datos: camposIniciales, estadoCarga: 'listo', error: null });
  const [erroresCampos, setErroresCampos] = useState<ErroresAutenticacion>({});
  const [visibilidad, setVisibilidad] = useState({ password: false, confirmacionPassword: false });
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [operacionPendiente, setOperacionPendiente] = useState<string | null>(null);
  const gate = useRef(new SubmissionGate());
  const cargando = estado.estadoCarga === 'cargando';

  function cambiarCampo(campo: keyof CamposAutenticacion, valor: string) {
    setEstado((current) => ({ ...current, error: null, datos: { ...current.datos, [campo]: valor } }));
    setErroresCampos((current) => ({ ...current, [campo]: undefined }));
  }
  function limpiarSecretos() {
    setVisibilidad({ password: false, confirmacionPassword: false });
    setEstado((current) => ({ ...current, datos: { ...current.datos, password: '', confirmacionPassword: '' } }));
  }
  function validar(errors: ErroresAutenticacion): boolean {
    setErroresCampos(errors);
    return Object.keys(errors).length === 0;
  }
  async function ejecutar(operation: string, action: () => Promise<void>) {
    await gate.current.run(async () => {
      setEstado((current) => ({ ...current, estadoCarga: 'cargando', error: null }));
      setOperacionPendiente(operation);
      setMensaje(null);
      try {
        await action();
        setEstado((current) => ({ ...current, estadoCarga: 'listo', error: null }));
      } catch (failure) {
        const error = authError(failure, operation);
        setEstado((current) => ({ ...current, estadoCarga: 'error', error: authErrorMessage(error) }));
      } finally { setOperacionPendiente(null); }
    });
  }
  async function iniciarSesion() {
    if (!validar(validarAcceso(estado.datos))) return;
    await ejecutar('Acceso', async () => {
      await auth.signIn(estado.datos.correo, estado.datos.password);
      limpiarSecretos();
      router.replace(destino as Href);
    });
  }
  async function cerrarSesion() {
    await ejecutar('Cierre de sesión', async () => { await auth.signOut(); limpiarSecretos(); router.replace('/'); });
  }
  return {
    section, estado, campos: estado.datos, erroresCampos, cargando, operacionPendiente,
    error: estado.error ?? (section === 'login' ? auth.error : null), mensaje,
    visibilidad, alternarVisibilidad: (campo: keyof typeof visibilidad) => setVisibilidad((value) => ({ ...value, [campo]: !value[campo] })),
    loginHref: { pathname: '/autenticacion' as const, params: { returnTo: destino } },
    iniciarSesion, cerrarSesion,
    cambiarNombre: (valor: string) => cambiarCampo('nombre', valor),
    cambiarCorreo: (valor: string) => cambiarCampo('correo', valor),
    cambiarTelefono: (valor: string) => cambiarCampo('telefono', valor),
    cambiarPassword: (valor: string) => cambiarCampo('password', valor),
    cambiarConfirmacionPassword: (valor: string) => cambiarCampo('confirmacionPassword', valor),
  };
}
