// ===================================================================
// MAIN.JS - Inicialización de la aplicación
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Sistema de Gestión de Camas Hospitalarias...');

    // Verificar Supabase
    if (!supabaseClient) {
        document.getElementById('supabase-config-warning').classList.remove('hidden');
    }

    // Inicializar reloj
    updateClock();

    // Intentar restaurar sesión
    await restaurarSesion();

    // Cargar módulos personalizados si existen
    if (!esInvitado()) {
        await renderModulosCustom(true);
    }

    console.log('✓ Aplicación lista');
});

async function restaurarSesion() {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) {
        const { data: perfil } = await supabaseClient
            .from('perfiles')
            .select('usuario, rol, permiso, turno, area')
            .eq('id', data.session.user.id)
            .single();

        if (perfil) {
            sesionActiva = {
                usuario: perfil.usuario,
                rol: perfil.rol,
                permiso: perfil.permiso,
                turno: perfil.turno || 'Largo',
                area: perfil.area || 'Ambas',
                email: extraerCorreoParaMostrar(data.session.user)
            };
            abrirSesion(sesionActiva);
            return;
        }
    }
    // No hay sesión: mostrar login
    document.getElementById('login-screen').classList.remove('hidden');
}
