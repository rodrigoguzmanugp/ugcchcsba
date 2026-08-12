// ===================================================================
// UTILS.JS - Funciones auxiliares generales
// ===================================================================

function updateClock() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    }
    setTimeout(updateClock, 60000);
}

function slugify(texto) {
    return String(texto)
        .toLowerCase()
        .replace(/[áéíóú]/g, v => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' })[v] || v)
        .replace(/ñ/g, 'n')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function parseCelda(celda) {
    if (!celda) return '';
    const str = String(celda).trim();
    if (str === '0' || str === '-') return '';
    return str;
}

function pareceEncabezado(fila) {
    if (!fila || fila.length === 0) return false;
    const primerValor = String(fila[0]).toLowerCase();
    return ['nombre', 'usuario', 'codigo', 'id', 'descripcion', 'title'].some(h => primerValor.includes(h));
}

function getBanColor(color) {
    const colores = {
        'rojo':     'bg-red-100 text-red-800',
        'azul':     'bg-blue-100 text-blue-800',
        'verde':    'bg-green-100 text-green-800',
        'amarillo': 'bg-yellow-100 text-yellow-800',
        'purpura':  'bg-purple-100 text-purple-800',
        'rosa':     'bg-pink-100 text-pink-800',
    };
    return colores[String(color).toLowerCase()] || 'bg-slate-100 text-slate-800';
}
