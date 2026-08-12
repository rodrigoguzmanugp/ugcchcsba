// ===================================================================
// AUTH.JS - AutenticaciÃ³n, login, registro y sesiones
// ===================================================================

function usuarioAEmail(valor) {
    const v = valor.trim().toLowerCase();
    return v.includes('@') ? v : `${v.replace(/\s+/g, '')}${LEGACY_EMAIL_DOMAIN}`;
}

function mostrarTabLogin(tab) {
    const esLogin = tab === 'login';
    document.getElementById('panel-login').classList.toggle('hidden', !esLogin);
    document.getElementById('panel-registro').classList.toggle('hidden', esLogin);
    document.getElementById('tab-btn-login').classList.toggle('text-slate-900', esLogin);
    document.getElementById('tab-btn-login').classList.toggle('border-indigo-500', esLogin);
    document.getElementById('tab-btn-login').classList.toggle('text-slate-400', !esLogin);
    document.getElementById('tab-btn-login').classList.toggle('border-transparent', !esLogin);
    document.getElementById('tab-btn-registro').classList.toggle('text-slate-900', !esLogin);
    document.getElementById('tab-btn-registro').classList.toggle('border-indigo-500', !esLogin);
    document.getElementById('tab-btn-registro').classList.toggle('text-slate-400', esLogin);
    document.getElementById('tab-btn-registro').classList.toggle('border-transparent', esLogin);
}

function verificarConexionSupabase(errorEl) {
    if (!supabaseClient) {
        errorEl.innerText = 'Supabase no estÃ¡ configurado: define SUPABASE_URL y SUPABASE_ANON_KEY en config.js';
        errorEl.classList.remove('hidden');
        return false;
    }
    return true;
}

function extraerCorreoParaMostrar(user) {
    if (!user) return null;
    const idGoogle = (user.identities || []).find(i => i.provider === 'google');
    if (idGoogle?.identity_data?.email) return idGoogle.identity_data.email;
    if (user.email && !user.email.endsWith(LEGACY_EMAIL_DOMAIN)) return user.email;
    return null;
}

async function iniciarSesion(event) {
    event.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');
    if (!verificarConexionSupabase(errorEl)) return;

    const usuario = document.getElementById('login-usuario').value.trim();
    const clave = document.getElementById('login-clave').value;
    const turno = document.getElementById('login-turno').value;
    const area = document.getElementById('login-area').value;
    const boton = event.submitter;
    if (boton) { boton.disabled = true; boton.innerText = 'Ingresando...'; }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: usuarioAEmail(usuario),
        password: clave
    });

    if (error) {
        console.error('Supabase login error:', error);
        const msg = error.message.includes('Email not confirmed')
            ? 'Confirma tu correo (revisa tu bandeja/spam) antes de ingresar.'
            : `Usuario o contraseÃ±a incorrectos. (${error.message})`;
        errorEl.innerText = msg;
        errorEl.classList.remove('hidden');
        if (boton) { boton.disabled = false; boton.innerText = 'Ingresar al Panel'; }
        return;
    }

    const { data: perfil, error: errorPerfil } = await supabaseClient
        .from('perfiles')
        .select('nombre, rol, estado')
        .eq('email', data.user.email)
        .single();

    if (errorPerfil || !perfil) {
        errorEl.innerText = 'Tu cuenta no tiene perfil. Contacta al administrador.';
        errorEl.classList.remove('hidden');
        await supabaseClient.auth.signOut();
        if (boton) { boton.disabled = false; boton.innerText = 'Ingresar al Panel'; }
        return;
    }

    if (perfil.estado !== 'activo') {
        errorEl.innerText = `Tu cuenta está ${perfil.estado === 'pendiente' ? 'pendiente de aprobación' : 'bloqueada'}. Contacta a ${ADMIN_EMAIL}.`;
        errorEl.classList.remove('hidden');
        await supabaseClient.auth.signOut();
        if (boton) { boton.disabled = false; boton.innerText = 'Ingresar al Panel'; }
        return;
    }

    abrirSesion({ usuario: perfil.nombre, rol: perfil.rol, permiso: perfil.rol === 'admin' ? 'escritura' : 'lectura', turno, area, email: extraerCorreoParaMostrar(data.user) });
}

function ingresarInvitado() {
    const turno = document.getElementById('login-turno').value;
    const area = document.getElementById('login-area').value;
    abrirSesion({ usuario: 'Invitado', rol: 'invitado', permiso: 'lectura', turno, area });
}

async function registrarOperador(event) {
    event.preventDefault();
    const errorEl = document.getElementById('registro-error');
    const okEl = document.getElementById('registro-ok');
    errorEl.classList.add('hidden');
    okEl.classList.add('hidden');
    if (!verificarConexionSupabase(errorEl)) return;

    const usuario = document.getElementById('reg-usuario').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const clave = document.getElementById('reg-clave').value;
    const permiso = document.getElementById('reg-permiso').value;
    const turno = document.getElementById('reg-turno').value;
    const area = document.getElementById('reg-area').value;
    const boton = event.submitter;

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
        errorEl.innerText = 'Debes registrarte con un correo @gmail.com vÃ¡lido.';
        errorEl.classList.remove('hidden');
        return;
    }

    if (boton) { boton.disabled = true; boton.innerText = 'Registrando...'; }

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: clave,
        options: { data: { usuario, permiso, turno, area } }
    });

    if (error) {
        errorEl.innerText = error.message.includes('already registered')
            ? 'Ese correo ya estÃ¡ registrado.'
            : `Error: ${error.message}`;
        errorEl.classList.remove('hidden');
        if (boton) { boton.disabled = false; boton.innerText = 'Registrar Operador'; }
        return;
    }

    okEl.innerText = `âœ“ Registro enviado para "${usuario}" (${email}). Confirma tu correo y espera aprobaciÃ³n.`;
    okEl.classList.remove('hidden');
    document.getElementById('panel-registro').reset();
    if (boton) { boton.disabled = false; boton.innerText = 'Registrar Operador'; }
    await supabaseClient.auth.signOut();
    setTimeout(() => mostrarTabLogin('login'), 2500);
}

