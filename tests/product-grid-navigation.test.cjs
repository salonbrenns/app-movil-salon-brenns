const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const React = require('react');

const { getProductGridLayout } = require('@/modules/productos/viewmodels/product-grid');

test('product cards fit two per row at phone widths and fall back only when needed', () => {
  for (const width of [272, 312, 352]) {
    const { columns, cardWidth } = getProductGridLayout(width, 8);
    assert.equal(columns, 2);
    assert.equal(cardWidth * 2 + 8, width);
    assert.ok(cardWidth >= 132);
  }
  assert.deepEqual(getProductGridLayout(271, 8), { columns: 1, cardWidth: 271 });
});

let canGoBack = true;
let backCalls = 0;
let replacement;
let hardwareBack;
const router = {
  canGoBack: () => canGoBack,
  back: () => { backCalls += 1; },
  replace: (href) => { replacement = href; },
};
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === 'expo-router') return { router, useFocusEffect: (effect) => effect() };
  if (request === 'react') return { ...React, useCallback: (callback) => callback, useState: (initial) => [initial, () => {}] };
  if (request === 'react-native') return {
    BackHandler: { addEventListener: (_, callback) => { hardwareBack = callback; return { remove() {} }; } },
    StyleSheet: { create: (styles) => styles },
    View: 'View',
  };
  if (request === '@/components/themed-text') return { ThemedText: 'ThemedText' };
  if (request === './brand-logo') return { BrandLogo: 'BrandLogo' };
  if (request === '@/components/ui/icon') return { Icon: 'Icon' };
  if (request === '@/components/ui/touchable') return { Touchable: 'Touchable' };
  if (request === '@/theme') return { Sizes: { touchMinWidth: 44, controlMinHeight: 48 }, Spacing: { one: 4, two: 8, five: 32 } };
  return originalLoad.call(this, request, ...args);
};
const { AppHeader } = require('@/components/layout/app-header');
const { usePaginationViewModel } = require('@/shared/viewmodels/use-pagination-view-model');
Module._load = originalLoad;

function findBackButton(element) {
  if (!element || typeof element !== 'object') return null;
  if (element.props?.accessibilityLabel === 'Regresar') return element;
  return React.Children.toArray(element.props?.children).map(findBackButton).find(Boolean) ?? null;
}

test('the header arrow follows stack history and safely handles a direct cart entry', () => {
  canGoBack = true; backCalls = 0; replacement = undefined;
  const button = findBackButton(AppHeader({ title: 'Mi carrito', backHref: '/' }));
  assert.ok(button);
  button.props.onPress();
  assert.equal(backCalls, 1);
  assert.equal(replacement, undefined);
  assert.equal(hardwareBack(), false);

  canGoBack = false;
  button.props.onPress();
  assert.equal(replacement, '/');
  replacement = undefined;
  assert.equal(hardwareBack(), true);
  assert.equal(replacement, '/');
});

test('an expanded inline detail closes before leaving its screen', () => {
  canGoBack = true; backCalls = 0; replacement = undefined;
  let closed = 0;
  const button = findBackButton(AppHeader({ title: 'Mis compras', backHref: '/perfil', onBack: () => { closed += 1; return true; } }));
  button.props.onPress();
  assert.equal(closed, 1);
  assert.equal(backCalls, 0);
  assert.equal(hardwareBack(), true);
  assert.equal(closed, 2);
  assert.equal(replacement, undefined);
});

test('product pagination still exposes ten API items per page', () => {
  const products = Array.from({ length: 23 }, (_, index) => ({ id: index + 1 }));
  const result = usePaginationViewModel(products, 'products');
  assert.equal(result.items.length, 10);
  assert.equal(result.totalPages, 3);
  assert.equal(result.items[0], products[0]);
  assert.equal(result.items[9], products[9]);
});
