const assert = require('node:assert/strict');
const Module = require('node:module');
const { test } = require('node:test');

test('a confirmed order cannot be submitted again before React renders the updated screen', async () => {
  let requests = 0;
  const originalLoad = Module._load;
  Module._load = function (request, ...args) {
    if (request === 'react') return {
      useCallback: (callback) => callback,
      useRef: (value) => ({ current: value }),
      useState: (value) => [value, () => {}],
    };
    if (request === '../services/carrito-service') return { HttpCarritoService: class {} };
    if (request === '@/modules/ventas/services/ventas-service') return { HttpVentasService: class {
      async crear() { requests++; return { id: '7', total: '100.00' }; }
    } };
    if (request === '@/modules/perfil/viewmodels/use-perfil-view-model') return { usePerfilViewModel: () => ({ perfil: { nombre: 'Persona', correo: 'persona@example.test' } }) };
    if (request === '@/shared/viewmodels/use-session-resource') return { useSessionResource: () => ({
      datos: { items: [{ cantidad: 1, stock: 2 }] },
      ejecutar: async (operation, _message, onConfirmed) => { onConfirmed(await operation()); return true; },
    }) };
    if (request === '@/utils/format-price') return { formatPrice: (value) => value };
    if (request === '@/modules/auth/viewmodels/auth-session-provider') return { useAuthSession: () => ({ sessionRevision: 1 }) };
    if (request === '@/shared/services/comprobante-service') return { HttpComprobanteService: class {} };
    if (request === '@/shared/viewmodels/use-transferencia-view-model') return { useTransferenciaViewModel: () => ({ datos: { banco: { banco: 'Banco', titular: 'Titular', cuenta: '1234567890', clabe: '111111111111111111' } }, error: null }) };
    return originalLoad.call(this, request, ...args);
  };
  let useCarritoViewModel;
  try {
    ({ useCarritoViewModel } = require('@/modules/carrito/viewmodels/use-carrito-view-model'));
  } finally {
    Module._load = originalLoad;
  }

  const vm = useCarritoViewModel();
  assert.equal(await vm.confirmarPedido(), true);
  assert.equal(await vm.confirmarPedido(), false);
  assert.equal(requests, 1);
});
