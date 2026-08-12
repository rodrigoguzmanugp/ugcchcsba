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

function pintarTablaSolicitudes(tbodyId, filas) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    if (!filas || filas.length === 0) {
        tbody.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Sin datos disponibles.</td></tr>';
        return;
    }
    tbody.innerHTML = filas.map(fila =>
        `<tr class="hover:bg-slate-50">${fila.map(celda =>
            `<td class="px-4 py-2 border-b border-slate-100 text-sm">${celda || ''}</td>`
        ).join('')}</tr>`
    ).join('');
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
    console.log('Cargando solicitudes de salida...');
    const contenedores = ['tbody-cdt-salida', 'tbody-solicitudes'];
    contenedores.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<tr><td class="px-4 py-4 text-slate-400 text-center" colspan="99">Conecta Google Sheets para ver los datos.</td></tr>';
    });
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
    console.log('Cargando residentes del turno...');
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
