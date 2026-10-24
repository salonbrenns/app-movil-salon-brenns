import type { DocumentPickerAsset } from 'expo-document-picker';
import { fetchHttpClient, type HttpMutationClient } from '@/services/api';
import { apiId } from '@/shared/adapters/account-validation';
import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';

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
  if (asset.size != null && (asset.size < 0 || !Number.isFinite(asset.size) || asset.size > 10 * 1024 * 1024)) throw new Error('El comprobante no puede superar 10 MB.');
  return type;
}

export class HttpComprobanteService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async subir(tipo: 'pedidos' | 'citas', id: string, asset: DocumentPickerAsset) {
    const type = comprobanteType(asset);
    const form = new FormData();
    form.append('file', asset.file ?? ({ uri: asset.uri, name: asset.name, type } as unknown as Blob));
    const response = await this.http.request(`/api/${tipo}/${apiId(id)}/comprobante`, { method: 'POST', body: form });
    confirmarOk(response.body);
  }
}
