import type { LegalDocument } from '../models/legal-document';
import { business } from './business';

export const privacyDocument: LegalDocument = {
  "title": "Aviso de privacidad",
  "status": "draft",
  "sections": [
    {
      "number": 1,
      "title": "Identidad del responsable",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Academia, Distribuidora y Salón Brenn's es el nombre comercial del establecimiento que opera la aplicación móvil Salón Brenn's."
        },
        {
          "kind": "paragraph",
          "text": "Dirección del establecimiento: Pl. de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México."
        },
        {
          "kind": "paragraph",
          "text": `Correo para asuntos de privacidad: ${business.email}.`
        },
        {
          "kind": "paragraph",
          "text": "La identidad legal y el domicilio del responsable del tratamiento están pendientes de verificación antes de aprobar este aviso."
        }
      ]
    },
    {
      "number": 2,
      "title": "Datos personales utilizados",
      "blocks": [
        {
          "kind": "subheading",
          "text": "Identificación, contacto y cuenta"
        },
        {
          "kind": "list",
          "items": [
            "Nombre completo, correo electrónico y número de teléfono.",
            "Credenciales y datos necesarios para autenticar y proteger la cuenta."
          ]
        },
        {
          "kind": "subheading",
          "text": "Servicios y citas"
        },
        {
          "kind": "list",
          "items": [
            "Servicios elegidos, fechas y horarios de citas, historial de reservas, estados y cancelaciones."
          ]
        },
        {
          "kind": "subheading",
          "text": "Cursos"
        },
        {
          "kind": "list",
          "items": [
            "Cursos elegidos, inscripciones y su estado, así como pagos asociados que devuelve el sistema."
          ]
        },
        {
          "kind": "subheading",
          "text": "Compras"
        },
        {
          "kind": "list",
          "items": [
            "Productos seleccionados y comprados, cantidades, importes, historial y estado de pedidos."
          ]
        },
        {
          "kind": "subheading",
          "text": "Transferencias"
        },
        {
          "kind": "list",
          "items": [
            "Referencias de operación y estado de revisión cuando estén disponibles.",
            "Imágenes o documentos de comprobantes de transferencia enviados para pedidos, citas y cursos, incluidos los datos personales que contengan."
          ]
        },
        {
          "kind": "paragraph",
          "text": "La aplicación no solicita direcciones particulares de entrega."
        }
      ]
    },
    {
      "number": 3,
      "title": "Finalidades del tratamiento",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La información se utiliza para crear y administrar cuentas, permitir el inicio de sesión, gestionar citas de belleza, registrar inscripciones a cursos, procesar pedidos, revisar los comprobantes disponibles, informar el estado de las operaciones, atender solicitudes de clientes, facilitar la consulta y actualización de datos, atender derechos ARCO y cumplir obligaciones legales aplicables."
        },
        {
          "kind": "paragraph",
          "text": "La aplicación no solicita consentimiento para promociones mediante la aceptación de Términos. Cualquier finalidad comercial opcional futura requerirá un mecanismo independiente conforme a la ley."
        }
      ]
    },
    {
      "number": 4,
      "title": "Protección y conservación",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los datos personales deberán tratarse con las medidas de seguridad correspondientes y conservarse sólo durante el tiempo necesario para las finalidades informadas y las obligaciones legales aplicables."
        },
        {
          "kind": "paragraph",
          "text": "Los mecanismos concretos de seguridad, conservación y supresión del sistema están pendientes de verificación antes de aprobar este aviso."
        }
      ]
    },
    {
      "number": 5,
      "title": "Compartición de información",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Podrán intervenir proveedores tecnológicos que participen efectivamente en la operación de la aplicación y del sistema, bajo las condiciones legales correspondientes."
        },
        {
          "kind": "paragraph",
          "text": "Las transferencias a terceros y la identidad de los proveedores efectivos deben verificarse, documentarse e informarse conforme a la legislación aplicable."
        }
      ]
    },
    {
      "number": 6,
      "title": "Derechos ARCO",
      "blocks": [
        {
          "kind": "paragraph",
          "text": `Las personas usuarias pueden solicitar Acceso, Rectificación, Cancelación y Oposición respecto de sus datos personales mediante un correo a ${business.email} o preparando el mensaje desde la pantalla Derechos ARCO.`
        },
        {
          "kind": "paragraph",
          "text": "La solicitud deberá identificar a la persona titular, indicar el derecho y aportar la información necesaria para atenderlo. La identidad se verificará mediante un procedimiento adecuado y seguro; la app no pide ni adjunta identificaciones oficiales."
        },
        {
          "kind": "paragraph",
          "text": "Incluye tu nombre, un correo para recibir respuesta, la descripción del derecho solicitado y los datos involucrados cuando corresponda. Para rectificar, indica el cambio y aporta el sustento por el mecanismo seguro que defina el responsable. El establecimiento deberá verificar identidad o representación antes de entregar información o ejecutar cambios."
        },
        {
          "kind": "paragraph",
          "text": "De conformidad con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, la determinación se comunicará dentro de un plazo máximo general de 20 días hábiles desde la recepción de la solicitud y, si procede, se hará efectiva dentro de los 15 días hábiles siguientes a la comunicación de la respuesta. Los plazos pueden ampliarse una sola vez por un periodo igual si las circunstancias lo justifican; una negativa total o parcial deberá explicarse."
        },
        {
          "kind": "paragraph",
          "text": "La solicitud de eliminación de cuenta puede presentarse por el mismo correo. No produce un borrado inmediato: el responsable deberá verificar la identidad, revisar obligaciones legales de conservación y comunicar el resultado. Para pedir información adicional sobre el procedimiento, escribe al correo de privacidad indicado arriba."
        }
      ]
    },
    {
      "number": 7,
      "title": "Cambios en el aviso",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Las modificaciones relevantes se comunicarán por los mecanismos oficiales que determine Salón Brenn's. La versión y la fecha de actualización se mostrarán cuando este documento haya sido aprobado."
        }
      ]
    }
  ]
};
