// ===================================================================
// CONFIG.JS - Configuracion global y constantes
// ===================================================================

const SUPABASE_URL = 'https://swfruqbdiaolqiyhtjvm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W6ijOURYxrbCYu1s1pkyZw_GPf6pQHD';

// IDs de planillas Google Sheets
const NOVEDADES_SPREADSHEET_ID    = '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM';
const INFORME_TURNO_SPREADSHEET_ID = '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM';
const CDT_SPREADSHEET_ID          = '1B8AK-RoH2zuVpZkvPvd6MlofX361YFkC8bNhEDXEXDg';
const HEC_HUAP_SPREADSHEET_ID     = '1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { enabled: false }
});

const ADMIN_EMAIL = 'rodrigoguzman.ugp@gmail.com';
const LEGACY_EMAIL_DOMAIN = '@gestorcamas.local';

let sesionActiva = null;

const SHEET_URLS = {
    'novedades': 'https://docs.google.com/spreadsheets/d/1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM/edit#gid=720250164',
    'inhabil':   'https://docs.google.com/spreadsheets/d/1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM/edit#gid=586493277',
    'informe':   'https://docs.google.com/spreadsheets/d/1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM/edit',
    'cdt':       'https://docs.google.com/spreadsheets/d/1B8AK-RoH2zuVpZkvPvd6MlofX361YFkC8bNhEDXEXDg/edit',
    'hec-huap':  'https://docs.google.com/spreadsheets/d/1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w/edit',
    'macrorred': '',
    'ref-adulto':'',
    'ref-pede':  '',
};

const SPREADSHEET_IDS = {
    'novedades': '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM',
    'inhabil':   '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM',
    'informe':   '1hDtmpPngKJhQ_8Tw6E53vTjiiB-4KUGBWdosvfelisM',
    'cdt':       '1B8AK-RoH2zuVpZkvPvd6MlofX361YFkC8bNhEDXEXDg',
    'hec-huap':  '1t7dF3yBXQ8t0upriCQ5vnmrKouWgu2bza47QQmOGR2w',
};

const SHEET_GIDS = {
    'novedades-adulto':     '720250164',
    'novedades-pediatricas':'586493277',
    'casos-huap':           '122616479',
    'casos-hec':            '1635650262',
};

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session?.provider_token) {
            guardarTokenGoogle(session.provider_token, session.expires_in || 3600);
        }
        if (session?.user && sesionActiva) {
            const correo = extraerCorreoParaMostrar(session.user);
            if (correo && correo !== sesionActiva.email) {
                sesionActiva.email = correo;
                aplicarSesionEnInterfaz(sesionActiva);
            }
        }
    });
}
