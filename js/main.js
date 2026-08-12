// ===================================================================
// MAIN.JS - Inicialización de la aplicación
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Sistema de Gestión de Camas Hospitalarias...');

    if (!supabaseClient) {
        const warning = document.getElementById('supabase-config-warning');
        if (warning) warning.classList.remove('hidden');
    }

    if (typeof updateClock === 'function') {
        updateClock();
    }

    await restaurarSesion();
    console.log('✓ Aplicación lista');
});

async function restaurarSesion() {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('nombre, rol, estado')
            .eq('email', data.session.user.email)
            .single();

        if (perfil && perfil.estado === 'activo') {
            sesionActiva = {
                usuario: perfil.nombre,
                rol: perfil.rol,
                permiso: perfil.rol === 'admin' ? 'escritura' : 'lectura',
                turno: 'Largo',
                area: 'Ambas',
                email: extraerCorreoParaMostrar(data.session.user)
            };
            abrirSesion(sesionActiva);
            return;
        }
    }
    if (document.getElementById('login-screen')) {
        document.getElementById('login-screen').classList.remove('hidden');
    }
}
