// ===================================================================
// AUTH.JS - Autenticacion, login, registro y sesiones
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

    if (!supabaseClient) {
        errorEl.innerText = 'Supabase no esta configurado.';
        errorEl.classList.remove('hidden');
        return;
    }

    const usuario = document.getElementById('login-usuario').value.trim();
    const clave   = document.getElementById('login-clave').value;
    const turno   = document.getElementById('login-turno').value;
    const area    = document.getElementById('login-area').value;
    const boton   = event.submitter;
    if (boton) { boton.disabled = true; boton.innerText = 'Ingresando...'; }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: usuarioAEmail(usuario),
        password: clave
    });

    if (error) {
        const msg = error.message.includes('Email not confirmed')
            ? 'Confirma tu correo antes de ingresar (revisa spam).'
            : `Usuario o contrasena incorrectos. (${error.message})`;
        errorEl.innerText = msg;
        errorEl.classList.remove('hidden');
        if (boton) { boton.disabled = false; boton.innerText = 'Ingresar al Panel'; }
        return;
    }

    const { data: perfil, error: errPerfil } = await supabaseClient
        .from('perfiles')
        .select('nombre, rol, estado')
        .eq('email', data.user.email)
        .maybeSingle();

    if (errPerfil || !perfil) {
        errorEl.innerText = 'Tu cuenta no tiene perfil. Contacta al administrador.';
        errorEl.classList.remove('hidden');
        await supabaseClient.auth.signOut();
        if (boton) { boton.disabled = false; boton.innerText = 'Ingresar al Panel'; }
        return;
    }

    if (perfil.estado !== 'activo') {
        const msg = perfil.estado === 'pendiente'
            ? `Cuenta pendiente de aprobacion. Contacta a ${ADMIN_EMAIL}.`
            : `Cuenta bloqueada. Contacta a ${ADMIN_EMAIL}.`;
        errorEl.innerText = msg;
        errorEl.classList.remove('hidden');
        await supabaseClient.auth.signOut();
        if (boton) { boton.disabled = false; boton.innerText = 'Ingresar al Panel'; }
        return;
    }

    abrirSesion({
        usuario: perfil.nombre,
        rol:     perfil.rol,
        permiso: perfil.rol === 'admin' ? 'escritura' : 'lectura',
        turno,
        area,
        email:   extraerCorreoParaMostrar(data.user)
    });
}

function ingresarInvitado() {
    const turno = document.getElementById('login-turno').value;
    const area  = document.getElementById('login-area').value;
    abrirSesion({ usuario: 'Invitado', rol: 'invitado', permiso: 'lectura', turno, area });
}

async function registrarOperador(event) {
    event.preventDefault();
    const errorEl = document.getElementById('registro-error');
    const okEl    = document.getElementById('registro-ok');
    errorEl.classList.add('hidden');
    okEl.classList.add('hidden');

    if (!supabaseClient) {
        errorEl.innerText = 'Supabase no esta configurado.';
        errorEl.classList.remove('hidden');
        return;
    }

    const usuario = document.getElementById('reg-usuario').value.trim();
    const email   = document.getElementById('reg-email').value.trim().toLowerCase();
    const clave   = document.getElementById('reg-clave').value;
    const permiso = document.getElementById('reg-permiso').value;
    const turno   = document.getElementById('reg-turno').value;
    const area    = document.getElementById('reg-area').value;
    const boton   = event.submitter;

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
        errorEl.innerText = 'Debes registrarte con un correo @gmail.com valido.';
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
            ? 'Ese correo ya esta registrado.'
            : `Error: ${error.message}`;
        errorEl.classList.remove('hidden');
        if (boton) { boton.disabled = false; boton.innerText = 'Registrar Operador'; }
        return;
    }

    const { error: errPerfil } = await supabaseClient
        .from('perfiles')
        .insert({ email, nombre: usuario, rol: 'operador', estado: 'pendiente', turno, area });

    if (errPerfil) {
        console.warn('Perfil no creado automaticamente:', errPerfil.message);
    }

    okEl.innerText = `Registro enviado para "${usuario}" (${email}). Confirma tu correo y espera aprobacion del administrador.`;
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
        alert(mensaje || 'El modo Invitado solo permite consultar el Dashboard.');
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
    if (typeof actualizarBotonGoogle === 'function') actualizarBotonGoogle();
}

async function cerrarSesion() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    location.reload();
}

