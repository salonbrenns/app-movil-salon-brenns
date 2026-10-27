import type { DocumentPickerAsset } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { FetchHttpClient, type HttpMutationClient } from '@/services/api';
import { getApiUrl } from '@/config/api';
import { apiId } from '@/shared/adapters/account-validation';
import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';
import { record, text } from '@/shared/adapters/validation';

const maxBytes = 10 * 1024 * 1024;
type NativeProof = { file: File; cleanup: () => void };
const stagedProofs = new WeakMap<DocumentPickerAsset, NativeProof>();

function typeForExtension(extension: string): string | null {
  switch (extension) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    case 'pdf': return 'application/pdf';
    default: return null;
  }
}

export function comprobanteType(asset: DocumentPickerAsset) {
  const extension = asset.name.split('.').pop()?.toLowerCase() ?? '';
  const type = typeForExtension(extension);
  if (!type || (asset.mimeType && asset.mimeType !== type)) throw new Error('Selecciona un archivo JPG, PNG, WEBP, GIF o PDF.');
  if (asset.size != null && (asset.size < 0 || !Number.isFinite(asset.size) || asset.size > maxBytes)) throw new Error('El comprobante no puede superar 10 MB.');
  return type;
}

async function nativeProof(asset: DocumentPickerAsset): Promise<NativeProof> {
  if (/[\\/]/.test(asset.name)) throw new Error('El nombre del archivo no es válido.');
  let selected: File;
  try { selected = new File(asset.uri); }
  catch { throw new Error('No se pudo abrir el archivo seleccionado en el dispositivo. Vuelve a seleccionarlo.'); }
  // The source may be a content:// URI. File.exists can report false when its
  // permission probe fails, so the awaited copy is the actual readability check.
  const directory = new Directory(Paths.cache, `comprobante-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  try {
    directory.create();
    const file = new File(directory, asset.name);
    await selected.copy(file);
    if (!file.exists) throw new Error('La copia del comprobante no está disponible.');
    if (file.size === 0) throw new Error('El archivo seleccionado está vacío. Elige otro comprobante.');
    if (file.size > maxBytes) throw new Error('El comprobante no puede superar 10 MB.');
    return { file, cleanup: () => directory.delete() };
  } catch (error) {
    try { directory.delete(); } catch { /* No temporary directory was created. */ }
    if (error instanceof Error && (error.message.includes('10 MB') || error.message.includes('está vacío'))) throw error;
    throw new Error('No se pudo preparar el archivo seleccionado en el dispositivo. Vuelve a seleccionarlo.');
  }
}

/** Retain a private copy while the user previews or retries the selected proof. */
export async function prepararComprobante(asset: DocumentPickerAsset): Promise<{ asset: DocumentPickerAsset; cleanup: () => void }> {
  comprobanteType(asset);
  if (asset.file) return { asset, cleanup: () => {} };
  const prepared = await nativeProof(asset);
  const storedAsset = { ...asset, uri: prepared.file.uri, size: prepared.file.size };
  stagedProofs.set(storedAsset, prepared);
  return { asset: storedAsset, cleanup: () => {
    stagedProofs.delete(storedAsset);
    try { prepared.cleanup(); } catch { /* The cache may already have been cleared. */ }
  } };
}

export class HttpComprobanteService {
  private readonly pending = new Set<string>();
  constructor(private readonly http: HttpMutationClient = new FetchHttpClient(getApiUrl, expoFetch)) {}
  async subir(tipo: 'pedidos' | 'citas' | 'pagos-curso', id: string, asset: DocumentPickerAsset) {
    comprobanteType(asset);
    const path = `/api/${tipo}/${apiId(id)}/comprobante`;
    if (this.pending.has(path)) throw new Error('El comprobante ya se está enviando.');
    this.pending.add(path);
    let cleanup: (() => void) | undefined;
    try {
      const form = new FormData();
      if (asset.file) {
        form.append('file', asset.file, asset.name);
      } else {
        const staged = stagedProofs.get(asset);
        const prepared = staged ?? await nativeProof(asset);
        if (!staged) cleanup = prepared.cleanup;
        if (!prepared.file.exists) throw new Error('El archivo preparado ya no está disponible. Selecciónalo de nuevo.');
        form.append('file', prepared.file, asset.name);
      }
      const response = await this.http.request(path, { method: 'POST', body: form });
      confirmarOk(response.body);
      text(record(response.body, 'comprobante').url, 'comprobante.url');
    } finally {
      try { cleanup?.(); } catch { /* The uploaded copy is disposable cache data. */ }
      this.pending.delete(path);
    }
  }
}
