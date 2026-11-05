const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

test('splash muestra el logotipo proporcionado sin cambiar el icono de instalación', () => {
  const root = path.resolve(__dirname, '..');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
  const splash = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen')[1];
  assert.equal(splash.image, './assets/images/brenns-splash-logo.png');
  assert.equal(splash.backgroundColor, '#FFFFFF');
  assert.equal(splash.imageWidth, 200);
  assert.equal(splash.resizeMode, 'contain');
  assert.equal(fs.existsSync(path.join(root, splash.image)), true);
  assert.equal(config.icon, './assets/images/brenns-app-icon.png');
  assert.equal(config.android.adaptiveIcon.foregroundImage, './assets/images/brenns-adaptive-icon.png');
});
