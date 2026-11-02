import { userError, type ErrorContext, type UserErrorKind } from '@/shared/adapters/user-error';

export type OperationErrorKind = UserErrorKind;
export function operationError(error: unknown, context?: ErrorContext): { kind: OperationErrorKind; message: string } { return userError(error, context); }
export type SessionResourceState<T> = Readonly<{ datos: T | null; estadoCarga: 'cargando' | 'listo' | 'error'; error: string | null; tipoError: OperationErrorKind | null; ocupado: boolean; mensaje: string | null }>;

/** One resource per confirmed session revision; no user data is persisted globally. */
export class SessionResource<T> {
  private state: SessionResourceState<T>;
  private readonly listeners = new Set<() => void>();
  private generation = 0;
  private active = true;
  private lifetime = 0;
  private controller: AbortController | null = null;
  constructor(private readonly loader: (signal?: AbortSignal) => Promise<T>, private readonly authenticated: boolean, readonly sessionScope = '', private readonly loadContext?: ErrorContext) {
    this.state = { datos: null, estadoCarga: authenticated ? 'cargando' : 'listo', error: null, tipoError: null, ocupado: false, mensaje: null };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(value: Partial<SessionResourceState<T>>) { this.state = { ...this.state, ...value }; this.listeners.forEach((listener) => listener()); }
  activate = () => { this.active = true; };
  cancel = () => { this.active = false; this.lifetime++; this.generation++; this.controller?.abort(); this.state = { datos: null, estadoCarga: 'listo', error: null, tipoError: null, ocupado: false, mensaje: null }; };
  cargar = async (): Promise<void> => {
    if (!this.authenticated || !this.active) return;
    this.controller?.abort();
    this.controller = new AbortController();
    const current = ++this.generation;
    this.publish({ estadoCarga: 'cargando', error: null, tipoError: null });
    try {
      const datos = await this.loader(this.controller.signal);
      if (this.active && current === this.generation) this.publish({ datos, estadoCarga: 'listo' });
    } catch (error) {
      if (this.active && current === this.generation) {
        const failure = operationError(error, this.loadContext);
        this.publish({ estadoCarga: 'error', error: failure.message, tipoError: failure.kind, ...(failure.kind === 'sesion' ? { datos: null } : {}) });
      }
    }
  };
  ejecutar = async <R>(operation: () => Promise<R>, message: string | ((result: R) => string), onConfirmed?: (result: R) => void, context?: ErrorContext): Promise<boolean> => {
    if (!this.authenticated || !this.active || this.state.ocupado) return false;
    const lifetime = this.lifetime;
    this.publish({ ocupado: true, error: null, tipoError: null, mensaje: null });
    try {
      const result = await operation();
      if (!this.active || lifetime !== this.lifetime) return false;
      this.publish({ mensaje: typeof message === 'function' ? message(result) : message });
      onConfirmed?.(result);
      await this.cargar();
      return this.active && lifetime === this.lifetime;
    } catch (error) {
      if (this.active && lifetime === this.lifetime) { const failure = operationError(error, context); this.publish({ error: failure.message, tipoError: failure.kind }); }
      return false;
    } finally { if (this.active && lifetime === this.lifetime) this.publish({ ocupado: false }); }
  };
}
