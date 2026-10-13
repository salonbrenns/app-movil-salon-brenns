const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const realReact = require('react');
const load = Module._load;
let state = [], cursor = 0;
function useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; }
const theme = { primary: '#ED4087', primarySoft: '#FFE8F2', backgroundElement: '#FFFFFF', border: '#E9E4E7', textSecondary: '#7B7479' };
const themeTokens = { Colors: theme, Spacing: { one: 4, two: 8, three: 16 }, Sizes: { controlMinHeight: 48, touchMinWidth: 44, borderWidth: 1 }, Radius: { control: 12, card: 16 }, ControlStates: { opacity: { pressed: 0.8 } }, IconSizes: { small: 16 }, Typography: { body: {} } };
// A small hook-state harness tests JS ViewModels/JSX decisions, not a native renderer.
Module._load = function(request, ...args) {
  if (request === 'react') return { ...realReact, useState, useCallback: value => value };
  if (request === 'react-native') return { View: 'View', Pressable: 'Pressable', TextInput: 'TextInput', StyleSheet: { create: value => value, flatten: value => value } };
  if (request === 'expo-router') return { Link: 'Link' };
  if (request === 'expo-image') return { Image: 'Image' };
  if (request === '@/hooks/use-theme') return { useTheme: () => theme };
  if (request === '@/components/themed-text') return { ThemedText: 'ThemedText' };
  if (request === '@/components/ui/touchable') return { Touchable: 'Touchable' };
  if (request === '@/components/ui/icon') return { Icon: 'Icon' };
  if (request === '@/theme') return themeTokens;
  return load.call(this, request, ...args);
};
const { MediaPlaceholder } = require('@/components/ui/style-guide');
Module._load = load;
function render(fn) { cursor = 0; return fn(); }

test('shared image shows only Imagen when absent/invalid/failed and resets on URI changes including A → B → A', () => {
  state = []; let previousKey;
  const draw = source => {
    const wrapper = MediaPlaceholder({ source, label: 'Nombre fuera de la imagen' });
    if (wrapper.key !== previousKey) { state = []; previousKey = wrapper.key; }
    return render(() => wrapper.type(wrapper.props)).props.children;
  };
  assert.equal(draw(null).props.children, 'Imagen');
  assert.equal(draw('invalid').props.children, 'Imagen');
  let image = draw('https://example.invalid/a.jpg');
  assert.equal(image.type, 'Image'); image.props.onError();
  assert.equal(draw('https://example.invalid/a.jpg').props.children, 'Imagen');
  assert.equal(draw('https://example.invalid/b.jpg').type, 'Image');
  assert.equal(draw('https://example.invalid/a.jpg').type, 'Image');
});
