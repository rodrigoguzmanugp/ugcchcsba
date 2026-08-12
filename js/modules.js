// ===================================================================
// MODULES.JS - MÃ³dulos custom y gestiÃ³n de Google Sheets
// ===================================================================

function getSheetUrl(modId) {
    const urls = {
        novedades: 'https://docs.google.com/spreadsheets/d/.../edit',
        horario: 'https://docs.google.com/spreadsheets/d/.../edit',
        informe: 'https://docs.google.com/spreadsheets/d/.../edit',
    };
    return urls[modId] || '';
}

function openModuleSheet(modId) {
    const url = getSheetUrl(modId);
    if (url) window.open(url, '_blank');
}

function openNovedadesSheet() {
    openModuleSheet('novedades');
}

function openNovedadesSheetDirect() {
    window.open('https://docs.google.com/spreadsheets/d/.../edit', '_blank');
}

async function configureSheetUrl(modId, modName) {
    const nuevoUrl = prompt(`Ingresa la URL de Google Sheets para "${modName}":`);
    if (!nuevoUrl) return;
    // Guardar en Supabase si es necesario
    console.log(`Configurado ${modId}: ${nuevoUrl}`);
}

function navigateToModule(modId) {
    if (bloquearSiInvitado('No puedes ver mÃ³dulos personalizados en modo Invitado.')) return;
    const tab = document.getElementById(`tab-${modId}`);
    if (tab) {
        tab.click();
    }
}

function switchModule(modId) {
    // Cambiar entre mÃ³dulos en la navegaciÃ³n
    const tabs = document.querySelectorAll('[data-module-tab]');
    tabs.forEach(t => {
        t.classList.toggle('hidden', t.id !== `tab-${modId}`);
    });
}

function obtenerModulosCustomCache() {
    const cached = localStorage.getItem('modulos-custom-cache');
    return cached ? JSON.parse(cached) : [];
}

async function cargarModulosCustomDesdeSupabase() {
    if (!supabaseClient) return [];
    const { data } = await supabaseClient
        .from('modulos_custom')
        .select('*')
        .order('posicion', { ascending: true });
    return data || [];
}

function abrirModalCrearModulo() {
    document.getElementById('modal-crear-modulo').classList.remove('hidden');
}

function cerrarModalCrearModulo() {
    document.getElementById('modal-crear-modulo').classList.add('hidden');
}

async function crearModuloCustom(event) {
    event.preventDefault();
    if (bloquearSiInvitado()) return;

    const nombre = document.getElementById('input-nombre-modulo').value;
    const urlSheet = document.getElementById('input-url-sheet').value;

    if (!supabaseClient) {
        alert('Supabase no estÃ¡ disponible');
        return;
    }

    const { error } = await supabaseClient
        .from('modulos_custom')
        .insert({ nombre, url_sheet: urlSheet, creado_por: sesionActiva.usuario });

    if (error) {
        alert(`Error: ${error.message}`);
        return;
    }

    alert('âœ“ MÃ³dulo creado');
    cerrarModalCrearModulo();
    location.reload();
}

async function eliminarModuloCustom(id) {
    if (!confirm('Â¿Eliminar este mÃ³dulo?')) return;
    if (!supabaseClient) return;

    const { error } = await supabaseClient
        .from('modulos_custom')
        .delete()
        .eq('id', id);

    if (error) {
        alert(`Error: ${error.message}`);
        return;
    }

    location.reload();
}

function crearSeccionModuloCustom(m) {
    return `
        <div class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div>
                <p class="font-semibold text-slate-900">${m.nombre}</p>
                <p class="text-xs text-slate-500">${m.url_sheet.substring(0, 50)}...</p>
            </div>
            <button onclick="eliminarModuloCustom('${m.id}')" class="text-red-600 hover:text-red-700 text-sm">
                <i class="fa-solid fa-trash"></i> Eliminar
            </button>
        </div>
    `;
}

async function cargarModuloCustom(id) {
    // Cargar datos de un mÃ³dulo custom especÃ­fico
    console.log(`Cargando mÃ³dulo custom: ${id}`);
}

function renderModulosCustom(reconstruirNav = false) {
    // Renderizar todos los mÃ³dulos custom
    console.log('Renderizando mÃ³dulos custom...');
}
