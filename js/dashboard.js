// ===================================================================
// DASHBOARD.JS - Lógica del dashboard, KPIs y tarjetas
// ===================================================================

async function cargarKpisCamasCriticas() {
    // Carga datos de KPI para camas críticas desde Sheets
    // Implementar lectura de celdas específicas desde Google Sheets
    console.log('Cargando KPIs de camas críticas...');
}

function pintarKpiCard(prefix, data) {
    const container = document.getElementById(`kpi-${prefix}`);
    if (!container) return;

    const porcentaje = data.porcentaje || '--';
    const disponibles = data.disponibles || '--';
    const total = data.total || '--';

    container.innerHTML = `
        <div class="text-3xl font-bold text-slate-900">${porcentaje}%</div>
        <div class="text-xs text-slate-500 mt-2">${disponibles} Disponibles</div>
        <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full mt-3"></div>
        <div class="text-xs text-slate-400 mt-1">${total} camas totales</div>
    `;
}

function construirCeldasCamasCriticas() {
    // Construir referencia a celdas en Google Sheets para datos de camas críticas
    return {
        adultoUciPorcentaje: 'B5',
        adultoUciDisponibles: 'C5',
        adultoUciTotal: 'D5',
    };
}

async function cargarMatricesInforme() {
    console.log('Cargando matrices del informe...');
}

function pintarMatrizPorTipos(contenedorId, bloque) {
    const container = document.getElementById(contenedorId);
    if (!container) return;
    container.innerHTML = '<p class="text-slate-400">Cargando matriz...</p>';
}

function pintarResumenOcupacionalInforme() {
    console.log('Pintando resumen ocupacional...');
}
