# 🏗️ Arquitectura Modular - Sistema de Gestión de Camas Hospitalarias

## Resumen de la Estructura

El sistema ha sido dividido en **8 módulos JavaScript independientes** para facilitar mantenimiento, debugging y actualizaciones sin cargar todo el código a la vez.

```
sistemaugcc/
├── index.html                    # HTML ligero (solo estructura)
├── js/                           # Módulos JavaScript
│   ├── config.js                 # Configuración global
│   ├── auth.js                   # Autenticación y sesiones
│   ├── utils.js                  # Funciones auxiliares
│   ├── google-sheets.js          # Integración Google Sheets
│   ├── dashboard.js              # Dashboard y KPIs
│   ├── modules.js                # Módulos personalizados
│   ├── ui.js                     # Interfaz y impresión
│   └── main.js                   # Inicialización
├── docs/
│   └── ARCHITECTURE.md           # Este archivo
└── gestor_de_camas_hospitalarioINDEX_V2_23.html  # Backup original
```

---

## 📋 Descripción de Módulos

### 1. **config.js** (Configuración Global)
**Responsabilidad**: Constantes, credenciales, configuración Supabase.

**Exports**:
- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_ANON_KEY` - Clave pública de Supabase
- `ADMIN_EMAIL` - Correo del administrador
- `supabaseClient` - Cliente de Supabase inicializado
- `sesionActiva` - Estado global de la sesión actual
- `SHEET_URLS` - Mapeo de módulos a URLs de Google Sheets

**Dependencias**: Supabase SDK (cargado desde CDN)

**Ejemplo de uso**:
```javascript
// En auth.js o cualquier módulo
if (!supabaseClient) {
    console.error('Supabase no configurado');
}
```

---

### 2. **auth.js** (Autenticación y Sesiones)
**Responsabilidad**: Login, registro, aprobación de usuarios, gestión de sesiones.

**Funciones principales**:
- `iniciarSesion(event)` - Login con usuario/contraseña
- `registrarOperador(event)` - Registro de nuevos operadores
- `ingresarInvitado()` - Acceso sin credenciales
- `cerrarSesion()` - Logout
- `abrirSesion(sesion)` - Activar sesión en la interfaz
- `esInvitado()` - Verificar si es invitado
- `bloquearSiInvitado(mensaje)` - Restricción de funciones para invitados
- `actualizarBadgePendientes()` - Contador de usuarios pendientes (admin)
- `cargarPendientes()` - Listar usuarios por aprobar
- `aprobarUsuario(id)` - Aprobar un usuario
- `rechazarUsuario(id, usuario)` - Rechazar y eliminar un usuario
- `aplicarSesionEnInterfaz(sesion)` - Actualizar UI con datos de sesión
- `restaurarSesion()` - Recuperar sesión de Supabase al cargar

**Dependencias**: `config.js`

**Nota**: Las contraseñas **nunca** se manejan en texto plano. Supabase Auth (bcrypt) valida en servidor.

---

### 3. **utils.js** (Funciones Auxiliares)
**Responsabilidad**: Herramientas de uso general (parsing, slugs, colores, etc).

**Funciones principales**:
- `updateClock()` - Reloj de tiempo real (actualiza cada segundo)
- `slugify(texto)` - Convierte texto a slug (ej: "Mi Módulo" → "mi-modulo")
- `parseCelda(celda)` - Limpia valores de celdas Google Sheets
- `pareceEncabezado(fila)` - Detecta si una fila es encabezado
- `getBanColor(color)` - Mapea colores a clases Tailwind CSS

**Dependencias**: Ninguna

---

### 4. **google-sheets.js** (Integración Google Sheets)
**Responsabilidad**: Lectura de datos desde Google Sheets mediante API.

**Funciones principales**:
- `guardarTokenGoogle(token, expiresIn)` - Almacenar token OAuth de Google
- `obtenerTokenGoogleVigente()` - Recuperar token si aún es válido
- `actualizarBotonGoogle()` - Cambiar estado del botón de conexión
- `conectarGoogle()` - Iniciar flujo OAuth con Google
- `leerConAPIOficial(spreadsheetId, sheetName, rango)` - Lectura via API oficial (requiere token)
- `leerCeldaGviz(sheetName, cellRef)` - Lectura de una celda individual (sin token)
- `leerSumaCeldas(sheetName, cellRefs)` - Sumar múltiples celdas
- `leerRangoGviz(sheetName, rango)` - Leer rango completo de celdas

**Dependencias**: `config.js`

**Nota**: Google Sheets permite dos formas de lectura:
1. **API oficial** (requiere OAuth) - Datos privados/privados
2. **Gviz (Google Visualization)** - Sin autenticación, sheets públicos o que permitan acceso

---

### 5. **dashboard.js** (Dashboard y KPIs)
**Responsabilidad**: Cargar y renderizar el dashboard principal con tarjetas de ocupación.

**Funciones principales**:
- `cargarKpisCamasCriticas()` - Obtener datos de camas críticas desde Sheets
- `pintarKpiCard(prefix, data)` - Renderizar tarjeta de KPI
- `construirCeldasCamasCriticas()` - Mapear referencias de celdas
- `cargarMatricesInforme()` - Cargar matrices de datos del informe
- `pintarMatrizPorTipos(contenedorId, bloque)` - Renderizar matriz de ocupación
- `pintarResumenOcupacionalInforme()` - Resumen general de ocupación

**Dependencias**: `config.js`, `google-sheets.js`

---

### 6. **modules.js** (Módulos Personalizados)
**Responsabilidad**: Gestión de módulos personalizados (crear, eliminar, navegación).

**Funciones principales**:
- `getSheetUrl(modId)` - Obtener URL de Google Sheets para un módulo
- `openModuleSheet(modId)` - Abrir Sheet en nueva pestaña
- `navigateToModule(modId)` - Navegar a un módulo
- `switchModule(modId)` - Cambiar pestaña de módulo
- `cargarModulosCustomDesdeSupabase()` - Obtener módulos personalizados de la BD
- `crearModuloCustom(event)` - Crear nuevo módulo
- `eliminarModuloCustom(id)` - Eliminar un módulo
- `renderModulosCustom(reconstruirNav)` - Renderizar lista de módulos
- `cargarModuloCustom(id)` - Cargar datos de un módulo

**Dependencias**: `config.js`, `auth.js`, `utils.js`

---

### 7. **ui.js** (Interfaz y Impresión)
**Responsabilidad**: Componentes UI, impresión, modales, y configuración.

**Funciones principales**:
- `imprimirPlanillaInhabil()` - Exportar planilla a PDF
- `imprimirSolicitudPabellon()` - Exportar solicitud a PDF
- `renderBedPlan()` - Renderizar plano de camas
- `getBedCardHTML(bed)` - HTML para tarjeta de cama
- `pintarTablaSolicitudes(tbodyId, filas, columnas)` - Renderizar tabla
- `cargarSolicitudesSalida()` - Obtener solicitudes de Sheets
- `pintarResidentesSimplificado(theadId, tbodyId, filas)` - Renderizar tabla de residentes
- `cargarResidentesTurno()` - Obtener residentes del turno
- `getCelda(clave)` / `getCeldasLista(clave)` - Leer configuración
- `guardarCelda(clave, valor)` - Guardar configuración
- `restaurarCeldaPorDefecto(clave)` - Resetear configuración

**Dependencias**: `config.js`, `auth.js`, `google-sheets.js`

**Nota**: Usa `html2pdf.js` (CDN) para generar PDFs.

---

### 8. **main.js** (Inicialización)
**Responsabilidad**: Punto de entrada, inicialización de la aplicación.

**Funciones principales**:
- Event listener `DOMContentLoaded` - Ejecuta al cargar la página
- `restaurarSesion()` - Verificar si existe sesión activa

**Dependencias**: Todos los módulos anteriores

**Flujo de carga**:
1. HTML se carga
2. Se cargan los módulos JS en orden
3. Al terminar de cargar (DOMContentLoaded):
   - Inicializar reloj
   - Restaurar sesión desde Supabase
   - Cargar módulos personalizados
   - Mostrar login o dashboard

---

## 🔄 Flujo de Datos

```
index.html (carga)
    ↓
