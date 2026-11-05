export type Faq = Readonly<{ question: string; answer: string }>;

export const faqs: readonly Faq[] = [
  {
    question: '¿Cómo puedo agendar una cita?',
    answer: 'Ingresa a la sección de Servicios, selecciona el servicio que deseas, elige una fecha en el calendario y después uno de los horarios disponibles. Revisa los detalles y confirma tu solicitud. Para realizar el pago, utiliza los datos de transferencia bancaria y adjunta tu comprobante. Consulta el estado de la cita en Mi agenda.',
  },
  {
    question: '¿Qué métodos de pago acepta Salón Brenn\'s?',
    answer: 'Actualmente, la aplicación utiliza transferencia bancaria para productos, servicios y cursos. Puedes consultar los datos bancarios y adjuntar el comprobante de cada operación. Consulta el estado en Mis compras, Mis citas o Mis cursos.',
  },
  {
    question: '¿Puedo cancelar una cita?',
    answer: 'Sí. Según la política proporcionada por el establecimiento, las cancelaciones deben solicitarse con al menos 24 horas de anticipación. Fuera de ese plazo o por inasistencia, el anticipo no será reembolsable, sin perjuicio de los derechos que te correspondan por ley. Consulta las condiciones en Políticas.',
  },
  {
    question: '¿Cómo puedo comprar productos y recibir mi pedido?',
    answer: 'Ingresa al Catálogo, selecciona los productos que deseas y agrégalos al Carrito. Revisa tu pedido, realiza la transferencia bancaria y adjunta el comprobante correspondiente. Los productos se recogen en tienda una vez que se te confirme que el pedido está disponible.',
  },
  {
    question: '¿Cómo puedo inscribirme a un curso?',
    answer: 'Entra a la sección de Cursos, selecciona el curso de tu interés y consulta sus detalles. Si hay cupo disponible, pulsa Inscribirme y confirma la inscripción. La aplicación mostrará los datos de transferencia y permitirá adjuntar el comprobante. Puedes retomar un pago pendiente desde Mis cursos.',
  },
];
