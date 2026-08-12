// ===================================================================
// UI.JS - Funciones de interfaz, impresion, modales y tablas
// ===================================================================

// --- PDF / Impresion ---

function imprimirPlanillaInhabil() {
    if (bloquearSiInvitado('No puedes imprimir en modo Invitado.')) return;
    const element = document.getElementById('planilla-inhabil');
    if (!element) { alert('No se encontro la planilla para imprimir.'); return; }
    if (typeof html2pdf === 'undefined') { window.print(); return; }
    html2pdf().set({
        margin: 10,
        filename: 'Planilla_Inhabil.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }).from(element).save();
}

function imprimirSolicitudPabellon() {
    if (bloquearSiInvitado('No puedes imprimir en modo Invitado.')) return;
    const element = document.getElementById('solicitud-pabellon');
    if (!element) { alert('No se encontro la solicitud para imprimir.'); return; }
    if (typeof html2pdf === 'undefined') { window.print(); return; }
    html2pdf().set({
        margin: 10,
        filename: 'Solicitud_Pabellon.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }).from(element).save();
}

function closePabellonModal() {
    const modal = document.getElementById('solicitud-pabellon-modal') || document.getElementById('modal-pabellon');
    if (modal) modal.classList.add('hidden');
}

function printPabellonDoc() {
    window.print();
}

function downloadPabellonPDF() {
    imprimirSolicitudPabellon();
}

function openInhabilModal() {
    const modal = document.getElementById('modal-inhabil');
    if (modal) modal.classList.remove('hidden');
}

// --- Tablas de datos ---

function pintarTablaSolicitudes(tbodyId, filas, columnas) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const cols = columnas || 6;
    const sinEncabezado = (filas || []).filter(f => f[1] && String(f[1]).trim() !== '' && !pareceEncabezado(f));
    if (sinEncabezado.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${cols}" class="px-3 py-4 text-center text-slate-400">Sin solicitudes registradas.</td></tr>`;
        return;
    }
    if (cols === 7) {
        tbody.innerHTML = sinEncabezado.map(f => `
            <tr class="hover:bg-slate-50">
                <td class="px-3 py-2 whitespace-nowrap text-slate-500">${f[0]??''}</td>
                <td class="px-3 py-2 font-medium text-slate-800">${f[1]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[2]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[3]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[4]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[5]??''}</td>
                <td class="px-3 py-2 text-slate-500">${f[6]??''}</td>
            </tr>`).join('');
    } else {
        tbody.innerHTML = sinEncabezado.map(f => `
            <tr class="hover:bg-slate-50">
                <td class="px-3 py-2 whitespace-nowrap text-slate-500">${f[0]??''}</td>
                <td class="px-3 py-2 font-medium text-slate-800">${f[1]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[2]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[3]??''}</td>
                <td class="px-3 py-2 text-slate-600">${f[4]??''}</td>
                <td class="px-3 py-2"><span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">${f[5]??''}</span></td>
            </tr>`).join('');
    }
}

function pintarResidentesSimplificado(theadId, tbodyId, filas) {
    const thead = document.getElementById(theadId);
    const tbody = document.getElementById(tbodyId);
    if (!filas || filas.length === 0) {
        if (tbody) tbody.innerHTML = '<tr><td class="text-slate-400 py-4 text-center" colspan="99">Sin datos</td></tr>';
        return;
    }
    if (thead) {
        thead.innerHTML = `<tr>${filas[0].map(h => `<th class="px-4 py-2 bg-slate-100 text-left text-xs font-semibold">${h}</th>`).join('')}</tr>`;
    }
    if (tbody) {
        tbody.innerHTML = filas.slice(1).map(fila =>
            `<tr class="hover:bg-slate-50">${fila.map(celda =>
                `<td class="px-4 py-2 border-b border-slate-100 text-sm">${celda || ''}</td>`
            ).join('')}</tr>`
        ).join('');
    }
}

// --- Carga de datos de modulos ---

async function cargarSolicitudesSalida() {
    const cargas = [
        { sheet: getCelda('novedades_adulto_hoja'), rango: getCelda('novedades_adulto_solicitudes'), tbodyId: 'tabla-solicitudes-adulto',          cols: 6 },
        { sheet: getCelda('novedades_adulto_hoja'), rango: getCelda('novedades_adulto_pabellones'), tbodyId: 'tabla-futuros-pabellones-adulto',    cols: 6 },
        { sheet: getCelda('novedades_pedi_hoja'),   rango: getCelda('novedades_pedi_ucip'),         tbodyId: 'tabla-solicitudes-pediatria-ucip',   cols: 7 },
        { sheet: getCelda('novedades_pedi_hoja'),   rango: getCelda('novedades_pedi_utip'),         tbodyId: 'tabla-solicitudes-pediatria-utip',   cols: 7 }
    ];

    for (const c of cargas) {
        const tbody = document.getElementById(c.tbodyId);
        if (!tbody) continue;
        if (!c.sheet || !c.rango) {
            tbody.innerHTML = `<tr><td colspan="${c.cols}" class="px-3 py-4 text-center text-slate-400">Sin configurar — configura el rango en "Config. Celdas".</td></tr>`;
            continue;
        }
        tbody.innerHTML = `<tr><td colspan="${c.cols}" class="px-3 py-4 text-center text-slate-400">Cargando...</td></tr>`;
        try {
            const filas = await leerRangoGviz(c.sheet, c.rango);
            pintarTablaSolicitudes(c.tbodyId, filas, c.cols);
        } catch (err) {
            console.warn('No se pudo cargar tabla:', c.tbodyId, err);
            tbody.innerHTML = `<tr><td colspan="${c.cols}" class="px-3 py-4 text-center text-red-500">No se pudo cargar. Reintenta con "Actualizar".</td></tr>`;
        }
    }
}

async function cargarSolicitudesCDT() {
    console.log('Cargando solicitudes CDT...');
    const el = document.getElementById('tbody-cdt');
    if (el) el.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Conecta Google Sheets para ver los datos.</td></tr>';
}

async function cargarCasosHecHuap(pestana) {
    console.log('Cargando casos HEC/HUAP...');
    const tbId = pestana === 'huap' ? 'tbody-huap' : 'tbody-hec';
    const el = document.getElementById(tbId);
    if (el) el.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Conecta Google Sheets para ver los datos.</td></tr>';
}

function cambiarPestanaHecHuap(pestana) {
    const secciones = ['hec', 'huap'];
    secciones.forEach(p => {
        const sec = document.getElementById(`seccion-${p}`);
        const btn = document.getElementById(`tab-btn-${p}`);
        if (sec) sec.classList.toggle('hidden', p !== pestana);
        if (btn) {
            btn.classList.toggle('bg-white', p === pestana);
            btn.classList.toggle('text-rose-700', p === pestana);
            btn.classList.toggle('shadow-sm', p === pestana);
            btn.classList.toggle('text-slate-500', p !== pestana);
        }
    });
    cargarCasosHecHuap(pestana);
}

async function cargarRedDerivaciones() {
    console.log('Cargando red de derivaciones...');
    const el = document.getElementById('tbody-macrorred');
    if (el) el.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Conecta Google Sheets para ver los datos.</td></tr>';
}

async function cargarDirectorioAdulto() {
    console.log('Cargando directorio adulto...');
    const el = document.getElementById('tbody-ref-adulto');
    if (el) el.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Conecta Google Sheets para ver los datos.</td></tr>';
}

async function cargarDirectorioPede() {
    console.log('Cargando directorio pediatria...');
    const el = document.getElementById('tbody-ref-pede');
    if (el) el.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Conecta Google Sheets para ver los datos.</td></tr>';
}

async function cargarResidentesTurno() {
    const theadA = 'cabecera-residentes-adulto', tbodyA = 'tabla-residentes-adulto';
    const theadP = 'cabecera-residentes-pediatria', tbodyP = 'tabla-residentes-pediatria';
    const el = document.getElementById(tbodyA);
    if (el) el.innerHTML = '<tr><td class="px-3 py-4 text-center text-slate-400">Cargando...</td></tr>';
    try {
        const filas = await leerRangoGviz(getCelda('novedades_adulto_hoja'), getCelda('novedades_adulto_residentes'));
        pintarResidentesSimplificado(theadA, tbodyA, filas);
    } catch (err) {
        console.warn('Residentes adulto:', err);
        const t = document.getElementById(tbodyA);
        if (t) t.innerHTML = '<tr><td class="px-3 py-4 text-center text-red-500">No se pudo cargar.</td></tr>';
    }
    const elP = document.getElementById(tbodyP);
    if (elP) elP.innerHTML = '<tr><td class="px-3 py-4 text-center text-slate-400">Cargando...</td></tr>';
    try {
        const filasP = await leerRangoGviz(getCelda('novedades_pedi_hoja'), getCelda('novedades_pedi_residentes'));
        pintarResidentesSimplificado(theadP, tbodyP, filasP);
    } catch (err) {
        console.warn('Residentes pediatria:', err);
        const t = document.getElementById(tbodyP);
        if (t) t.innerHTML = '<tr><td class="px-3 py-4 text-center text-red-500">No se pudo cargar.</td></tr>';
    }
}

// --- Gestion de camas (plano) ---

async function saveBedChanges(event) {
    event.preventDefault();
    alert('Funcion de guardado de cama no implementada en esta version.');
}

// --- Config de celdas ---

async function cargarConfigCeldas() {
    if (!supabaseClient) return;
    try {
        const { data } = await supabaseClient.from('config_celdas').select('clave, valor');
        if (data) {
            data.forEach(row => {
                localStorage.setItem(`celda_${row.clave}`, row.valor);
            });
        }
    } catch (e) {
        console.warn('Error cargando config_celdas:', e);
    }
}

function getCelda(clave) {
    return localStorage.getItem(`celda_${clave}`) || '';
}

function getCeldasLista(clave) {
    const valor = getCelda(clave);
    return valor ? valor.split(',').map(v => v.trim()).filter(Boolean) : [];
}

async function guardarCelda(clave, valorNuevo) {
    localStorage.setItem(`celda_${clave}`, valorNuevo);
    if (supabaseClient) {
        await supabaseClient.from('config_celdas').upsert({
            clave,
            valor: valorNuevo,
            actualizado_por: sesionActiva?.usuario || 'desconocido',
            actualizado_en: new Date().toISOString()
        });
    }
}

async function restaurarCeldaPorDefecto(clave) {
    localStorage.removeItem(`celda_${clave}`);
    if (supabaseClient) {
        await supabaseClient.from('config_celdas').delete().eq('clave', clave);
    }
}

function detectarSecciones(filaSecciones) {
    const secciones = {};
    if (!filaSecciones) return secciones;
    filaSecciones.forEach((valor, idx) => {
        if (valor && String(valor).trim()) {
            secciones[slugify(valor)] = idx;
        }
    });
    return secciones;
}
