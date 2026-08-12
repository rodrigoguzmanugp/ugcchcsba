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

// --- Tabla genérica con búsqueda ---

function pintarTablaGenerica(prefijo, filas) {
    const thead = document.getElementById(`${prefijo}-table-head`);
    const tbody = document.getElementById(`${prefijo}-table-body`);
    if (!tbody) return;
    if (!filas || filas.length === 0) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Sin datos.</td></tr>';
        return;
    }
    const encabezados = filas[0];
    const datos = filas.slice(1).filter(f => f && f.some(c => c && String(c).trim()));
    if (thead) {
        thead.innerHTML = `<tr>${encabezados.map(h =>
            `<th class="px-3 py-2 text-left whitespace-nowrap">${h || ''}</th>`
        ).join('')}</tr>`;
    }
    window[`_datos_${prefijo.replace(/-/g,'_')}`] = { encabezados, datos };
    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Sin registros.</td></tr>';
        return;
    }
    tbody.innerHTML = datos.map(f =>
        `<tr class="hover:bg-slate-50">${encabezados.map((_, i) =>
            `<td class="px-3 py-2 text-slate-700 border-b border-slate-100 whitespace-nowrap">${f[i] ?? ''}</td>`
        ).join('')}</tr>`
    ).join('');
}

function pintarTablaGenericaFiltrada(prefijo) {
    const key = prefijo.replace(/-/g,'_');
    const dataset = window[`_datos_${key}`];
    if (!dataset) return;
    const { encabezados, datos } = dataset;
    const buscador = document.getElementById(`${prefijo}-buscador`);
    const tbody = document.getElementById(`${prefijo}-table-body`);
    if (!tbody) return;
    const q = buscador ? buscador.value.toLowerCase().trim() : '';
    const filtradas = q ? datos.filter(f => f.some(c => String(c || '').toLowerCase().includes(q))) : datos;
    if (filtradas.length === 0) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Sin resultados para "' + q + '".</td></tr>';
        return;
    }
    tbody.innerHTML = filtradas.map(f =>
        `<tr class="hover:bg-slate-50">${encabezados.map((_, i) =>
            `<td class="px-3 py-2 text-slate-700 border-b border-slate-100 whitespace-nowrap">${f[i] ?? ''}</td>`
        ).join('')}</tr>`
    ).join('');
}

// --- CDT ---

async function cargarSolicitudesCDT() {
    const tbody = document.getElementById('cdt-table-body');
    const thead = document.getElementById('cdt-table-head');
    if (!tbody) return;
    const hoja  = getCelda('cdt_hoja')  || 'ORDENES';
    const rango = getCelda('cdt_rango') || 'A1:Z200';
    tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Cargando...</td></tr>';
    if (thead) thead.innerHTML = '';
    try {
        const filas = await leerRangoGvizDe(CDT_SPREADSHEET_ID, hoja, rango);
        pintarTablaGenerica('cdt', filas);
    } catch(e) {
        console.error('CDT:', e);
        tbody.innerHTML = '<tr><td class="p-4 text-center text-red-500" colspan="99">No se pudo cargar. Verifica que Google esté conectado.</td></tr>';
    }
}

// --- HEC y HUAP ---

let _hecHuapPestana = 'hec';

async function cargarCasosHecHuap(pestana) {
    _hecHuapPestana = pestana || _hecHuapPestana;
    const tbody = document.getElementById('hechuap-table-body');
    const thead = document.getElementById('hechuap-table-head');
    if (!tbody) return;
    const hoja  = _hecHuapPestana === 'huap' ? getCelda('hec_huap_huap_hoja') : getCelda('hec_huap_hec_hoja');
    const rango = getCelda('hec_huap_rango') || 'A1:G148';
    tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="7">Cargando...</td></tr>';
    if (thead) thead.innerHTML = '';
    if (!hoja) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="7">Sin pestaña configurada en Config. Celdas.</td></tr>';
        return;
    }
    try {
        const filas = await leerRangoGvizDe(HEC_HUAP_SPREADSHEET_ID, hoja, rango);
        pintarTablaGenerica('hechuap', filas);
    } catch(e) {
        console.error('HEC/HUAP:', e);
        tbody.innerHTML = '<tr><td class="p-4 text-center text-red-500" colspan="7">No se pudo cargar. Verifica que Google esté conectado.</td></tr>';
    }
}

function cambiarPestanaHecHuap(pestana) {
    ['hec', 'huap'].forEach(p => {
        const btn = document.getElementById(`tab-btn-${p}`);
        if (btn) {
            btn.classList.toggle('bg-white', p === pestana);
            btn.classList.toggle('text-rose-700', p === pestana);
            btn.classList.toggle('shadow-sm', p === pestana);
            btn.classList.toggle('text-slate-500', p !== pestana);
        }
    });
    cargarCasosHecHuap(pestana);
}

// --- Macrorred ---

async function cargarRedDerivaciones() {
    const tbody = document.getElementById('macrorred-table-body');
    const thead = document.getElementById('macrorred-table-head');
    if (!tbody) return;
    const hoja  = getCelda('macrorred_hoja') || 'OTROS PÚBLICOS Y MACRORED 08/26';
    const rango = getCelda('macrorred_rango') || 'A1:S50';
    tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Cargando...</td></tr>';
    if (thead) thead.innerHTML = '';
    try {
        const filas = await leerRangoGvizDe(MACRORRED_SPREADSHEET_ID, hoja, rango);
        pintarTablaGenerica('macrorred', filas);
    } catch(e) {
        console.error('Macrorred:', e);
        tbody.innerHTML = '<tr><td class="p-4 text-center text-red-500" colspan="99">No se pudo cargar. Verifica que Google esté conectado.</td></tr>';
    }
}

