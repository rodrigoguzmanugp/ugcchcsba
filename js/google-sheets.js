// ===================================================================
// GOOGLE-SHEETS.JS - Integracion con Google Sheets API
// ===================================================================

function guardarTokenGoogle(token, expiresIn) {
    const expira = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem('google_token', token);
    sessionStorage.setItem('google_token_expires', String(expira));
}

function obtenerTokenGoogleVigente() {
    const token   = sessionStorage.getItem('google_token');
    const expires = sessionStorage.getItem('google_token_expires');
    if (!token || !expires) return null;
    if (Date.now() > parseInt(expires)) {
        sessionStorage.removeItem('google_token');
        sessionStorage.removeItem('google_token_expires');
        return null;
    }
    return token;
}

function actualizarBotonGoogle() {
    const boton = document.getElementById('btn-conectar-google');
    if (!boton) return;
    const token = obtenerTokenGoogleVigente();
    if (token) {
        boton.innerHTML = '<i class="fa-brands fa-google text-green-600 mr-2"></i> Google Conectado ✓';
        boton.classList.add('opacity-50', 'cursor-not-allowed');
        boton.disabled = true;
    } else {
        boton.innerHTML = '<i class="fa-brands fa-google mr-2"></i> Conectar Google';
        boton.classList.remove('opacity-50', 'cursor-not-allowed');
        boton.disabled = false;
    }
}

async function conectarGoogle() {
    if (!supabaseClient) { alert('Supabase no configurado.'); return; }
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly' }
    });
    if (error) {
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
            alert('El proveedor Google no está activado en Supabase.\n\nVe a: Supabase Dashboard → Authentication → Providers → Google y actívalo.\n\nSi tus planillas son públicas ("Cualquiera con el enlace puede ver"), no necesitas conectar Google.');
        } else {
            alert(`Error al conectar Google: ${error.message}`);
        }
    }
}

async function leerConAPIOficial(spreadsheetId, sheetName, rango) {
    const token = obtenerTokenGoogleVigente();
    if (!token) return null;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!${rango}`;
    try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return null;
        const json = await res.json();
        return json.values || [];
    } catch (e) {
        console.error('Error API Sheets:', e);
        return null;
    }
}

function formatearValorCelda(valor) {
    if (typeof valor === 'string') {
        const m = valor.match(/^Date\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (m) {
            const [, anio, mesIdx, dia] = m;
            return `${String(Number(dia)).padStart(2,'0')}-${String(Number(mesIdx)+1).padStart(2,'0')}-${anio}`;
        }
    }
    return valor ?? '';
}

async function leerRangoGvizDe(spreadsheetId, sheetName, rango) {
    const oficial = await leerConAPIOficial(spreadsheetId, sheetName, rango);
    if (oficial) return oficial;
    if (!spreadsheetId || !sheetName || !rango) return [];
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq`
              + `?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&range=${rango}`;
    try {
        const res  = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
        if (!json.table || !json.table.rows) return [];
        return json.table.rows.map(r => (r.c || []).map(cell => formatearValorCelda(cell ? (cell.v ?? cell.f ?? '') : '')));
    } catch (e) {
        console.error('Error Gviz:', e);
        return [];
    }
}

async function leerRangoGviz(sheetName, rango) {
    return leerRangoGvizDe(NOVEDADES_SPREADSHEET_ID, sheetName, rango);
}

async function leerRangoGvizInforme(sheetName, rango) {
    return leerRangoGvizDe(INFORME_TURNO_SPREADSHEET_ID, sheetName, rango);
}

async function leerCeldaGviz(sheetIdKey, cellRef) {
    const filas = await leerRangoGviz(sheetIdKey, cellRef);
    return filas?.[0]?.[0] || '';
}

async function leerSumaCeldas(sheetIdKey, cellRefs) {
    let suma = 0;
    for (const ref of cellRefs) {
        const valor = await leerCeldaGviz(sheetIdKey, ref);
        suma += parseInt(valor) || 0;
    }
    return suma;
}

async function manejarErrorReconexionGoogle() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
        console.warn('Error OAuth Google:', params.get('error_description'));
        return false;
    }
    return false;
}