config.js (inicializa Supabase)
    ↓
auth.js + otros módulos (escuchan eventos)
    ↓
main.js (DOMContentLoaded)
    ↓
restaurarSesion()
    ↓
Mostrar Dashboard o Login
```

---

## 🔐 Restricciones por Rol

| Acción | Admin | Operador | Invitado |
|--------|-------|----------|----------|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver módulos | ✅ | ✅ | ❌ |
| Crear módulos | ✅ | ❌ | ❌ |
| Aprobar usuarios | ✅ | ❌ | ❌ |
| Imprimir PDFs | ✅ | ✅ | ❌ |

---

## 🎯 Cómo Actualizar un Módulo

**Caso: Quieres agregar una nueva función al dashboard**

1. Abre `js/dashboard.js`
2. Busca la función relacionada
3. Realiza los cambios
4. **No necesitas tocar nada más** - el módulo se recarga automáticamente

**Ventajas**:
- Otros módulos no se ven afectados
- Los cambios son aislados
- Puedo revisarlos sin cargar 3500+ líneas

---

## 📚 Guía de Referencias

Cuando necesites trabajar con algo específico:

| Necesito... | Ir a... |
|------------|---------|
| Cambiar config Supabase | `config.js` |
| Modificar login/registro | `auth.js` |
| Agregar función auxiliar | `utils.js` |
| Integrar nueva Sheet | `google-sheets.js` |
| Diseñar nuevo dashboard | `dashboard.js` |
| Crear/editar módulos personalizados | `modules.js` |
| Cambiar UI o impresión | `ui.js` |
| Alterar secuencia de inicio | `main.js` |

---

## 🧪 Testing Módulos Independientes

Para testear un módulo sin cargar todo:

```html
<!-- Crear archivo test-modulo.html -->
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
<!-- Cargar SOLO el módulo a testear -->
<script src="js/tu-modulo.js"></script>
<script>
    // Pruebas aquí
    console.log(tuFuncion());
</script>
```

---

## 📝 Notas de Mantenimiento

- **Dependencias circulares**: Evitar que módulo A dependa de B y B de A
- **Estado global**: Minimizar. Usar `sesionActiva` de `config.js`
- **Orden de carga**: Respetarlo (ver imports en `index.html`)
- **Fallback**: Si un módulo falla, otros siguen funcionando

---

## 🚀 Siguientes Pasos (Si necesitas más modularización)

1. **Separar HTML por vista**: `views/login.html`, `views/dashboard.html`
2. **Componentes Web**: Usar Custom Elements para partes reutilizables
3. **Build tool**: Webpack/Vite para bundling automático
4. **Tests**: Archivo por módulo con tests unitarios

