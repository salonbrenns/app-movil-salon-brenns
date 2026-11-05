# Seguimiento de las 25 anotaciones de Codacy, PR #9

Análisis remoto del commit `2ff671a54d0c2b46a6321fc5cafc9cfb40f977eb`: 25 anotaciones nuevas; el check **Codacy Static Code Analysis** sigue en `action_required`. Este documento no cambia el análisis remoto ni las reglas de calidad.

## Evidencia de versiones y tipos

- `package.json` y `package-lock.json` instalan `@testing-library/react-native` 14.1.0.
- `node_modules/@testing-library/react-native/docs/guides/migration-v14.md` explica que `render`, `renderHook`, `rerender`, `fireEvent` y `act` son asíncronas en v14.
- Los tipos instalados en `dist/render.d.ts`, `dist/render-hook.d.ts`, `dist/events/fire-event.d.ts`, `dist/act.d.ts` y `dist/user-event/index.d.ts` declaran explícitamente retornos `Promise`, también para `userEvent.press`. El valor resuelto puede ser `void` o `undefined`, pero la llamada sigue devolviendo una promesa. Quitar `await` permitiría que las aserciones se ejecuten antes de terminar las actualizaciones de React.
- `npm run typecheck` comprueba los tipos, pero no ejecuta reglas de ESLint. La configuración local `eslint.config.js` usa `eslint-config-expo/flat`; `eslint --print-config` no incluye `@typescript-eslint/await-thenable`, `@typescript-eslint/no-confusing-void-expression` ni `@typescript-eslint/no-unnecessary-condition` para estas pruebas. Por eso pasar el lint local no equivale a reproducir la configuración de Codacy.
- La API pública de Codacy confirmó que el motor **ESLint** (`f8b29663-2cb2-498d-b923-a10c6a8c05cd`) está activo con el **Default coding standard** (`171588`), `followsStandard: true` y `usesConfigurationFile: false`. El motor **ESLint9** (`2a30ab97-477f-4769-8b88-af596ce7a94c`) está desactivado, aunque reconoce un archivo de configuración. Por tanto, el análisis remoto no usa el `eslint.config.js` local.
- La búsqueda pública de issues confirmó los patrones exactos: `ESLint8_@typescript-eslint_await-thenable`, `ESLint8_@typescript-eslint_no-confusing-void-expression`, `ESLint8_@typescript-eslint_no-unnecessary-condition` y `ESLint8_xss_no-mixed-html`. La consulta de configuración detallada de patrones respondió `401 Unauthorized`; se necesita acceso a Codacy para gestionarlos.
- Una reproducción local temporal, con el parser y plugin `@typescript-eslint` instalados, `parserOptions.project` apuntando a `tsconfig.json` y las tres reglas tipadas activas, produjo **cero avisos** en los seis archivos de pruebas señalados. El mismo análisis sí señaló varias guardas de `session-resource.ts` como condiciones constantes, lo que confirma que esa regla no sigue necesariamente las mutaciones entre esperas asíncronas. No se modificó la configuración del repositorio para esta comprobación.

## Anotaciones que necesitan clasificación individual

| Archivo y líneas del análisis | Cantidad | Motivo |
| --- | ---: | --- |
| `__tests__/autenticacion-view.test.tsx`: 27, 38 (2) | 3 | `render` y `rerender` devuelven `Promise`. |
| `__tests__/datos-transferencia-ticket.test.tsx`: 11 | 1 | `render` devuelve `Promise`. |
| `__tests__/inicio-view.test.tsx`: 58, 61 (2) | 3 | `render` y `userEvent.press` devuelven `Promise`. |
| `__tests__/pagination-view-model.test.tsx`: 10, 36, 48 (2) | 4 | `renderHook` y `rerender` devuelven `Promise`. Los callbacks de `act` ya tienen cuerpo de bloque. |
| `__tests__/seguridad-cambio.test.tsx`: 17 (2), 18 (2), 19 (2), 21 (2), 31, 68 (2) | 11 | `fireEvent` y `render` devuelven `Promise`; esperar sus efectos es necesario para probar validaciones y estados. |
| `__tests__/seguridad-visibilidad.test.tsx`: 9 | 1 | `render` devuelve `Promise`. |

