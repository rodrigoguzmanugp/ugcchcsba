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
    if (error) alert(`Error: ${error.message}`);
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

async function leerRangoGviz(sheetIdKey, rango) {
    const spreadsheetId = SPREADSHEET_IDS[sheetIdKey] || '';
    if (!spreadsheetId) return [];
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&range=${rango}`;
    try {
        const res  = await fetch(url);
        const text = await res.text();
        const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json    = JSON.parse(jsonStr);
        const filas   = [];
        if (json.table && json.table.rows) {
            for (const row of json.table.rows) {
                const fila = row.c.map(cell => (cell ? String(cell.v ?? cell.f ?? '') : ''));
                filas.push(fila);
            }
        }
        return filas;
    } catch (e) {
        console.error('Error Gviz:', e);
        return [];
    }
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
