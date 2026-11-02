import { userError } from '@/shared/adapters/user-error';

export function seguridadError(reason: unknown): string {
  return userError(reason, 'cambiar-password').message;
}
