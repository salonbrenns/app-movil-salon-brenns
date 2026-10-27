import { getLegalDocument, legalDocuments, type LegalDocumentKey } from '@/modules/legal/data/documents';
import { faqs } from '@/modules/legal/data/faqs';
import { act, renderHook } from '@testing-library/react-native';
import { useFaqViewModel } from '@/modules/legal/viewmodels/use-faq-view-model';
import { emailDraftUri } from '@/modules/legal/services/email-draft';
import { isProtectedPath } from '@/modules/auth/models/auth-navigation';
import { PAGINAS_CUENTA } from '@/modules/cuenta/viewmodels/cuenta-state';

const flatten = (key: LegalDocumentKey) => getLegalDocument(key).sections
  .flatMap((section) => section.blocks)
  .flatMap((block) => block.kind === 'list' ? block.items ?? [] : block.text ?? [])
  .join(' ');

test('incluye los seis borradores móviles y las condiciones críticas sin depender de la red', () => {
  expect(legalDocuments.privacidad.sections).toHaveLength(7);
  expect(legalDocuments.terminos.sections).toHaveLength(9);
  expect(legalDocuments.politicas.sections).toHaveLength(3);
  expect(legalDocuments.compras.sections).toHaveLength(5);
  expect(legalDocuments.arco.sections).toHaveLength(3);
  expect(legalDocuments.eliminacion.sections).toHaveLength(2);
  for (const document of Object.values(legalDocuments)) {
    expect(document.status).toBe('draft');
    expect(document.version).toBeUndefined();
    expect(document.updatedAt).toBeUndefined();
    expect(document.sections.every((section) => section.blocks.length > 0)).toBe(true);
  }
  expect(flatten('privacidad')).toContain('Pl. de la Revolución Mexicana 5');
  expect(flatten('privacidad')).toContain('20 días hábiles');
  expect(flatten('privacidad')).toContain('15 días hábiles');
  expect(flatten('terminos')).toContain('transferencia bancaria');
  expect(flatten('politicas')).toContain('mínimo de 24 horas');
  expect(flatten('compras')).toContain('recogen directamente');
  expect(flatten('arco')).toContain('ni confirma su recepción');
  expect(flatten('eliminacion')).toContain('no elimina automáticamente');
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
