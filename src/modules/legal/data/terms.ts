import type { LegalDocument } from '../models/legal-document';

export const termsDocument: LegalDocument = {
  "title": "Términos y condiciones",
  "status": "draft",
  "sections": [
    {
      "number": 1,
      "title": "Información general",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La aplicación móvil Salón Brenn's permite consultar productos de belleza, solicitar servicios, gestionar citas, inscribirse a cursos y registrar compras mediante las funciones habilitadas."
        },
        {
          "kind": "paragraph",
          "text": "El uso de la aplicación está sujeto a estos términos."
        }
      ]
    },
    {
      "number": 2,
      "title": "Registro y cuenta",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Para las funciones que requieren identificación, la persona usuaria proporciona los datos solicitados durante el registro. Debe mantener la confidencialidad de sus credenciales y proporcionar información correcta y actualizada."
        }
      ]
    },
    {
      "number": 3,
      "title": "Catálogo de productos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los productos disponibles se muestran en el catálogo. Antes de registrar un pedido se pueden revisar descripción, precio y cantidad. La disponibilidad depende del inventario real del establecimiento y el total definitivo corresponde a la respuesta del sistema."
        }
      ]
    },
    {
      "number": 4,
      "title": "Reservas de servicios",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La persona usuaria puede elegir un servicio, una fecha y un horario disponible para solicitar una cita. El estado de la reserva corresponde a la respuesta del sistema."
        },
        {
          "kind": "paragraph",
          "text": "El envío de un comprobante de transferencia no implica aprobación del pago. Las cancelaciones de citas están sujetas a la política de 24 horas de anticipación, sin perjuicio de los derechos legales aplicables."
        }
      ]
    },
    {
      "number": 5,
      "title": "Inscripción a cursos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los cursos e inscripciones se sujetan a requisitos y cupos disponibles. La información particular de fechas, importes y cancelaciones de cada curso debe confirmarse antes de completar la operación."
        },
        {
          "kind": "paragraph",
          "text": "Las condiciones particulares de cancelación todavía no están disponibles en el contrato móvil verificado."
        }
      ]
    },
    {
      "number": 6,
      "title": "Pagos mediante transferencia",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "El flujo móvil utiliza únicamente transferencia bancaria. La aplicación muestra los datos bancarios correspondientes y permite adjuntar comprobantes para pedidos, citas y cursos. La recepción de un comprobante no implica por sí sola la aprobación del pago."
        },
        {
          "kind": "paragraph",
          "text": "Puedes consultar el estado de la operación en Mis compras, Mis citas o Mis cursos, según corresponda."
        }
      ]
    },
    {
      "number": 7,
      "title": "Recogida de productos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los productos se recogen en tienda, en Pl. de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México."
        },
        {
          "kind": "paragraph",
          "text": "Referencia para llegar: Subiendo hacia la catedral, donde antes era Mueblería Pacheco, frente al Reloj."
        },
        {
          "kind": "paragraph",
          "text": "La persona cliente debe esperar confirmación de que el pedido está disponible antes de acudir. La aplicación no solicita direcciones particulares ni ofrece envío a domicilio."
        }
      ]
    },
    {
      "number": 8,
      "title": "Cancelaciones, devoluciones y garantías",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Aplican las Políticas de cancelaciones, devoluciones y garantías disponibles en esta aplicación. Las cancelaciones de citas deben solicitarse con al menos 24 horas de anticipación."
        },
        {
          "kind": "paragraph",
          "text": "Fuera de ese plazo o en caso de inasistencia, el anticipo no será reembolsable conforme a la política proporcionada por el establecimiento, sin perjuicio de los derechos legales del consumidor. El tratamiento del anticipo en cancelaciones oportunas está pendiente de definición."
        },
        {
          "kind": "paragraph",
          "text": "Las devoluciones y garantías de productos se sujetan a los derechos previstos en la Ley Federal de Protección al Consumidor."
        }
      ]
    },
    {
      "number": 9,
      "title": "Contacto",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Para dudas sobre compras, servicios, cursos o pagos, escribe a salonbrennsdudas@gmail.com."
        }
      ]
    }
  ]
};
