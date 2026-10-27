import type { LegalDocument } from '../models/legal-document';

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
        }
      ]
    },
    {
      "number": 2,
      "title": "Cómo solicitarla",
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Puedes preparar un correo a salonbrennsdudas@gmail.com desde esta pantalla, incluso si no puedes iniciar sesión. Revisa y envía el mensaje desde tu aplicación de correo."
        },
        {
          "kind": "paragraph",
          "text": "La cancelación ARCO de determinados datos y la eliminación completa de la cuenta son solicitudes distintas. La verificación de identidad, conservación legal y procedimiento final están pendientes de definición."
        }
      ]
    }
  ]
};
