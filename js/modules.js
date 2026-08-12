// ===================================================================
// MODULES.JS - Navegacion de modulos y gestion Google Sheets
// ===================================================================

// --- Navegacion entre secciones ---

function switchModule(modId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.module-section').forEach(s => s.classList.add('hidden'));
    // Mostrar la seccion seleccionada
    const seccion = document.getElementById(`mod-${modId}`);
    if (seccion) seccion.classList.remove('hidden');

    // Actualizar estilos del nav activo
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.remove('text-brand-600', 'bg-brand-50', 'border', 'border-brand-200', 'active');
        b.classList.add('text-slate-600');
    });
    const navBtn = document.getElementById(`nav-${modId}`);
    if (navBtn) {
        navBtn.classList.add('text-brand-600', 'bg-brand-50', 'border', 'border-brand-200', 'active');
        navBtn.classList.remove('text-slate-600');
    }
}

function navigateToModule(modId) {
    // Bloquear acceso a invitados excepto home
    if (modId !== 'home' && bloquearSiInvitado('El modo Invitado solo puede ver el Dashboard principal.')) return;

    // Bloquear config-celdas a no-admin
    if (modId === 'config-celdas' && sesionActiva?.rol !== 'admin') {
        alert('Esta seccion es solo para el Administrador.');
        return;
    }

    switchModule(modId);
}

// --- Abrir Google Sheet de un modulo ---

function openModuleSheet(modId) {
    const url = SHEET_URLS[modId] || '';
    if (!url) {
        alert('No hay enlace configurado para este modulo. Usa "Configurar Enlace".');
        return;
    }
    window.open(url, '_blank');
}

function openNovedadesSheet() { openModuleSheet('novedades'); }

async function configureSheetUrl(modId, modName) {
    if (bloquearSiInvitado()) return;
    const actual = SHEET_URLS[modId] || '';
    const nuevoUrl = prompt(`Ingresa la URL de Google Sheets para "${modName}":`, actual);
    if (nuevoUrl === null) return;
    const urlLimpia = nuevoUrl.trim();
    if (!urlLimpia) { alert('URL invalida.'); return; }

    SHEET_URLS[modId] = urlLimpia;
    localStorage.setItem(`sheet_url_${modId}`, urlLimpia);

    if (supabaseClient && sesionActiva) {
        await supabaseClient.from('enlaces_config').upsert({
            mod_id: modId,
            url: urlLimpia,
            actualizado_por: sesionActiva.usuario,
            actualizado_en: new Date().toISOString()
        });
    }
    alert(`Enlace guardado para "${modName}".`);
}

// --- Modulos personalizados (custom) ---

function abrirModalCrearModulo() {
    const modal = document.getElementById('modal-crear-modulo');
    if (modal) modal.classList.remove('hidden');
}

function cerrarModalCrearModulo() {
    const modal = document.getElementById('modal-crear-modulo');
    if (modal) modal.classList.add('hidden');
}

async function crearModuloCustom(event) {
    event.preventDefault();
    if (bloquearSiInvitado()) return;

    const nombre      = document.getElementById('cm-nombre')?.value?.trim()     || document.getElementById('input-nombre-modulo')?.value?.trim() || '';
    const descripcion = document.getElementById('cm-descripcion')?.value?.trim() || '';
    const icono       = document.getElementById('cm-icono')?.value               || 'fa-file-excel';
    const color       = document.getElementById('cm-color')?.value               || 'brand';
    const sheetUrl    = document.getElementById('cm-sheet-url')?.value?.trim()   || document.getElementById('input-url-sheet')?.value?.trim() || '';

    if (!nombre) { alert('Ingresa un nombre para el modulo.'); return; }

    if (supabaseClient) {
        const { error } = await supabaseClient.from('modulos_custom').insert({
            nombre, descripcion, icono, color,
            sheet_url: sheetUrl || null,
            creado_por: sesionActiva?.usuario || 'desconocido'
        });
        if (error) {
            alert(`Error al guardar: ${error.message}`);
            return;
        }
    }

    cerrarModalCrearModulo();
    await renderModulosCustom(true);
    alert(`Modulo "${nombre}" creado.`);
}

async function eliminarModuloCustom(id) {
    if (!confirm('¿Eliminar este modulo?')) return;
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from('modulos_custom').delete().eq('id', id);
    if (error) { alert(`Error: ${error.message}`); return; }
    await renderModulosCustom(true);
}

async function cargarModulosCustomDesdeSupabase() {
    if (!supabaseClient) return [];
    const { data } = await supabaseClient
        .from('modulos_custom')
        .select('*')
        .order('created_at', { ascending: true });
    return data || [];
}

async function renderModulosCustom(reconstruirNav = false) {
    const modulos = await cargarModulosCustomDesdeSupabase();

    // Insertar secciones de modulos custom en el main
    const main = document.querySelector('main');
    document.querySelectorAll('.mod-custom-section').forEach(el => el.remove());

    modulos.forEach(m => {
        const sec = document.createElement('section');
        sec.id = `mod-custom-${m.id}`;
        sec.className = 'module-section hidden space-y-6 mod-custom-section';
        sec.innerHTML = `
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-bold text-slate-900">
                        <i class="fa-solid ${m.icono || 'fa-file-excel'} mr-2 text-brand-600"></i>${m.nombre}
                    </h2>
                    ${sesionActiva?.rol === 'admin' ? `<button onclick="eliminarModuloCustom('${m.id}')" class="text-red-500 hover:text-red-700 text-xs"><i class="fa-solid fa-trash mr-1"></i>Eliminar</button>` : ''}
                </div>
                <p class="text-sm text-slate-500 mb-4">${m.descripcion || ''}</p>
                ${m.sheet_url ? `<a href="${m.sheet_url}" target="_blank" class="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"><i class="fa-solid fa-arrow-up-right-from-square mr-2"></i>Abrir Google Sheet</a>` : '<p class="text-slate-400 text-sm">Sin enlace configurado.</p>'}
            </div>`;
        if (main) main.appendChild(sec);
    });

    // Agregar botones al nav
    if (reconstruirNav) {
        const navContainer = document.getElementById('nav-custom-container');
        if (navContainer) {
            navContainer.innerHTML = '';
            modulos.forEach(m => {
                const btn = document.createElement('button');
                btn.className = 'nav-btn px-3 py-2 rounded-md text-slate-600 hover:bg-slate-100 transition text-xs sm:text-sm whitespace-nowrap';
                btn.onclick = () => navigateToModule(`custom-${m.id}`);
                btn.innerHTML = `<i class="fa-solid ${m.icono || 'fa-file-excel'} mr-1.5"></i>${m.nombre}`;
                navContainer.appendChild(btn);
            });
        }
    }
}

// --- Cargar URLs guardadas localmente ---
function cargarEnlacesConfig() {
    Object.keys(SHEET_URLS).forEach(modId => {
        const guardado = localStorage.getItem(`sheet_url_${modId}`);
        if (guardado) SHEET_URLS[modId] = guardado;
    });
}
