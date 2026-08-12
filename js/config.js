// ===================================================================
// CONFIG.JS - ConfiguraciÃ³n global y constantes
// ===================================================================

// Supabase Configuration
// ANTES DE USAR â€” reemplaza con los datos de tu proyecto:
// Supabase Dashboard > Project Settings > API
const SUPABASE_URL = 'https://pebrjdqvvexoefvytoex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HVzRa4gsMNcv1jbpNrof7w_pTU6t7PS';

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

// Hojas Google: mapeo de mÃ³dulos -> spreadsheet IDs
const SHEET_URLS = {
    novedades: 'https://docs.google.com/spreadsheets/d/1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw/edit#gid=0',
    horario: 'https://docs.google.com/spreadsheets/d/1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw/edit#gid=0',
    informe: 'https://docs.google.com/spreadsheets/d/1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw/edit#gid=0',
};

// Spreadsheet IDs para lectura vÃ­a API
const SPREADSHEET_IDS = {
    novedades: '1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw',
    horario: '1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw',
    informe: '1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw',
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
