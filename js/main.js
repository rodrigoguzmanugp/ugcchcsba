// ===================================================================
// MAIN.JS - Inicializacion de la aplicacion
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando Sistema de Gestion de Camas Hospitalarias...');

    // Reloj
    if (typeof updateClock === 'function') updateClock();

    // Cargar URLs de sheets desde localStorage
    if (typeof cargarEnlacesConfig === 'function') cargarEnlacesConfig();

    // Cargar config de celdas desde Supabase
    if (typeof cargarConfigCeldas === 'function') await cargarConfigCeldas();

    // Cargar modulos custom
    if (typeof renderModulosCustom === 'function') await renderModulosCustom(true);

    // Intentar restaurar sesion existente de Supabase
    await restaurarSesion();

    console.log('Aplicacion lista.');
});

async function restaurarSesion() {
    if (!supabaseClient) return;

    const { data } = await supabaseClient.auth.getSession();
    if (!data?.session) {
        // Sin sesion activa: asegurarse de mostrar login
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.remove('hidden');
        return;
    }

    const email = data.session.user.email;
    const { data: perfil } = await supabaseClient
        .from('perfiles')
        .select('nombre, rol, estado')
        .eq('email', email)
        .maybeSingle();

    if (perfil && perfil.estado === 'activo') {
        sesionActiva = {
            usuario: perfil.nombre,
            rol:     perfil.rol,
            permiso: perfil.rol === 'admin' ? 'escritura' : 'lectura',
            turno:   'Largo',
            area:    'Ambas',
            email:   extraerCorreoParaMostrar(data.session.user)
        };
        abrirSesion(sesionActiva);
    } else {
        // Sesion de Supabase existe pero perfil no activo: cerrar sesion
        await supabaseClient.auth.signOut();
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.remove('hidden');
    }
}