La anotación `ESLint8_xss_no-mixed-html` de `__tests__/user-error.test.ts:26` **persistió tras renombrar** el helper: ahora dice “HTML passed in to function 'createHttpErrorFixture'” (issue `82b6f558da5efcd447de577729fdb8ed`). El helper solo construye un `HttpError` ficticio; no envía HTML por HTTP. La prueba conserva el HTML técnico como cuerpo de error y comprueba que el mensaje para el usuario no lo contiene. `userError` acepta un cuerpo de backend solo cuando es un objeto con campo `error`; este cuerpo HTML es una cadena y termina en un mensaje fijo. El componente de feedback lo muestra como texto de React Native, sin interpretar HTML. Es un falso positivo de **esa instancia** de la regla de seguridad.

La anotación `ESLint8_@typescript-eslint_no-unnecessary-condition` de `src/shared/viewmodels/session-resource.ts:51` (issue `6a7b66997db0cd9124b0084cca8876a8`) indica que `this.active` siempre es verdadero. No lo es necesariamente después de `await this.cargar()`: `cancel()` puede ejecutarse durante esa espera, poner `active` en `false` e incrementar `lifetime`. Aunque después se llame `activate()`, la diferencia de `lifetime` invalida la operación anterior. Las guardas en `catch` y `finally` impiden publicar un error o cambiar `ocupado` tras cancelar. Se conservan. La regla documenta limitaciones con valores modificados durante llamadas a funciones; esta instancia es un falso positivo.

## Gestión en Codacy

1. Con acceso a Codacy, abrir **PR #9 → Issues → New** y verificar que cada tarjeta corresponde al SHA analizado y a los cuatro patrones identificados arriba. Comprobar la versión y resolución de dependencias del motor ESLint8; el motor activo sigue el estándar de Codacy y no lee `eslint.config.js`.
2. Para las 23 anotaciones de Testing Library, usar el menú de **cada issue** → **Ignore issue** → motivo **False positive**, con comentario que identifique la operación y su declaración `Promise` en 14.1.0. Aplicar esto únicamente a las instancias de las líneas de la tabla; no desactivar el patrón, el archivo, las pruebas ni el Quality Gate.
3. Clasificar la instancia de `ESLint8_xss_no-mixed-html` en `user-error.test.ts:26` como **False positive**: el HTML es una entrada hostil de prueba, el helper solo construye el error y la prueba verifica que no aparece en el mensaje mostrado.
4. Clasificar la instancia de `ESLint8_@typescript-eslint_no-unnecessary-condition` en `session-resource.ts:51` como **False positive**: `cancel()` modifica `active` y `lifetime` mientras `cargar()` está pendiente. Conservar las guardas.
5. El administrador puede evaluar el motor ESLint9 con el `eslint.config.js` del repositorio y comparar cobertura y resultados antes de cualquier cambio de configuración remota; no sustituir el estándar ni desactivar reglas solo para silenciar estas anotaciones.
6. Tras publicar un commit revisado en el PR, comprobar el conteo y el estado de **Codacy Static Code Analysis** del nuevo SHA. Reanalizar el PR desde Codacy si el resultado no se actualiza; reanalizar el SHA anterior no incorporará cambios locales. Este documento permanece sin publicar porque la tarea prohíbe commit y push.

Referencias: documentación oficial de Codacy sobre [detalles de issues y clasificación individual](https://docs.codacy.com/repositories/issues/) y [análisis de PR](https://docs.codacy.com/repositories/pull-requests/); documentación de `typescript-eslint` sobre [await-thenable](https://typescript-eslint.io/rules/await-thenable/), [no-confusing-void-expression](https://typescript-eslint.io/rules/no-confusing-void-expression/) y [limitaciones de no-unnecessary-condition](https://typescript-eslint.io/rules/no-unnecessary-condition/#limitations).