function esInvitado() {
    return sesionActiva && sesionActiva.rol === 'invitado';
}

function bloquearSiInvitado(mensaje) {
    if (esInvitado()) {
        alert(mensaje || 'Modo Invitado solo permite consultar el Dashboard.');
        return true;
    }
    return false;
}

function abrirSesion(sesion) {
    sesionActiva = sesion;
    document.getElementById('login-screen').classList.add('hidden');
    const shell = document.getElementById('app-shell');
    shell.classList.remove('hidden');
    shell.classList.add('flex');
    aplicarSesionEnInterfaz(sesion);
    actualizarBotonGoogle();
}

async function cerrarSesion() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    location.reload();
}

async function actualizarBadgePendientes() {
    if (!sesionActiva || sesionActiva.rol !== 'admin' || !supabaseClient) return;
    const { count } = await supabaseClient
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('aprobado', false);
    const badge = document.getElementById('badge-pendientes');
    if (count && count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function abrirPanelAprobaciones() {
    document.getElementById('modal-aprobaciones').classList.remove('hidden');
    document.getElementById('modal-aprobaciones').classList.add('flex');
    cargarPendientes();
}

function cerrarPanelAprobaciones() {
    document.getElementById('modal-aprobaciones').classList.add('hidden');
    document.getElementById('modal-aprobaciones').classList.remove('flex');
}

async function cargarPendientes() {
    const cont = document.getElementById('lista-pendientes');
    cont.innerHTML = '<p class="text-slate-400 text-center py-6">Cargando...</p>';

    const { data, error } = await supabaseClient
        .from('perfiles')
        .select('id, usuario, email, permiso, turno, area, creado_en')
        .eq('aprobado', false)
        .order('creado_en', { ascending: true });

    if (error) {
        cont.innerHTML = `<p class="text-red-600 text-center py-6">Error: ${error.message}</p>`;
        return;
    }
    if (!data || data.length === 0) {
        cont.innerHTML = '<p class="text-slate-400 text-center py-6">No hay usuarios pendientes. âœ…</p>';
        return;
    }

    cont.innerHTML = data.map(u => `
        <div class="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
                <p class="font-semibold text-slate-900">${u.usuario} <span class="text-xs font-normal text-slate-400">Â· ${u.email || ''}</span></p>
                <p class="text-xs text-slate-500 mt-0.5">
                    Permiso: <span class="font-medium">${u.permiso === 'escritura' ? 'Escritura' : 'Solo Lectura'}</span>
                    Â· Turno ${u.turno} Â· Ãrea ${u.area}
                </p>
            </div>
            <div class="flex items-center space-x-2 shrink-0">
                <button onclick="aprobarUsuario('${u.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                    <i class="fa-solid fa-check mr-1"></i> Aprobar
                </button>
                <button onclick="rechazarUsuario('${u.id}', '${u.usuario.replace(/'/g, "\\'")}')" class="bg-slate-100 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition">
                    <i class="fa-solid fa-xmark mr-1"></i> Rechazar
                </button>
            </div>
        </div>
    `).join('');
}

async function aprobarUsuario(id) {
    const { error } = await supabaseClient.from('perfiles').update({ aprobado: true }).eq('id', id);
    if (error) { alert(`Error: ${error.message}`); return; }
    await cargarPendientes();
    await actualizarBadgePendientes();
}

async function rechazarUsuario(id, usuario) {
    if (!confirm(`Â¿Rechazar a "${usuario}"?`)) return;
    const { error } = await supabaseClient.from('perfiles').delete().eq('id', id);
    if (error) { alert(`Error: ${error.message}`); return; }
    await cargarPendientes();
    await actualizarBadgePendientes();
}

function aplicarSesionEnInterfaz(sesion) {
    const nombreEl = document.getElementById('user-badge-nombre');
    const rolEl = document.getElementById('user-badge-rol');
    const emailEl = document.getElementById('user-badge-email');
    if (nombreEl) nombreEl.innerText = sesion.usuario;
    if (rolEl) {
        const etiquetaRol = sesion.rol === 'admin' ? 'Administrador'
            : sesion.rol === 'invitado' ? 'Invitado Â· Solo Lectura'
            : (sesion.permiso === 'escritura' ? 'Operador Â· Escritura' : 'Operador Â· Solo Lectura');
        rolEl.innerText = `${etiquetaRol} Â· Turno ${sesion.turno} Â· ${sesion.area}`;
    }
    if (emailEl) {
        const esCorreoInterno = !sesion.email || sesion.email.endsWith(LEGACY_EMAIL_DOMAIN);
        emailEl.innerText = esCorreoInterno ? '' : sesion.email;
    }

    const btnPendientes = document.getElementById('btn-usuarios-pendientes');
    if (btnPendientes) {
        if (sesion.rol === 'admin') {
            btnPendientes.classList.remove('hidden');
            actualizarBadgePendientes();
        } else {
            btnPendientes.classList.add('hidden');
        }
    }
}