function aplicarSesionEnInterfaz(sesion) {
    const nombreEl = document.getElementById('user-badge-nombre');
    const rolEl    = document.getElementById('user-badge-rol');
    const emailEl  = document.getElementById('user-badge-email');

    if (nombreEl) nombreEl.innerText = sesion.usuario;
    if (rolEl) {
        const etiqueta = sesion.rol === 'admin'    ? 'Administrador'
                       : sesion.rol === 'invitado' ? 'Invitado · Solo Lectura'
                       : sesion.permiso === 'escritura' ? 'Operador · Escritura'
                       : 'Operador · Solo Lectura';
        rolEl.innerText = `${etiqueta} · Turno ${sesion.turno} · ${sesion.area}`;
    }
    if (emailEl) {
        const esInterno = !sesion.email || sesion.email.endsWith(LEGACY_EMAIL_DOMAIN);
        emailEl.innerText = esInterno ? '' : sesion.email;
    }

    // Mostrar boton de usuarios pendientes solo para admin
    const btnPendientes = document.getElementById('btn-usuarios-pendientes');
    if (btnPendientes) {
        if (sesion.rol === 'admin') {
            btnPendientes.classList.remove('hidden');
            actualizarBadgePendientes();
        } else {
            btnPendientes.classList.add('hidden');
        }
    }

    // Mostrar Config. Celdas solo para admin
    const navConfig = document.getElementById('nav-config-celdas');
    if (navConfig) {
        if (sesion.rol === 'admin') {
            navConfig.classList.remove('hidden');
        } else {
            navConfig.classList.add('hidden');
        }
    }

    // Bloquear botones restringidos para invitados
    if (sesion.rol === 'invitado') {
        document.querySelectorAll('[data-restrict-guest="true"]').forEach(el => {
            el.classList.add('opacity-50', 'cursor-not-allowed');
            el.setAttribute('title', 'No disponible en modo Invitado');
        });
    }

    // Bloquear botones de escritura para no-admin/no-escritura
    if (sesion.permiso !== 'escritura') {
        document.querySelectorAll('[data-requires-write="true"]').forEach(el => {
            el.classList.add('opacity-50', 'cursor-not-allowed');
        });
    }
}

// ---------------------------------------------------------------
// Panel de aprobacion de usuarios (solo admin)
// ---------------------------------------------------------------

async function actualizarBadgePendientes() {
    if (!sesionActiva || sesionActiva.rol !== 'admin' || !supabaseClient) return;
    const { count } = await supabaseClient
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'pendiente');
    const badge = document.getElementById('badge-pendientes');
    if (!badge) return;
    if (count && count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function abrirPanelAprobaciones() {
    const modal = document.getElementById('modal-aprobaciones');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    cargarPendientes();
}

function cerrarPanelAprobaciones() {
    const modal = document.getElementById('modal-aprobaciones');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
}

async function cargarPendientes() {
    const cont = document.getElementById('lista-pendientes');
    if (!cont) return;
    cont.innerHTML = '<p class="text-slate-400 text-center py-6">Cargando...</p>';

    const { data, error } = await supabaseClient
        .from('perfiles')
        .select('id, nombre, email, rol, turno, area')
        .eq('estado', 'pendiente')
        .order('email', { ascending: true });

    if (error) {
        cont.innerHTML = `<p class="text-red-600 text-center py-6">Error: ${error.message}</p>`;
        return;
    }
    if (!data || data.length === 0) {
        cont.innerHTML = '<p class="text-slate-400 text-center py-6">No hay usuarios pendientes. ✅</p>';
        return;
    }

    cont.innerHTML = data.map(u => `
        <div class="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
                <p class="font-semibold text-slate-900">${u.nombre || '-'} <span class="text-xs font-normal text-slate-400">· ${u.email || ''}</span></p>
                <p class="text-xs text-slate-500 mt-0.5">Turno ${u.turno || '-'} · Area ${u.area || '-'}</p>
            </div>
            <div class="flex items-center space-x-2 shrink-0">
                <button onclick="aprobarUsuario('${u.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                    <i class="fa-solid fa-check mr-1"></i> Aprobar
                </button>
                <button onclick="rechazarUsuario('${u.id}', '${(u.nombre || '').replace(/'/g, "\\'")}') " class="bg-slate-100 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-2 rounded-lg transition">
                    <i class="fa-solid fa-xmark mr-1"></i> Rechazar
                </button>
            </div>
        </div>
    `).join('');
}

async function aprobarUsuario(id) {
    const { error } = await supabaseClient.from('perfiles').update({ estado: 'activo' }).eq('id', id);
    if (error) { alert(`Error: ${error.message}`); return; }
    await cargarPendientes();
    await actualizarBadgePendientes();
}

async function rechazarUsuario(id, nombre) {
    if (!confirm(`¿Rechazar a "${nombre}"?`)) return;
    const { error } = await supabaseClient.from('perfiles').update({ estado: 'bloqueado' }).eq('id', id);
    if (error) { alert(`Error: ${error.message}`); return; }
    await cargarPendientes();
    await actualizarBadgePendientes();
}
