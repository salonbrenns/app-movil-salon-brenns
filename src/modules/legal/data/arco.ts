import type { LegalDocument } from '../models/legal-document';

export const arcoDocument: LegalDocument = {
  "title": "Derechos ARCO",
  "status": "draft",
  "sections": [
    {
      "number": 1,
      "title": "Tus derechos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Acceso: permite solicitar información sobre los datos personales que conserva Salón Brenn's y el tratamiento que reciben."
        },
        {
          "kind": "paragraph",
          "text": "Rectificación: permite solicitar la corrección de información personal incorrecta, incompleta o desactualizada."
        },
        {
          "kind": "paragraph",
          "text": "Cancelación: permite solicitar la cancelación de datos personales, considerando obligaciones legales que puedan justificar su conservación temporal."
        },
        {
          "kind": "paragraph",
          "text": "Oposición: permite solicitar que se deje de realizar determinado tratamiento de información personal en los supuestos legalmente procedentes."
        }
      ]
    },
    {
      "number": 2,
      "title": "Cómo presentar una solicitud",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Prepara un correo dirigido a salonbrennsdudas@gmail.com con tu nombre, un correo para recibir respuesta, el derecho que deseas ejercer, una descripción de tu solicitud y los datos involucrados cuando corresponda."
        },
        {
          "kind": "paragraph",
          "text": "La aplicación sólo prepara el mensaje en tu correo; debes revisarlo y enviarlo. No registra la solicitud ni confirma su recepción. No solicita ni adjunta identificaciones oficiales."
        },
        {
          "kind": "paragraph",
          "text": "La identidad de la persona solicitante deberá verificarse por un procedimiento adecuado y seguro definido por el establecimiento."
        }
      ]
    },
    {
      "number": 3,
      "title": "Plazos generales",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La Ley Federal de Protección de Datos Personales en Posesión de los Particulares prevé comunicar la determinación en un máximo general de 20 días hábiles desde la recepción de la solicitud y, si procede, hacerla efectiva dentro de los 15 días hábiles siguientes a la comunicación. La ley permite ampliaciones justificadas."
        }
      ]
    }
  ]
};
