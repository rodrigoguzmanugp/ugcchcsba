// ===================================================================
// MAIN.JS - InicializaciÃ³n de la aplicaciÃ³n
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('ðŸš€ Iniciando Sistema de GestiÃ³n de Camas Hospitalarias...');

    // Verificar Supabase
    if (!supabaseClient) {
        document.getElementById('supabase-config-warning').classList.remove('hidden');
    }

    // Inicializar reloj
    updateClock();

    // Intentar restaurar sesiÃ³n
    await restaurarSesion();

    // Cargar mÃ³dulos personalizados si existen
    if (!esInvitado()) {
        await renderModulosCustom(true);
    }

    console.log('âœ“ AplicaciÃ³n lista');
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
    // No hay sesiÃ³n: mostrar login
    document.getElementById('login-screen').classList.remove('hidden');
}
