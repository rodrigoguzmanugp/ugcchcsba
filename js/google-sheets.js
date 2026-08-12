// ===================================================================
// GOOGLE-SHEETS.JS - IntegraciÃ³n con Google Sheets API
// ===================================================================

function guardarTokenGoogle(token, expiresIn) {
    const expiraciÃ³n = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem('google_token', token);
    sessionStorage.setItem('google_token_expires', expiraciÃ³n);
}

function obtenerTokenGoogleVigente() {
    const token = sessionStorage.getItem('google_token');
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
        boton.innerHTML = '<i class="fa-brands fa-google text-green-600 mr-2"></i> Google Conectado âœ“';
        boton.classList.add('opacity-50', 'cursor-not-allowed');
        boton.disabled = true;
    } else {
        boton.innerHTML = '<i class="fa-brands fa-google mr-2"></i> Conectar Google';
        boton.classList.remove('opacity-50', 'cursor-not-allowed');
        boton.disabled = false;
    }
}

async function conectarGoogle() {
    if (!supabaseClient) {
        alert('Supabase no estÃ¡ configurado.');
        return;
    }
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        }
    });
    if (error) {
        alert(`Error: ${error.message}`);
    }
}

async function leerConAPIOficial(spreadsheetId, sheetName, rango) {
    const token = obtenerTokenGoogleVigente();
    if (!token) {
        console.warn('Token de Google no disponible');
        return null;
    }
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${rango}`;
    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.values || [];
}

async function leerCeldaGviz(sheetName, cellRef) {
    const spreadsheetId = SPREADSHEET_IDS.informe || '';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&range=${sheetName}!${cellRef}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonStr);
        if (json.table && json.table.rows && json.table.rows[0]) {
            return json.table.rows[0].c[0]?.v || '';
        }
        return '';
    } catch (e) {
        console.error(`Error leyendo ${sheetName}!${cellRef}:`, e);
        return '';
    }
}

async function leerSumaCeldas(sheetName, cellRefs) {
    let suma = 0;
    for (const ref of cellRefs) {
        const valor = await leerCeldaGviz(sheetName, ref);
        const num = parseInt(valor) || 0;
        suma += num;
    }
    return suma;
}

async function leerRangoGviz(sheetName, rango) {
    const spreadsheetId = SPREADSHEET_IDS.informe || '';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&range=${sheetName}!${rango}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonStr);
        const filas = [];
        if (json.table && json.table.rows) {
            for (const row of json.table.rows) {
                const fila = row.c.map(cell => cell?.v || '');
                filas.push(fila);
            }
        }
        return filas;
    } catch (e) {
        console.error(`Error leyendo ${sheetName}!${rango}:`, e);
        return [];
    }
}
