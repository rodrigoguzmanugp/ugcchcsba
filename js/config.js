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
const MACRORRED_SPREADSHEET_ID    = '1tdSnpGEWX4I3_yJ353NFFtRWuCTwVGEwGCAgDVFVUrA';

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
    'macrorred': 'https://docs.google.com/spreadsheets/d/1tdSnpGEWX4I3_yJ353NFFtRWuCTwVGEwGCAgDVFVUrA/edit',
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

// ---------------------------------------------------------------
// Configuracion de celdas: valores por defecto + cache de overrides
// ---------------------------------------------------------------
const CONFIG_CELDAS_DEFAULT = {
    // Informe de Turno: UCI/UTI Adulto
    'informe_uci_adulto_total':      { valor: 'D49', grupo: 'Informe de Turno · UCI Adulto',  etiqueta: 'Celda Total (Dotación)' },
    'informe_uci_adulto_ocupadas':   { valor: 'D50', grupo: 'Informe de Turno · UCI Adulto',  etiqueta: 'Celda Ocupadas' },
    'informe_uci_adulto_reservadas': { valor: 'E18,E19,E26', grupo: 'Informe de Turno · UCI Adulto', etiqueta: 'Celdas Reservadas (suma, separadas por coma)' },
    'informe_uci_adulto_bloqueadas': { valor: 'Q18,Q19,Q26', grupo: 'Informe de Turno · UCI Adulto', etiqueta: 'Celdas Bloqueadas' },
    'informe_uti_adulto_total':      { valor: 'E49', grupo: 'Informe de Turno · UTI Adulto',  etiqueta: 'Celda Total (Dotación)' },
    'informe_uti_adulto_ocupadas':   { valor: 'E50', grupo: 'Informe de Turno · UTI Adulto',  etiqueta: 'Celda Ocupadas' },
    'informe_uti_adulto_reservadas': { valor: 'E20,E27,E33', grupo: 'Informe de Turno · UTI Adulto', etiqueta: 'Celdas Reservadas' },
    'informe_uti_adulto_bloqueadas': { valor: 'Q20,Q27,Q33', grupo: 'Informe de Turno · UTI Adulto', etiqueta: 'Celdas Bloqueadas' },
    'informe_ucip_pedi_total':       { valor: 'D55', grupo: 'Informe de Turno · UCIP Pediatría', etiqueta: 'Celda Total (Dotación)' },
    'informe_ucip_pedi_ocupadas':    { valor: 'D56', grupo: 'Informe de Turno · UCIP Pediatría', etiqueta: 'Celda Ocupadas' },
    'informe_ucip_pedi_reservadas':  { valor: 'E15', grupo: 'Informe de Turno · UCIP Pediatría', etiqueta: 'Celdas Reservadas' },
    'informe_ucip_pedi_bloqueadas':  { valor: 'Q15', grupo: 'Informe de Turno · UCIP Pediatría', etiqueta: 'Celdas Bloqueadas' },
    'informe_utip_pedi_total':       { valor: 'E55', grupo: 'Informe de Turno · UTIP Pediatría', etiqueta: 'Celda Total (Dotación)' },
    'informe_utip_pedi_ocupadas':    { valor: 'E56', grupo: 'Informe de Turno · UTIP Pediatría', etiqueta: 'Celda Ocupadas' },
    'informe_utip_pedi_reservadas':  { valor: 'E16', grupo: 'Informe de Turno · UTIP Pediatría', etiqueta: 'Celdas Reservadas' },
    'informe_utip_pedi_bloqueadas':  { valor: 'Q16', grupo: 'Informe de Turno · UTIP Pediatría', etiqueta: 'Celdas Bloqueadas' },
    // Novedades: Solicitudes de Salida / Futuros Pabellones
    'novedades_adulto_hoja':         { valor: 'NOVEDADES ADULTO',      grupo: 'Novedades · Adulto',     etiqueta: 'Nombre de la pestaña' },
    'novedades_adulto_solicitudes':  { valor: 'A43:F48',               grupo: 'Novedades · Adulto',     etiqueta: 'Rango: Solicitudes de Cama de Salida / Respaldo' },
    'novedades_adulto_pabellones':   { valor: 'A50:F54',               grupo: 'Novedades · Adulto',     etiqueta: 'Rango: Futuros Pabellones' },
    'novedades_adulto_residentes':   { valor: 'A13:L19',               grupo: 'Novedades · Adulto',     etiqueta: 'Rango: Residentes en Turno' },
    'novedades_pedi_hoja':           { valor: 'NOVEDADES PEDIATRICAS', grupo: 'Novedades · Pediatría',  etiqueta: 'Nombre de la pestaña' },
    'novedades_pedi_ucip':           { valor: 'A53:G57',               grupo: 'Novedades · Pediatría',  etiqueta: 'Rango: Salidas Camas UCIP' },
    'novedades_pedi_utip':           { valor: 'A67:G71',               grupo: 'Novedades · Pediatría',  etiqueta: 'Rango: Salidas Camas UTIP' },
    'novedades_pedi_residentes':     { valor: 'A11:L19',               grupo: 'Novedades · Pediatría',  etiqueta: 'Rango: Residentes en Turno' },
    // Pabellón
    'pabellon_gid':                  { valor: '947824045', grupo: 'Pabellón', etiqueta: 'gid de la pestaña PABELLON/TRASLADOS' },
    // Emergencia
    'emergencia_total_atendidos':        { valor: 'S55', grupo: 'Emergencia Hospitalaria', etiqueta: 'N° Total Pacientes Atendidos (SEH)' },
    'emergencia_total_hospitalizados':   { valor: 'S56', grupo: 'Emergencia Hospitalaria', etiqueta: 'N° Total Pacientes Hospitalizados (SEH)' },
    'emergencia_consulta_respiratoria':  { valor: 'S57', grupo: 'Emergencia Hospitalaria', etiqueta: 'N° Total Consulta Respiratoria (SEH)' },
    'urgencia_gineco_atendidos':         { valor: 'S60', grupo: 'Emergencia Hospitalaria', etiqueta: 'N° Total Atendidos (Urgencia Gineco-Obstétrica)' },
    'urgencia_gineco_hospitalizados':    { valor: 'S61', grupo: 'Emergencia Hospitalaria', etiqueta: 'N° Total Hospitalizados (Urgencia Gineco-Obstétrica)' },
    // % Ocupación
    'pct_ocupacion_adulto': { valor: 'K54', grupo: '% Ocupación Total', etiqueta: 'Celda % Ocupación Total Adultos' },
    'pct_ocupacion_pedi':   { valor: 'N70', grupo: '% Ocupación Total', etiqueta: 'Celda % Ocupación Total Pediatría' },
    // HEC y HUAP
    'hec_huap_hec_hoja':   { valor: 'HEC - JULIO 2026',  grupo: 'HEC y HUAP', etiqueta: 'Nombre pestaña HEC (actualizar cada mes)' },
    'hec_huap_huap_hoja':  { valor: 'HUAP - JULIO 2026', grupo: 'HEC y HUAP', etiqueta: 'Nombre pestaña HUAP (actualizar cada mes)' },
    'hec_huap_rango':      { valor: 'A1:G148',           grupo: 'HEC y HUAP', etiqueta: 'Rango de datos (filas)' },
    // CDT
    'cdt_hoja':   { valor: 'ORDENES', grupo: 'CDT', etiqueta: 'Nombre pestaña órdenes' },
    'cdt_rango':  { valor: 'A1:Z200', grupo: 'CDT', etiqueta: 'Rango de datos' },
    // Macrorred
    'macrorred_hoja':         { valor: 'OTROS PÚBLICOS Y MACRORED 08/26', grupo: 'Macrorred', etiqueta: 'Pestaña principal (actualizar cada mes)' },
    'macrorred_hoja_ugcc':    { valor: 'HCSBA A UGCC/SALUD MENTAL 08/26', grupo: 'Macrorred', etiqueta: 'Pestaña UGCC/Salud Mental' },
    'macrorred_hoja_urgencia':{ valor: 'LEY DE URGENCIAS Y MLE 07/26',    grupo: 'Macrorred', etiqueta: 'Pestaña Ley Urgencias y MLE' },
    'macrorred_rango':        { valor: 'A1:S50',                          grupo: 'Macrorred', etiqueta: 'Rango de datos' },
};

