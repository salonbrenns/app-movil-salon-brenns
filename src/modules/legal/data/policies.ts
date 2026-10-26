import type { LegalDocument } from '../models/legal-document';

export const policiesDocument: LegalDocument = {
  "title": "Políticas de cancelaciones, devoluciones y garantías",
  "status": "draft",
  "sections": [
    {
      "number": 1,
      "title": "Devoluciones y cambios",
      "blocks": [
        {
          "kind": "subheading",
          "text": "Atención al cliente"
        },
        {
          "kind": "paragraph",
          "text": "Brenn's no acepta devoluciones, cambios ni reembolsos por simple retracto o cambio de opinión una vez que el servicio ha sido consumado."
        },
        {
          "kind": "paragraph",
          "text": "El establecimiento señala la Garantía Legal por defectos de fabricación o vicios ocultos. La frase «única excepción» proporcionada por el negocio no excluye otros derechos reconocidos por la Ley Federal de Protección al Consumidor."
        },
        {
          "kind": "paragraph",
          "text": "Según la política proporcionada, Brenn's determinará si aplica reparación, reemplazo o reembolso conforme a la LFPC."
        },
        {
          "kind": "paragraph",
          "text": "Si recibiste un producto dañado, notifícalo de inmediato a salonbrennsdudas@gmail.com."
        }
      ]
    },
    {
      "number": 2,
      "title": "Cancelaciones de citas y cursos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Las cancelaciones de citas son procedentes si se solicitan con un mínimo de 24 horas de anticipación."
        },
        {
          "kind": "paragraph",
          "text": "Si se solicita la cancelación fuera del plazo o no se asiste, el anticipo pagado no será reembolsable según la política proporcionada, sin perjuicio de las excepciones y derechos aplicables conforme a la legislación mexicana."
        },
        {
          "kind": "paragraph",
          "text": "El tratamiento del anticipo cuando la cancelación se solicita a tiempo aún no ha sido definido. La aplicación no promete reembolsos automáticos."
        },
        {
          "kind": "paragraph",
          "text": "Para cursos rigen las condiciones particulares informadas al momento de la inscripción. Esas condiciones no están disponibles en el contrato móvil verificado y siguen pendientes de definición."
        }
      ]
    },
    {
      "number": 3,
      "title": "Aclaraciones de pagos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Puedes solicitar una revisión si consideras que hubo un error al validar una transferencia o su comprobante. Las aclaraciones se atienden en salonbrennsdudas@gmail.com."
        },
        {
          "kind": "paragraph",
          "text": "La solicitud de aclaración no representa un reembolso automático ni modifica por sí sola el estado del pago."
        }
      ]
    }
  ]
};
