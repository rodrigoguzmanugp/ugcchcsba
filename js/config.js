// ===================================================================
// CONFIG.JS - ConfiguraciÃ³n global y constantes
// ===================================================================

// Supabase Configuration
// ANTES DE USAR â€” reemplaza con los datos de tu proyecto:
// Supabase Dashboard > Project Settings > API
const SUPABASE_URL = 'https://swfruqbdiaolqiyhtjvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W6ijOURYxrbCYu1s1pkyZw_GPf6pQHD';

// Inicializar cliente Supabase
// (El SDK se carga desde CDN en el <head>)
const supabaseClient = (SUPABASE_URL.includes('TU-PROYECTO'))
    ? null
    : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin email para aprobaciÃ³n de cuentas
const ADMIN_EMAIL = 'rodrigoguzman.ugp@gmail.com';

// Dominio para cuentas legacy (sin Gmail real)
const LEGACY_EMAIL_DOMAIN = '@gestorcamas.local';

// Estado global de sesiÃ³n
let sesionActiva = null;

// Hojas Google: mapeo de módulos -> spreadsheet IDs
const SHEET_URLS = {
    'novedades-adulto': 'https://docs.google.com/spreadsheets/d/1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM/edit#gid=720250164',
    'novedades-pediatricas': 'https://docs.google.com/spreadsheets/d/1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM/edit#gid=586493277',
    'casos-huap': 'https://docs.google.com/spreadsheets/d/1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w/edit#gid=122616479',
    'casos-hec': 'https://docs.google.com/spreadsheets/d/1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w/edit#gid=1635650262',
    'solicitudes-cdt': 'https://docs.google.com/spreadsheets/d/1B8AK-RoH2zuVpZkvPvd6MlofX361YFkC8bNhEDXEXDg/edit',
};

// Spreadsheet IDs para lectura vía API
const SPREADSHEET_IDS = {
    'novedades-adulto': '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM',
    'novedades-pediatricas': '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM',
    'casos-huap': '1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w',
    'casos-hec': '1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w',
    'solicitudes-cdt': '1B8AK-RoH2zuVpZkvPvd6MlofX361YFkC8bNhEDXEXDg',
};

// GID (sheet IDs) para acceso directo
const SHEET_GIDS = {
    'novedades-adulto': '720250164',
    'novedades-pediatricas': '586493277',
    'casos-huap': '122616479',
    'casos-hec': '1635650262',
};

// Configurar listener de autenticaciÃ³n
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        // Capturar token de Google para lectura de Sheets
        if (session?.provider_token) {
            guardarTokenGoogle(session.provider_token, session.expires_in);
        }
        // Actualizar email en interfaz cuando Google se conecte
        if (session?.user && sesionActiva) {
            const correo = extraerCorreoParaMostrar(session.user);
            if (correo && correo !== sesionActiva.email) {
                sesionActiva.email = correo;
                aplicarSesionEnInterfaz(sesionActiva);
            }
        }
    });
}
