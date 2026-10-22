const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const load = Module._load;
let status = 'loading', seccion = 'cerrar-sesion';
Module._load = function(request,...args) {
 if (request === 'expo-router') return { Redirect: 'Redirect', useLocalSearchParams: () => ({seccion}) };
 if (request === '@/components/ui/screen') return { Screen: 'Screen' };
 if (request === '@/components/feedback/async-states') return { LoadingState: 'LoadingState' };
 if (request === '@/modules/auth/viewmodels/auth-session-provider') return { useAuthSession: () => ({status}) };
 if (request === '@/modules/auth/views/autenticacion-seccion-view') return { AutenticacionSeccionView: 'AuthSection' };
 if (request === '@/modules/cursos/views/mis-cursos-view') return { MisCursosView: 'MisCursos' };
 if (request === '@/modules/favoritos/views/favoritos-view') return { FavoritosView: 'Favoritos' };
 if (request === './cuenta-informacion-view') return { CuentaInformacionView: 'CuentaInformacion' };
 if (request === '@/modules/auth/views/recuperacion-view') return { RecuperacionView: 'Recuperacion' };
 if (request === '@/modules/ventas/views/compras-view') return { ComprasView: 'Compras' };
 if (request === '@/modules/perfil/views/editar-perfil-view') return { EditarPerfilView: 'EditarPerfil' };
 if (request === '@/modules/perfil/views/seguridad-view') return { SeguridadView: 'Seguridad' };
 return load.call(this,request,...args);
};
const CuentaView = require('@/modules/cuenta/views/cuenta-view').default;
Module._load = load;
test('private account content waits for restoration and redirects only within its mounted route', () => {
 status = 'loading'; let result = CuentaView(); assert.equal(result.type,'Screen'); assert.equal(result.props.children.type,'LoadingState');
 status = 'anonymous'; result = CuentaView(); assert.equal(result.type,'Redirect'); assert.equal(result.props.href.pathname,'/autenticacion'); assert.equal(result.props.href.params.returnTo,'/cuenta/cerrar-sesion');
 status = 'authenticated'; result = CuentaView(); assert.equal(result.type,'Screen'); assert.equal(result.props.children.props.destino.seccion,'cerrar-sesion');
});
test('unknown account sections remain neutral instead of exposing protected content', () => {
 seccion = 'desconocida'; status = 'anonymous'; const result=CuentaView(); assert.equal(result.type,'Screen'); assert.equal(result.props.children.props.destino.modulo,'vacia');
});

test('Mis cursos requires a confirmed session before rendering its account section', () => {
 seccion = 'cursos'; status = 'loading'; let result=CuentaView(); assert.equal(result.props.children.type,'LoadingState');
 status = 'anonymous'; result=CuentaView(); assert.equal(result.type,'Redirect'); assert.equal(result.props.href.params.returnTo,'/cuenta/cursos');
 status = 'authenticated'; result=CuentaView(); assert.equal(result.type,'Screen'); assert.equal(result.props.children.props.destino.modulo,'cursos');
 assert.equal(result.props.backHref, '/perfil');
});