// --- Directorios ---

async function cargarDirectorioAdulto() {
    const tbody = document.getElementById('ref-adulto-table-body');
    const thead = document.getElementById('ref-adulto-table-head');
    if (!tbody) return;
    const hoja  = getCelda('ref_adulto_hoja');
    const rango = getCelda('ref_adulto_rango') || 'A1:Z200';
    tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Cargando...</td></tr>';
    if (thead) thead.innerHTML = '';
    if (!hoja) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Configura el enlace y pestaña en "Config. Celdas".</td></tr>';
        return;
    }
    try {
        const id = SPREADSHEET_IDS['ref-adulto'] || '';
        if (!id) { tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Configura el enlace del módulo.</td></tr>'; return; }
        const filas = await leerRangoGvizDe(id, hoja, rango);
        pintarTablaGenerica('ref-adulto', filas);
    } catch(e) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-red-500" colspan="99">No se pudo cargar.</td></tr>';
    }
}

async function cargarDirectorioPede() {
    const tbody = document.getElementById('ref-pede-table-body');
    const thead = document.getElementById('ref-pede-table-head');
    if (!tbody) return;
    const hoja  = getCelda('ref_pede_hoja');
    const rango = getCelda('ref_pede_rango') || 'A1:Z200';
    tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Cargando...</td></tr>';
    if (thead) thead.innerHTML = '';
    if (!hoja) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Configura el enlace y pestaña en "Config. Celdas".</td></tr>';
        return;
    }
    try {
        const id = SPREADSHEET_IDS['ref-pede'] || '';
        if (!id) { tbody.innerHTML = '<tr><td class="p-4 text-center text-slate-400" colspan="99">Configura el enlace del módulo.</td></tr>'; return; }
        const filas = await leerRangoGvizDe(id, hoja, rango);
        pintarTablaGenerica('ref-pede', filas);
    } catch(e) {
        tbody.innerHTML = '<tr><td class="p-4 text-center text-red-500" colspan="99">No se pudo cargar.</td></tr>';
    }
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
        configCeldasCache = {};
        (data || []).forEach(row => { configCeldasCache[row.clave] = row.valor; });
    } catch (e) {
        console.warn('Error cargando config_celdas:', e);
    }
}

function getCelda(clave) {
    if (configCeldasCache[clave] != null) return configCeldasCache[clave];
    return CONFIG_CELDAS_DEFAULT[clave]?.valor ?? '';
}

function getCeldasLista(clave) {
    return getCelda(clave).split(',').map(v => v.trim()).filter(Boolean);
}

async function guardarCelda(clave, valorNuevo) {
    const val = String(valorNuevo).trim();
    configCeldasCache[clave] = val;
    if (supabaseClient) {
        await supabaseClient.from('config_celdas').upsert({
            clave, valor: val,
            actualizado_por: sesionActiva?.usuario || 'desconocido',
            actualizado_en: new Date().toISOString()
        });
    }
    return true;
}

async function restaurarCeldaPorDefecto(clave) {
    delete configCeldasCache[clave];
    if (supabaseClient) {
        await supabaseClient.from('config_celdas').delete().eq('clave', clave);
    }
    return true;
}

function renderConfigCeldas() {
    const cont = document.getElementById('lista-config-celdas');
    if (!cont) return;

    const grupos = {};
    Object.keys(CONFIG_CELDAS_DEFAULT).forEach(clave => {
        const def = CONFIG_CELDAS_DEFAULT[clave];
        (grupos[def.grupo] = grupos[def.grupo] || []).push(clave);
    });

    cont.innerHTML = Object.keys(grupos).map(grupo => `
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="bg-slate-100 px-4 py-2 font-bold text-sm text-slate-700">${grupo}</div>
            <div class="divide-y divide-slate-100">
                ${grupos[grupo].map(clave => {
                    const def   = CONFIG_CELDAS_DEFAULT[clave];
                    const val   = getCelda(clave);
                    const esMod = configCeldasCache[clave] != null;
                    return `
                    <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div class="flex-1">
                            <p class="text-xs font-semibold text-slate-700">${def.etiqueta}</p>
                            <p class="text-[10px] text-slate-400">Clave: ${clave} · Defecto: ${def.valor}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <input id="input-${clave}" type="text" value="${val}"
                                class="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 w-40 sm:w-52 focus:outline-none focus:ring-2 focus:ring-rose-400">
                            <button onclick="guardarCeldaDesdePanel('${clave}')"
                                class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                                <i class="fa-solid fa-floppy-disk"></i>
                            </button>
                            ${esMod ? `<button onclick="restaurarCeldaDesdePanel('${clave}')"
                                title="Restaurar valor de fábrica"
                                class="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-3 py-2 rounded-lg transition">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`).join('');
}

async function guardarCeldaDesdePanel(clave) {
    const input = document.getElementById(`input-${clave}`);
    if (!input || !input.value.trim()) return;
    const ok = await guardarCelda(clave, input.value);
    if (ok) {
        renderConfigCeldas();
        if (typeof cargarSolicitudesSalida === 'function') cargarSolicitudesSalida();
        if (typeof cargarResidentesTurno   === 'function') cargarResidentesTurno();
    }
}

async function restaurarCeldaDesdePanel(clave) {
    const ok = await restaurarCeldaPorDefecto(clave);
    if (ok) {
        renderConfigCeldas();
        if (typeof cargarSolicitudesSalida === 'function') cargarSolicitudesSalida();
        if (typeof cargarResidentesTurno   === 'function') cargarResidentesTurno();
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
