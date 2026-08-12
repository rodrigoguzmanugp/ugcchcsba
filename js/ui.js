// ===================================================================
// UI.JS - Funciones de interfaz, impresiÃ³n y modales
// ===================================================================

function imprimirPlanillaInhabil() {
    if (bloquearSiInvitado('No puedes imprimir en modo Invitado.')) return;
    const element = document.getElementById('planilla-inhabil');
    if (!element) {
        alert('No se encontrÃ³ la planilla para imprimir.');
        return;
    }
    const opt = {
        margin: 10,
        filename: 'Planilla_Inhabil.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
}

function imprimirSolicitudPabellon() {
    if (bloquearSiInvitado('No puedes imprimir en modo Invitado.')) return;
    const element = document.getElementById('solicitud-pabellon');
    if (!element) {
        alert('No se encontrÃ³ la solicitud para imprimir.');
        return;
    }
    const opt = {
        margin: 10,
        filename: 'Solicitud_Pabellon.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
}

function renderBedPlan() {
    const container = document.getElementById('bed-plan-container');
    if (!container) return;

    const html = `
        <div class="grid grid-cols-4 gap-2 p-4">
            <!-- Plano de camas a renderizar -->
            <p class="col-span-4 text-slate-400 text-center py-8">Cargando plano de camas...</p>
        </div>
    `;
    container.innerHTML = html;
}

function getBedCardHTML(bed) {
    const statusColor = bed.ocupada ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    return `
        <div class="p-3 border rounded-lg ${statusColor}">
            <p class="font-semibold text-sm">${bed.numero}</p>
            <p class="text-xs">${bed.ocupada ? 'Ocupada' : 'Disponible'}</p>
        </div>
    `;
}

function pintarTablaSolicitudes(tbodyId, filas, columnas) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = filas.map(fila => `
        <tr>
            ${fila.map(celda => `<td class="px-4 py-2 border-b">${celda}</td>`).join('')}
        </tr>
    `).join('');
}

async function cargarSolicitudesSalida() {
    console.log('Cargando solicitudes de salida...');
}

function detectarSecciones(filaSecciones) {
    const secciones = {};
    if (!filaSecciones) return secciones;

    filaSecciones.forEach((valor, idx) => {
        if (valor && valor.trim()) {
            secciones[slugify(valor)] = idx;
        }
    });
    return secciones;
}

function pintarResidentesSimplificado(theadId, tbodyId, filas) {
    const thead = document.getElementById(theadId);
    const tbody = document.getElementById(tbodyId);

    if (filas.length === 0) {
        if (tbody) tbody.innerHTML = '<tr><td class="text-slate-400 py-4">Sin datos</td></tr>';
        return;
    }

    if (thead && filas.length > 0) {
        thead.innerHTML = `<tr>${filas[0].map(h => `<th class="px-4 py-2 bg-slate-100 text-left">${h}</th>`).join('')}</tr>`;
    }

    if (tbody) {
        tbody.innerHTML = filas.slice(1).map(fila => `
            <tr class="hover:bg-slate-50">
                ${fila.map(celda => `<td class="px-4 py-2 border-b">${celda}</td>`).join('')}
            </tr>
        `).join('');
    }
}

async function cargarResidentesTurno() {
    console.log('Cargando residentes del turno...');
}

// ConfiguraciÃ³n de celdas desde Supabase
async function cargarConfigCeldas() {
    if (!supabaseClient) return {};
    const { data } = await supabaseClient.from('config_celdas').select('*');
    return data || [];
}

function getCelda(clave) {
    const almacenado = localStorage.getItem(`celda_${clave}`);
    return almacenado || '';
}

function getCeldasLista(clave) {
    const valor = getCelda(clave);
    return valor ? valor.split(',').map(v => v.trim()) : [];
}

async function guardarCelda(clave, valorNuevo) {
    localStorage.setItem(`celda_${clave}`, valorNuevo);
    if (supabaseClient) {
        await supabaseClient.from('config_celdas').upsert({ clave, valor: valorNuevo });
    }
}

async function restaurarCeldaPorDefecto(clave) {
    localStorage.removeItem(`celda_${clave}`);
    if (supabaseClient) {
        await supabaseClient.from('config_celdas').delete().eq('clave', clave);
    }
}
