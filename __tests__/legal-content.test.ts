import { getLegalDocument, legalDocuments, type LegalDocumentKey } from '@/modules/legal/data/documents';
import { faqs } from '@/modules/legal/data/faqs';
import { act, renderHook } from '@testing-library/react-native';
import { useFaqViewModel } from '@/modules/legal/viewmodels/use-faq-view-model';
import { emailDraftUri } from '@/modules/legal/services/email-draft';
import { business } from '@/modules/legal/data/business';
import { isProtectedPath } from '@/modules/auth/models/auth-navigation';
import { PAGINAS_CUENTA } from '@/modules/cuenta/viewmodels/cuenta-state';

const flatten = (key: LegalDocumentKey) => getLegalDocument(key).sections
  .flatMap((section) => section.blocks)
  .flatMap((block) => block.kind === 'list' ? block.items ?? [] : block.text ?? [])
  .join(' ');

test('el aviso móvil aprobado reproduce las diez secciones publicadas', () => {
  const privacy = legalDocuments.privacidad;
  expect(privacy.status).toBe('approved');
  expect(privacy.version).toBe('1.0');
  expect(privacy.updatedAt).toBe('2026-11-03');
  expect(privacy.sections.map(({ number, title }) => [number, title])).toEqual([
    [1, 'Identidad y domicilio de la responsable'],
    [2, 'Datos personales recopilados'],
    [3, 'Finalidades del tratamiento'],
    [4, 'Almacenamiento, proveedores y comunicación de datos'],
    [5, 'Seguridad de la información'],
    [6, 'Derechos ARCO'],
    [7, 'Eliminación de cuenta'],
    [8, 'Conservación de información'],
    [9, 'Permisos y archivos del dispositivo'],
    [10, 'Limitación, revocación y modificaciones'],
  ]);
  expect(privacy.sections.every((section) => section.blocks.length > 0)).toBe(true);
  const content = flatten('privacidad');
  for (const detail of [
    'Brenda Hernandez Garcia',
    "Academia, Distribuidora y Salón Brenn's",
    'Plaza de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México',
    business.email,
    'Vercel', 'Neon', 'Cloudinary', 'HTTPS',
    'Acceso', 'Rectificación', 'Cancelación', 'Oposición',
    '20 días hábiles', '15 días hábiles',
    'https://brenns-sistema.vercel.app/eliminar-cuenta',
    'por correo', 'no produce la eliminación automática',
    'obligaciones legales', 'permisos del dispositivo', 'revocación de su consentimiento',
  ]) {
    expect(content).toContain(detail);
  }
  expect(content).not.toContain('pendientes de verificación');
});

test('los otros cinco documentos conservan sus borradores y condiciones críticas sin depender de la red', () => {
  expect(legalDocuments.terminos.sections).toHaveLength(9);
  expect(legalDocuments.politicas.sections).toHaveLength(3);
  expect(legalDocuments.compras.sections).toHaveLength(5);
  expect(legalDocuments.arco.sections).toHaveLength(3);
  expect(legalDocuments.eliminacion.sections).toHaveLength(2);
  for (const key of ['terminos', 'politicas', 'compras', 'arco', 'eliminacion'] as const) {
    const document = legalDocuments[key];
    expect(document.status).toBe('draft');
    expect(document.version).toBeUndefined();
    expect(document.updatedAt).toBeUndefined();
    expect(document.sections.every((section) => section.blocks.length > 0)).toBe(true);
  }
  expect(flatten('terminos')).toContain('transferencia bancaria');
  expect(flatten('politicas')).toContain('mínimo de 24 horas');
  expect(flatten('compras')).toContain('recogen directamente');
  expect(flatten('arco')).toContain('ni confirma su recepción');
  expect(flatten('eliminacion')).toContain('no elimina automáticamente');
  for (const key of ['privacidad', 'terminos', 'politicas', 'compras', 'arco', 'eliminacion'] as const) {
    expect(flatten(key)).not.toContain('salonbrennsdudas@gmail.com');
  }
  expect(business.email).toBe('salonbrenns11@gmail.com');
  expect(flatten('arco')).toContain(business.email);
  expect(flatten('privacidad')).toContain(business.email);
  expect(flatten('eliminacion')).toContain(business.email);
});

test('las rutas legales y la solicitud de eliminación son públicas, sin Direcciones', () => {
  const publicSections = ['privacidad', 'terminos', 'politicas', 'compras-recogida', 'arco', 'eliminar-cuenta'];
  for (const section of publicSections) {
    expect(PAGINAS_CUENTA.some((page) => page.seccion === section)).toBe(true);
    expect(isProtectedPath(`/cuenta/${section}`)).toBe(false);
  }
  expect(PAGINAS_CUENTA.some((page) => page.seccion === 'direcciones')).toBe(false);
  expect(emailDraftUri('Solicitud ARCO: Acceso', 'Nombre: Ana López\nDetalle')).toContain('subject=Solicitud%20ARCO%3A%20Acceso');
  expect(emailDraftUri('Solicitud ARCO: Acceso', 'Nombre: Ana López\nDetalle')).toContain('body=Nombre%3A%20Ana%20L%C3%B3pez%0ADetalle');
  expect(emailDraftUri('Solicitud ARCO: Acceso', 'Nombre: Ana López\nDetalle').startsWith(`mailto:${business.email}?`)).toBe(true);
});

test('ofrece exactamente las cinco preguntas y respuestas solicitadas', () => {
  expect(faqs).toHaveLength(5);
  expect(faqs.map((faq) => faq.question)).toEqual([
    '¿Cómo puedo agendar una cita?',
    '¿Qué métodos de pago acepta Salón Brenn\'s?',
    '¿Puedo cancelar una cita?',
    '¿Cómo puedo comprar productos y recibir mi pedido?',
    '¿Cómo puedo inscribirme a un curso?',
  ]);
  expect(faqs.every((faq) => faq.answer.length > 0)).toBe(true);
});

test('el acordeón permite abrir y cerrar una respuesta', () => renderHook(useFaqViewModel).then(async ({ result }) => {
  expect(result.current.expandedIndex).toBeNull();
  await act(async () => { result.current.toggle(0); });
  expect(result.current.expandedIndex).toBe(0);
  await act(async () => { result.current.toggle(0); });
  expect(result.current.expandedIndex).toBeNull();
}));
