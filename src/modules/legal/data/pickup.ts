import type { LegalDocument } from '../models/legal-document';

export const pickupDocument: LegalDocument = {
  "title": "Compras y recogida en tienda",
  "status": "draft",
  "sections": [
    {
      "number": 1,
      "title": "Proceso de compra",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La persona cliente selecciona los productos, revisa el carrito y registra el pedido. La aplicación muestra los importes disponibles y los datos para efectuar una transferencia bancaria; el total definitivo corresponde a la confirmación del sistema."
        }
      ]
    },
    {
      "number": 2,
      "title": "Comprobante de pago",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La persona cliente puede adjuntar una imagen o documento para revisar la transferencia. Recibir el comprobante no equivale a aprobar definitivamente el pago."
        }
      ]
    },
    {
      "number": 3,
      "title": "Confirmación del pedido",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "El estado del pedido se consulta en Mis compras. La confirmación del pago y de la preparación del pedido debe provenir del sistema correspondiente."
        }
      ]
    },
    {
      "number": 4,
      "title": "Recogida en tienda",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los pedidos se recogen directamente en Academia, Distribuidora y Salón Brenn's, Pl. de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México."
        },
        {
          "kind": "subheading",
          "text": "¿Cómo llegar?"
        },
        {
          "kind": "paragraph",
          "text": "Subiendo hacia la catedral, donde antes era Mueblería Pacheco, frente al Reloj."
        },
        {
          "kind": "paragraph",
          "text": "Espera la confirmación de que el pedido está disponible antes de acudir. La aplicación no ofrece envíos, gastos de envío ni formularios de dirección particular."
        }
      ]
    },
    {
      "number": 5,
      "title": "Aclaraciones",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Para reportar diferencias en el pedido, productos incorrectos o problemas de pago, escribe a salonbrennsdudas@gmail.com."
        }
      ]
    }
  ]
};
