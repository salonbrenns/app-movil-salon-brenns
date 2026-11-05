import type { LegalDocument } from '../models/legal-document';

export const privacyDocument: LegalDocument = {
  "title": "Aviso de privacidad",
  "status": "approved",
  "version": "1.0",
  "updatedAt": "2026-11-03",
  "sections": [
    {
      "number": 1,
      "title": "Identidad y domicilio de la responsable",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Brenda Hernandez Garcia, quien opera comercialmente bajo el nombre Academia, Distribuidora y Salón Brenn's, es responsable del tratamiento y protección de los datos personales obtenidos mediante la aplicación móvil Salón Brenn's."
        },
        {
          "kind": "paragraph",
          "text": "Domicilio: Plaza de la Revolución Mexicana 5, Centro, Huejutla de Reyes, Hidalgo, México."
        },
        {
          "kind": "paragraph",
          "text": "Correo de contacto: salonbrenns11@gmail.com"
        },
        {
          "kind": "paragraph",
          "text": "Sitio web: https://brenns-sistema.vercel.app/"
        },
        {
          "kind": "paragraph",
          "text": "El tratamiento de datos personales se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y demás disposiciones aplicables."
        }
      ]
    },
    {
      "number": 2,
      "title": "Datos personales recopilados",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La aplicación móvil trata los datos necesarios para proporcionar las funciones solicitadas por sus usuarios."
        },
        {
          "kind": "list",
          "items": [
            "Datos de identificación y contacto: nombre completo, correo electrónico y número de teléfono.",
            "Datos de cuenta y autenticación: información de registro, credenciales de acceso protegidas y datos de sesión necesarios para autenticar a los usuarios.",
            "Datos de citas y servicios: servicios seleccionados, fechas, horarios, reservaciones, estados de las citas y cancelaciones.",
            "Datos de cursos: cursos seleccionados, inscripciones, fechas, estados de inscripción y operaciones de pago relacionadas.",
            "Datos de compras: productos, variantes, cantidades, precios, pedidos, estados e historial de compras.",
            "Datos de pagos: referencias de operaciones, comprobantes de transferencias bancarias y estados de revisión. Los documentos proporcionados pueden contener información financiera visible, por lo que se recomienda no incluir datos innecesarios.",
            "Datos técnicos: información necesaria para establecer comunicaciones con el servidor, gestionar sesiones y proteger las operaciones, incluidos los registros técnicos que genere la infraestructura utilizada."
          ]
        },
        {
          "kind": "paragraph",
          "text": "La aplicación no solicita direcciones particulares para entregas, ya que los productos se recogen en el establecimiento."
        }
      ]
    },
    {
      "number": 3,
      "title": "Finalidades del tratamiento",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los datos personales se utilizan para:"
        },
        {
          "kind": "list",
          "items": [
            "Crear y administrar cuentas de usuario.",
            "Permitir el inicio y cierre de sesión.",
            "Consultar productos, servicios y cursos.",
            "Registrar, consultar y cancelar citas conforme a las políticas aplicables.",
            "Administrar inscripciones a cursos.",
            "Registrar pedidos y compras de productos.",
            "Recibir comprobantes de transferencia bancaria y verificar los pagos.",
            "Mostrar historiales y estados de operaciones.",
            "Permitir la consulta y modificación de información del perfil.",
            "Atender solicitudes de ayuda, derechos ARCO y eliminación de cuentas.",
            "Proteger las cuentas y prevenir operaciones no autorizadas.",
            "Cumplir las obligaciones legales correspondientes."
          ]
        },
        {
          "kind": "paragraph",
          "text": "La aceptación de los términos de la aplicación no implica, por sí misma, consentimiento para recibir promociones."
        },
        {
          "kind": "paragraph",
          "text": "Cualquier tratamiento adicional con fines publicitarios o comerciales deberá informarse al usuario y contar con los mecanismos de consentimiento u oposición que legalmente correspondan."
        }
      ]
    },
    {
      "number": 4,
      "title": "Almacenamiento, proveedores y comunicación de datos",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La aplicación móvil se comunica con los servicios del sistema de Salón Brenn's para realizar las operaciones solicitadas."
        },
        {
          "kind": "paragraph",
          "text": "En esta infraestructura intervienen proveedores tecnológicos relacionados con:"
        },
        {
          "kind": "list",
          "items": [
            "Vercel: alojamiento y funcionamiento del sistema y su API.",
            "Neon: almacenamiento de información en la base de datos del sistema.",
            "Cloudinary: almacenamiento de imágenes y comprobantes relacionados con las operaciones que lo requieren."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Estos servicios pueden procesar información necesaria para proporcionar sus funciones y estarán sujetos a las condiciones contractuales y legales correspondientes."
        },
        {
          "kind": "paragraph",
          "text": "Salón Brenn's no comunicará datos personales a terceros para finalidades ajenas a las informadas sin cumplir los requisitos de consentimiento o las excepciones establecidos por la legislación aplicable."
        }
      ]
    },
    {
      "number": 5,
      "title": "Seguridad de la información",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La aplicación utiliza conexiones HTTPS para comunicarse con su servidor de producción y mecanismos de autenticación para controlar el acceso a las cuentas."
        },
        {
          "kind": "paragraph",
          "text": "La información de sesión se almacena mediante mecanismos protegidos del dispositivo cuando corresponde."
        },
        {
          "kind": "paragraph",
          "text": "Las contraseñas se procesan mediante los mecanismos de autenticación del sistema y no se muestran en texto legible en la aplicación."
        },
        {
          "kind": "paragraph",
          "text": "La información personal y las operaciones administrativas deben estar protegidas mediante controles de acceso y medidas técnicas y administrativas apropiadas."
        },
        {
          "kind": "paragraph",
          "text": "Salón Brenn's deberá revisar y actualizar sus medidas de seguridad de acuerdo con los riesgos asociados al tratamiento de datos personales."
        }
      ]
    },
    {
      "number": 6,
      "title": "Derechos ARCO",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los usuarios pueden ejercer sus derechos de:"
        },
        {
          "kind": "list",
          "items": [
            "Acceso: conocer los datos personales sujetos a tratamiento.",
            "Rectificación: solicitar la corrección de información inexacta o incompleta.",
            "Cancelación: solicitar la cancelación de datos cuando proceda legalmente.",
            "Oposición: oponerse a determinados tratamientos en los supuestos previstos por la legislación."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Las solicitudes pueden prepararse mediante el apartado Derechos ARCO de la aplicación o enviarse directamente al correo:"
        },
        {
          "kind": "paragraph",
          "text": "salonbrenns11@gmail.com"
        },
        {
          "kind": "paragraph",
          "text": "El solicitante deberá proporcionar su nombre, un medio para recibir respuesta, el derecho que desea ejercer y una descripción de la solicitud."
        },
        {
          "kind": "paragraph",
          "text": "Una persona encargada dará seguimiento y, cuando corresponda, indicará un procedimiento seguro para verificar la identidad del titular o de su representante."
        },
        {
          "kind": "paragraph",
          "text": "No se deben enviar contraseñas ni documentos de identificación por medios inseguros."
        },
        {
          "kind": "paragraph",
          "text": "La determinación sobre la solicitud ARCO se comunicará, en términos generales, dentro de los 20 días hábiles siguientes a su recepción. Si resulta procedente, se hará efectiva dentro de los 15 días hábiles siguientes a la comunicación, sin perjuicio de las ampliaciones permitidas por la ley."
        }
      ]
    },
    {
      "number": 7,
      "title": "Eliminación de cuenta",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "El usuario puede solicitar la eliminación de su cuenta de Salón Brenn's y de los datos personales asociados mediante:"
        },
        {
          "kind": "list",
          "items": [
            "Desde la aplicación móvil: apartado Solicitar eliminación de cuenta.",
            "Desde la página web: https://brenns-sistema.vercel.app/eliminar-cuenta",
            "Por correo electrónico: salonbrenns11@gmail.com"
          ]
        },
        {
          "kind": "paragraph",
          "text": "Para iniciar una solicitud por correo deberá indicar su nombre completo y el correo registrado en la cuenta."
        },
        {
          "kind": "paragraph",
          "text": "La persona encargada recibirá la solicitud, verificará la identidad del titular mediante un procedimiento seguro y revisará los datos asociados."
        },
        {
          "kind": "paragraph",
          "text": "Una vez completada la revisión, se eliminará la cuenta y la información personal que corresponda suprimir, incluidos los registros asociados que no deban conservarse por una causa legalmente justificada."
        },
        {
          "kind": "paragraph",
          "text": "La persona encargada comunicará al usuario el resultado de su solicitud."
        },
        {
          "kind": "paragraph",
          "text": "La apertura de un borrador de correo en la aplicación no significa que la solicitud haya sido enviada o recibida y no produce la eliminación automática de la cuenta."
        },
        {
          "kind": "paragraph",
          "text": "Los usuarios pueden iniciar la solicitud desde la página web sin tener instalada la aplicación ni iniciar sesión."
        }
      ]
    },
    {
      "number": 8,
      "title": "Conservación de información",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los datos personales se conservarán durante el tiempo necesario para proporcionar los servicios solicitados, mantener las operaciones correspondientes y cumplir las obligaciones legales aplicables."
        },
        {
          "kind": "paragraph",
          "text": "Cuando una cuenta sea eliminada, se revisarán los registros de autenticación, perfil, citas, cursos, compras, pagos y comprobantes asociados."
        },
        {
          "kind": "paragraph",
          "text": "Los datos cuya conservación resulte necesaria para cumplir obligaciones legales, fiscales, de seguridad o prevención del fraude únicamente podrán mantenerse durante el periodo que corresponda y para las finalidades justificadas."
        },
        {
          "kind": "paragraph",
          "text": "Los registros que ya no deban conservarse serán suprimidos conforme a los procedimientos aplicables."
        }
      ]
    },
    {
      "number": 9,
      "title": "Permisos y archivos del dispositivo",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "La aplicación permite seleccionar imágenes o documentos desde el dispositivo cuando el usuario decide proporcionar un comprobante de transferencia."
        },
        {
          "kind": "paragraph",
          "text": "Los archivos seleccionados se utilizan para procesar la operación correspondiente y pueden transmitirse a los servicios de almacenamiento empleados por el sistema."
        },
        {
          "kind": "paragraph",
          "text": "El acceso a los archivos y los permisos del dispositivo se limitarán a las funciones implementadas y se solicitarán conforme a los mecanismos de Android que correspondan."
        }
      ]
    },
    {
      "number": 10,
      "title": "Limitación, revocación y modificaciones",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Los titulares pueden solicitar la limitación de determinados tratamientos o la revocación de su consentimiento, cuando legalmente proceda, mediante el correo:"
        },
        {
          "kind": "paragraph",
          "text": "salonbrenns11@gmail.com"
        },
        {
          "kind": "paragraph",
          "text": "La responsable atenderá las solicitudes conforme a la legislación aplicable e informará sobre las consecuencias que pueda tener la revocación para las funciones que requieran determinados datos."
        },
        {
          "kind": "paragraph",
          "text": "El presente aviso podrá modificarse cuando cambien las funcionalidades de la aplicación, los tratamientos realizados o las disposiciones legales correspondientes."
        },
        {
          "kind": "paragraph",
          "text": "La versión vigente estará disponible dentro de la aplicación móvil y en su página pública de privacidad."
        }
      ]
    }
  ]
};
