// ===================================================================
// MODULES.JS - Módulos custom y gestión de Google Sheets
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
    if (bloquearSiInvitado('No puedes ver módulos personalizados en modo Invitado.')) return;
    const tab = document.getElementById(`tab-${modId}`);
    if (tab) {
        tab.click();
    }
}

function switchModule(modId) {
    // Cambiar entre módulos en la navegación
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
        alert('Supabase no está disponible');
        return;
    }

    const { error } = await supabaseClient
        .from('modulos_custom')
        .insert({ nombre, url_sheet: urlSheet, creado_por: sesionActiva.usuario });

    if (error) {
        alert(`Error: ${error.message}`);
        return;
    }

    alert('✓ Módulo creado');
    cerrarModalCrearModulo();
    location.reload();
}

async function eliminarModuloCustom(id) {
    if (!confirm('¿Eliminar este módulo?')) return;
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
    // Cargar datos de un módulo custom específico
    console.log(`Cargando módulo custom: ${id}`);
}

function renderModulosCustom(reconstruirNav = false) {
    // Renderizar todos los módulos custom
    console.log('Renderizando módulos custom...');
}
