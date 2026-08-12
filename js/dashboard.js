// ===================================================================
// DASHBOARD.JS - Dashboard KPIs y visualizacion de datos
// ===================================================================

async function cargarKpisCamasCriticas() {
    console.log('Cargando KPIs de camas criticas...');
    // Mostrar guiones mientras carga
    ['kpi-adulto-uci', 'kpi-adulto-uti', 'kpi-pede-uci', 'kpi-pede-intermedios'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.querySelector('.kpi-valor')?.setAttribute('data-loading', 'true');
    });
}

function pintarKpiCard(prefix, data) {
    const container = document.getElementById(`kpi-${prefix}`);
    if (!container) return;
    const pct   = data.porcentaje !== undefined ? `${data.porcentaje}%` : '--';
    const disp  = data.disponibles !== undefined ? data.disponibles : '--';
    const total = data.total       !== undefined ? data.total       : '--';
    const colorBar = data.porcentaje >= 90 ? 'from-red-400 to-red-600'
                   : data.porcentaje >= 70 ? 'from-amber-400 to-amber-600'
                   : 'from-emerald-400 to-emerald-600';
    container.innerHTML = `
        <div class="text-3xl font-bold text-slate-900 kpi-valor">${pct}</div>
        <div class="text-xs text-slate-500 mt-2">${disp} Disponibles de ${total}</div>
        <div class="bg-gradient-to-r ${colorBar} h-2 rounded-full mt-3"></div>
    `;
}

async function cargarMatricesInforme() {
    console.log('Cargando matrices del informe de turno...');
    const contenedor = document.getElementById('matrices-informe');
    if (contenedor) {
        contenedor.innerHTML = '<p class="text-slate-400 text-sm text-center py-8">Conecta Google Sheets para ver los datos del informe.</p>';
    }
}

function pintarMatrizPorTipos(contenedorId, bloque) {
    const container = document.getElementById(contenedorId);
    if (!container || !bloque || bloque.length === 0) return;
    const encabezados = bloque[0];
    const filas = bloque.slice(1);
    container.innerHTML = `
        <table class="w-full text-xs border-collapse">
            <thead>
                <tr>${encabezados.map(h => `<th class="px-3 py-2 bg-slate-100 text-left border border-slate-200">${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${filas.map(f => `<tr class="hover:bg-slate-50">${f.map(c => `<td class="px-3 py-1.5 border border-slate-100">${c}</td>`).join('')}</tr>`).join('')}
            </tbody>
        </table>`;
}

function pintarResumenOcupacionalInforme() {
    console.log('Pintando resumen ocupacional...');
}