// Auto-genera entradas por bloque de matriz de informe
const BLOQUES_MATRIZ_INFORME = [
    { grupoId: 'adulto_camas', label: 'Adulto · Camas por Tipo', tipos: [
        { id: 'uci', nombre: 'UCI', celda: 'D49' }, { id: 'uti', nombre: 'UTI', celda: 'E49' },
        { id: 'medias', nombre: 'MEDIAS', celda: 'F49' }, { id: 'basicas', nombre: 'BÁSICAS', celda: 'G49' }] },
    { grupoId: 'adulto_qx', label: 'Adulto · Altas Encuesta Área Adulto', tipos: [
        { id: 'qx', nombre: 'Bloque Qx', celda: 'I49' }, { id: 'medico', nombre: 'Bloque Médico', celda: 'L49' },
        { id: 'uci', nombre: 'UCI', celda: 'O49' }, { id: 'uti', nombre: 'UTI', celda: 'R49' }] },
    { grupoId: 'pedi_camas', label: 'Pediatría · Camas por Tipo', tipos: [
        { id: 'ucip', nombre: 'UCIP', celda: 'D55' }, { id: 'utip', nombre: 'UTIP', celda: 'E55' },
        { id: 'medias', nombre: 'MEDIAS PED', celda: 'F55' }, { id: 'basicas', nombre: 'BÁSICAS PED', celda: 'G55' }] },
    { grupoId: 'pedi_qx', label: 'Pediatría · Altas Encuesta Área Pediátrica', tipos: [
        { id: 'qx', nombre: 'Bloque Qx', celda: 'K65' }, { id: 'medico', nombre: 'Bloque Médico', celda: 'M65' },
        { id: 'ucip', nombre: 'UCIP', celda: 'O65' }, { id: 'utip', nombre: 'UTIP', celda: 'Q65' }] },
    { grupoId: 'neo_camas', label: 'Neonatología · Camas por Tipo', tipos: [
        { id: 'uci', nombre: 'UCI-NEO', celda: 'D66' }, { id: 'uti', nombre: 'UTI-NEO', celda: 'E66' },
        { id: 'medias', nombre: 'MEDIAS-NEO', celda: 'F66' }, { id: 'basicas', nombre: 'BÁSICAS-NEO', celda: 'G66' }] },
];
BLOQUES_MATRIZ_INFORME.forEach(b => b.tipos.forEach(t => {
    CONFIG_CELDAS_DEFAULT[`informe_${b.grupoId}_${t.id}_celda`]  = { valor: t.celda,  grupo: b.label, etiqueta: `${t.nombre} · Celda inicial` };
    CONFIG_CELDAS_DEFAULT[`informe_${b.grupoId}_${t.id}_nombre`] = { valor: t.nombre, grupo: b.label, etiqueta: `${t.nombre} · Nombre a mostrar` };
}));

let configCeldasCache = {};

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
