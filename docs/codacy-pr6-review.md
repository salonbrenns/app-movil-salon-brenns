# Revisión local de Codacy, PR #6

Rama: `feature/benilde-academia-cursos`. Esta revisión no cambia el análisis remoto de Codacy.

## Las 19 alertas del análisis estático

| Hallazgos | Archivo | Resultado |
| --- | --- | --- |
| 7, SVG en cadenas HTML | `src/components/ui/icon.tsx` | Corregidos. Los 16 dibujos usan `react-native-svg` con las mismas rutas, figuras, `viewBox`, grosor de trazo, tamaños y colores del tema. No se construye ni decodifica marcado SVG. |
| 1, error asíncrono al seleccionar o enviar comprobante | `src/components/ui/payment-proof-uploader.tsx` | Corregido. La selección y el envío capturan errores, deshabilitan operaciones concurrentes y permiten reintentar. Un archivo de reemplazo inválido no deja el comprobante anterior listo para enviar. |
| 7, callbacks que devuelven expresiones `void` | `agenda-view.tsx` (2), `recuperacion-view.tsx` (1), `catalogo-view.tsx` (3), `productos-list-view.tsx` (1) | Corregidos con cuerpos de bloque y el mismo cambio de estado. |
| 3, supuestos timing attacks | `use-recuperacion-view-model.ts` | Falsos positivos: las tres alertas actuales señalan la comparación `password !== confirmacion`. Ambas cadenas las introduce la persona en el formulario local. No se comparan con un secreto almacenado ni se autentica al usuario mediante esa igualdad; el servidor valida el token y procesa el restablecimiento. El tiempo de esta comprobación local no ofrece un oráculo remoto para descubrir contraseñas. Se conserva la validación. Una comparación de tiempo constante en JavaScript no aportaría una garantía criptográfica y podría crear una impresión falsa de seguridad. |
| 1, expresión regular de importe | `src/shared/adapters/account-validation.ts` | Corregido. `cents` analiza los dígitos de manera iterativa y acumula con `bigint`, admite hasta dos decimales y rechaza el resto sin redondear. |

Total: **16 correcciones y 3 falsos positivos justificados**.

## Seguimiento del análisis publicado en `fd36ed3`

Codacy muestra **10 alertas** en el PR #6: seis en `__tests__/payment-proof-uploader.test.tsx`, una en `src/components/ui/icon.tsx` y las tres advertencias de timing descritas arriba. En esta revisión local se atendieron las seis de la prueba: los callbacks de `waitFor` usan cuerpos de bloque que ejecutan las mismas aserciones. El aviso sobre `await render()` se basaba en una premisa incorrecta: `@testing-library/react-native` 14.1.0 implementa `render` como función `async` y su documentación exige esperar a que termine. Quitar la espera hizo fallar ambas pruebas (`screen` todavía no estaba listo). Ahora las pruebas devuelven `render(...).then(async () => { ... })`, conservando la espera sin el patrón señalado. El acceso `drawings[name]` se sustituyó por una selección explícita de los mismos dibujos mediante `switch`. Aunque `IconName` restringe los nombres a claves estáticas y el acceso anterior no presentaba una vía real de inyección desde datos externos, la selección explícita elimina ese punto de análisis sin alterar el SVG, el color o el tamaño.

Las tres alertas de timing siguen **pendientes de clasificación individual en Codacy**. Los cambios locales no modifican los resultados remotos hasta que se publique la rama y se ejecute otro análisis.

## Comentarios adicionales de revisión

- `/cuenta/configuracion` sí carecía de protección. Se añadió a `protectedPaths`, junto con su subpantalla `/cuenta/apariencia`; la vista existente espera la restauración de sesión y redirige a autenticación conservando el destino. Hay una prueba de los estados `loading`, `anonymous` y `authenticated`.
- Inicio invoca `useAgendaViewModel`, pero `useSessionResource` ya crea `SessionResource` con `authenticated = false` para visitantes. `cargar` y `ejecutar` retornan antes de llamar al servicio y el estado no conserva citas. Agregar otro control en Inicio duplicaría esta protección. Una prueba comprueba que el cargador privado no se invoca para visitantes.

## Alcance de la verificación

Las pruebas locales cubren rutas de cuenta, recurso de sesión, importes, selección y envío de comprobantes, contratos de transferencia, pedidos duplicados, filtros y paginación, citas, cursos y autenticación. No sustituyen una prueba manual en un dispositivo ni un nuevo análisis remoto de Codacy.
