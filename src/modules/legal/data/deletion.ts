import type { LegalDocument } from '../models/legal-document';
import { business } from './business';

export const deletionDocument: LegalDocument = {
  "title": "Eliminar cuenta y solicitar cancelación de datos",
  "status": "draft",
  "sections": [
    {
      "number": 1,
      "title": "Solicitud de eliminación",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Puedes solicitar la eliminación de tu cuenta de Salón Brenn's y de los datos personales asociados. La solicitud será revisada y atendida conforme a la legislación aplicable. Algunos datos podrían conservarse durante los plazos legalmente exigidos."
        },
        {
          "kind": "paragraph",
          "text": "La eliminación de la cuenta puede impedir el acceso a citas, compras, cursos y otros registros asociados. El establecimiento deberá confirmar el alcance y el resultado de la solicitud; la app no elimina automáticamente ningún dato."
        },
        {
          "kind": "paragraph",
          "text": "Antes de ejecutar cualquier eliminación, el establecimiento deberá verificar la identidad de la persona titular o su representación y revisar las obligaciones de conservación aplicables. Preparar o abrir el correo no cierra tu sesión ni confirma que la solicitud se haya recibido."
        }
      ]
    },
    {
      "number": 2,
      "title": "Cómo solicitarla",
      "blocks": [
        {
          "kind": "paragraph",
          "text": `Puedes preparar un correo a ${business.email} desde esta pantalla, incluso si no puedes iniciar sesión. Revisa y envía el mensaje desde tu aplicación de correo.`
        },
        {
          "kind": "paragraph",
          "text": "La cancelación ARCO de determinados datos y la eliminación completa de la cuenta son solicitudes distintas. El establecimiento comunicará la determinación y el resultado por el medio de respuesta indicado. La verificación de identidad, conservación legal y procedimiento final requieren aprobación operativa del responsable."
        },
        {
          "kind": "paragraph",
          "text": "Cuando la solicitud incluya el ejercicio de un derecho ARCO, aplican los plazos generales de 20 días hábiles para comunicar la determinación y, si procede, 15 días hábiles siguientes para hacerla efectiva, con las ampliaciones justificadas que permite la ley."
        }
      ]
    }
  ]
};
