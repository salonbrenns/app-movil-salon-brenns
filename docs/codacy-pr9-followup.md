# Seguimiento de las 25 anotaciones de Codacy, PR #9

Análisis remoto del commit `554958f6e9dfd6f24e91590818c9d1badf4b365c`: 25 anotaciones nuevas. Este documento no cambia el análisis remoto ni las reglas de calidad.

## Evidencia de versiones y tipos

- `package.json` y `package-lock.json` instalan `@testing-library/react-native` 14.1.0.
- `node_modules/@testing-library/react-native/docs/guides/migration-v14.md` explica que `render`, `renderHook`, `rerender`, `fireEvent` y `act` son asíncronas en v14.
- Los tipos instalados en `dist/render.d.ts`, `dist/render-hook.d.ts`, `dist/events/fire-event.d.ts` y `dist/act.d.ts` declaran explícitamente retornos `Promise`. El valor resuelto puede ser `void` o `undefined`, pero la llamada sigue devolviendo una promesa. Quitar `await` permitiría que las aserciones se ejecuten antes de terminar las actualizaciones de React.
- `npm run typecheck` comprueba los tipos, pero no ejecuta reglas de ESLint. La configuración local `eslint.config.js` usa `eslint-config-expo/flat`; `eslint --print-config` no incluye `@typescript-eslint/await-thenable`, `@typescript-eslint/no-confusing-void-expression` ni `@typescript-eslint/no-unnecessary-condition` para estas pruebas. Por eso pasar el lint local no equivale a reproducir la configuración de Codacy.
- Los textos de 23 anotaciones coinciden con `@typescript-eslint/await-thenable` y `@typescript-eslint/no-confusing-void-expression`. Es una **identificación por el mensaje**, no una confirmación del identificador del patrón activo: GitHub Checks no entrega herramienta, versión ni patrón en estas anotaciones. La página autenticada de Codacy debe confirmarlos.

## Anotaciones que necesitan clasificación individual

| Archivo y líneas del análisis | Cantidad | Motivo |
| --- | ---: | --- |
| `__tests__/autenticacion-view.test.tsx`: 27, 38 (2) | 3 | `render` y `rerender` devuelven `Promise`. |
| `__tests__/datos-transferencia-ticket.test.tsx`: 11 | 1 | `render` devuelve `Promise`. |
| `__tests__/inicio-view.test.tsx`: 58, 61 (2) | 3 | `render` y `fireEvent` devuelven `Promise`. |
| `__tests__/pagination-view-model.test.tsx`: 10, 36, 48 (2) | 4 | `renderHook` y `rerender` devuelven `Promise`. Los callbacks de `act` ya tienen cuerpo de bloque. |
| `__tests__/seguridad-cambio.test.tsx`: 17 (2), 18 (2), 19 (2), 21 (2), 31, 68 (2) | 11 | `fireEvent` y `render` devuelven `Promise`; esperar sus efectos es necesario para probar validaciones y estados. |
| `__tests__/seguridad-visibilidad.test.tsx`: 9 | 1 | `render` devuelve `Promise`. |

La anotación de `__tests__/user-error.test.ts:26` decía “HTML passed in to function 'http'”. `http` solo construía un `HttpError` ficticio; no enviaba HTML por la red. Se renombró a `createHttpErrorFixture` sin alterar la prueba: el HTML técnico sigue entrando como cuerpo de error y se comprueba que nunca aparece en el mensaje mostrado. Un nuevo análisis dirá si el nombre causaba la asociación incorrecta. Si persiste, corresponde clasificar **esa anotación** como falso positivo.

La anotación de `src/shared/viewmodels/session-resource.ts:51` indica que `this.active` siempre es verdadero. No lo es necesariamente después de `await this.cargar()`: `cancel()` puede ejecutarse durante esa espera, poner `active` en `false` e incrementar `lifetime`. Aunque después se llame `activate()`, la diferencia de `lifetime` invalida la operación anterior. Las guardas en `catch` y `finally` impiden publicar un error o cambiar `ocupado` tras cancelar. Se conservan. La regla `no-unnecessary-condition` tiene una limitación documentada con valores modificados durante llamadas a funciones; si Codacy confirma ese patrón, esta anotación es un falso positivo.

## Gestión en Codacy

1. Tras publicar un commit revisado en este PR, abrir **PR #9 → Issues → New** y esperar el análisis del nuevo SHA. En cada tarjeta, expandir los detalles y registrar **tool**, **code pattern**, origen del patrón y versión del analizador. No se pudo obtener ese metadato mediante GitHub Checks; tampoco hay una configuración `.codacy.yml` en el repositorio.
2. Para las anotaciones de Testing Library que persistan, usar el menú de **cada issue** → **Ignore issue** → motivo **False positive**, con comentario que identifique la operación y la declaración `Promise` de 14.1.0. Aplicar esto únicamente a las líneas de la tabla; no desactivar el patrón, el archivo, las pruebas ni el Quality Gate.
3. Revisar si desaparece la anotación del fixture HTML. Si persiste, clasificar solo esa issue como **False positive** y explicar que prueba el filtrado de una respuesta HTML de error, sin llamada HTTP.
4. Para `session-resource.ts:51`, clasificar solo esa issue como **False positive**, indicando que `cancel()` modifica `active` y `lifetime` mientras `cargar()` está pendiente. Conservar las guardas.
5. Comprobar de nuevo el conteo y el estado de **Codacy Static Code Analysis** del nuevo SHA. Reanalizar el PR desde Codacy si el resultado no se actualiza; reanalizar el SHA anterior no incorporará cambios locales.

Referencias: documentación oficial de Codacy sobre [detalles de issues y clasificación individual](https://docs.codacy.com/repositories/issues/) y [análisis de PR](https://docs.codacy.com/repositories/pull-requests/); documentación de `typescript-eslint` sobre [await-thenable](https://typescript-eslint.io/rules/await-thenable/), [no-confusing-void-expression](https://typescript-eslint.io/rules/no-confusing-void-expression/) y [limitaciones de no-unnecessary-condition](https://typescript-eslint.io/rules/no-unnecessary-condition/#limitations).
