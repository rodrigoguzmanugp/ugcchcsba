# ðŸ—ï¸ Arquitectura Modular - Sistema de GestiÃ³n de Camas Hospitalarias

## Resumen de la Estructura

El sistema ha sido dividido en **8 mÃ³dulos JavaScript independientes** para facilitar mantenimiento, debugging y actualizaciones sin cargar todo el cÃ³digo a la vez.

```
sistemaugcc/
â”œâ”€â”€ index.html                    # HTML ligero (solo estructura)
â”œâ”€â”€ js/                           # MÃ³dulos JavaScript
â”‚   â”œâ”€â”€ config.js                 # ConfiguraciÃ³n global
â”‚   â”œâ”€â”€ auth.js                   # AutenticaciÃ³n y sesiones
â”‚   â”œâ”€â”€ utils.js                  # Funciones auxiliares
â”‚   â”œâ”€â”€ google-sheets.js          # IntegraciÃ³n Google Sheets
â”‚   â”œâ”€â”€ dashboard.js              # Dashboard y KPIs
â”‚   â”œâ”€â”€ modules.js                # MÃ³dulos personalizados
â”‚   â”œâ”€â”€ ui.js                     # Interfaz y impresiÃ³n
â”‚   â””â”€â”€ main.js                   # InicializaciÃ³n
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ ARCHITECTURE.md           # Este archivo
â””â”€â”€ gestor_de_camas_hospitalarioINDEX_V2_23.html  # Backup original
```

---

## ðŸ“‹ DescripciÃ³n de MÃ³dulos

### 1. **config.js** (ConfiguraciÃ³n Global)
**Responsabilidad**: Constantes, credenciales, configuraciÃ³n Supabase.

**Exports**:
- `SUPABASE_URL` - URL del proyecto Supabase
- `SUPABASE_ANON_KEY` - Clave pÃºblica de Supabase
- `ADMIN_EMAIL` - Correo del administrador
- `supabaseClient` - Cliente de Supabase inicializado
- `sesionActiva` - Estado global de la sesiÃ³n actual
- `SHEET_URLS` - Mapeo de mÃ³dulos a URLs de Google Sheets

**Dependencias**: Supabase SDK (cargado desde CDN)

**Ejemplo de uso**:
```javascript
// En auth.js o cualquier mÃ³dulo
if (!supabaseClient) {
    console.error('Supabase no configurado');
}
```

---

### 2. **auth.js** (AutenticaciÃ³n y Sesiones)
**Responsabilidad**: Login, registro, aprobaciÃ³n de usuarios, gestiÃ³n de sesiones.

**Funciones principales**:
- `iniciarSesion(event)` - Login con usuario/contraseÃ±a
- `registrarOperador(event)` - Registro de nuevos operadores
- `ingresarInvitado()` - Acceso sin credenciales
- `cerrarSesion()` - Logout
- `abrirSesion(sesion)` - Activar sesiÃ³n en la interfaz
- `esInvitado()` - Verificar si es invitado
- `bloquearSiInvitado(mensaje)` - RestricciÃ³n de funciones para invitados
- `actualizarBadgePendientes()` - Contador de usuarios pendientes (admin)
- `cargarPendientes()` - Listar usuarios por aprobar
- `aprobarUsuario(id)` - Aprobar un usuario
- `rechazarUsuario(id, usuario)` - Rechazar y eliminar un usuario
- `aplicarSesionEnInterfaz(sesion)` - Actualizar UI con datos de sesiÃ³n
- `restaurarSesion()` - Recuperar sesiÃ³n de Supabase al cargar

**Dependencias**: `config.js`

**Nota**: Las contraseÃ±as **nunca** se manejan en texto plano. Supabase Auth (bcrypt) valida en servidor.

---

### 3. **utils.js** (Funciones Auxiliares)
**Responsabilidad**: Herramientas de uso general (parsing, slugs, colores, etc).

**Funciones principales**:
- `updateClock()` - Reloj de tiempo real (actualiza cada segundo)
- `slugify(texto)` - Convierte texto a slug (ej: "Mi MÃ³dulo" â†’ "mi-modulo")
- `parseCelda(celda)` - Limpia valores de celdas Google Sheets
- `pareceEncabezado(fila)` - Detecta si una fila es encabezado
- `getBanColor(color)` - Mapea colores a clases Tailwind CSS

**Dependencias**: Ninguna

---

### 4. **google-sheets.js** (IntegraciÃ³n Google Sheets)
**Responsabilidad**: Lectura de datos desde Google Sheets mediante API.

**Funciones principales**:
- `guardarTokenGoogle(token, expiresIn)` - Almacenar token OAuth de Google
- `obtenerTokenGoogleVigente()` - Recuperar token si aÃºn es vÃ¡lido
- `actualizarBotonGoogle()` - Cambiar estado del botÃ³n de conexiÃ³n
- `conectarGoogle()` - Iniciar flujo OAuth con Google
- `leerConAPIOficial(spreadsheetId, sheetName, rango)` - Lectura via API oficial (requiere token)
- `leerCeldaGviz(sheetName, cellRef)` - Lectura de una celda individual (sin token)
- `leerSumaCeldas(sheetName, cellRefs)` - Sumar mÃºltiples celdas
- `leerRangoGviz(sheetName, rango)` - Leer rango completo de celdas

**Dependencias**: `config.js`

**Nota**: Google Sheets permite dos formas de lectura:
1. **API oficial** (requiere OAuth) - Datos privados/privados
2. **Gviz (Google Visualization)** - Sin autenticaciÃ³n, sheets pÃºblicos o que permitan acceso

---

### 5. **dashboard.js** (Dashboard y KPIs)
**Responsabilidad**: Cargar y renderizar el dashboard principal con tarjetas de ocupaciÃ³n.

**Funciones principales**:
- `cargarKpisCamasCriticas()` - Obtener datos de camas crÃ­ticas desde Sheets
- `pintarKpiCard(prefix, data)` - Renderizar tarjeta de KPI
- `construirCeldasCamasCriticas()` - Mapear referencias de celdas
- `cargarMatricesInforme()` - Cargar matrices de datos del informe
- `pintarMatrizPorTipos(contenedorId, bloque)` - Renderizar matriz de ocupaciÃ³n
- `pintarResumenOcupacionalInforme()` - Resumen general de ocupaciÃ³n

**Dependencias**: `config.js`, `google-sheets.js`

---

### 6. **modules.js** (MÃ³dulos Personalizados)
**Responsabilidad**: GestiÃ³n de mÃ³dulos personalizados (crear, eliminar, navegaciÃ³n).

**Funciones principales**:
- `getSheetUrl(modId)` - Obtener URL de Google Sheets para un mÃ³dulo
- `openModuleSheet(modId)` - Abrir Sheet en nueva pestaÃ±a
- `navigateToModule(modId)` - Navegar a un mÃ³dulo
- `switchModule(modId)` - Cambiar pestaÃ±a de mÃ³dulo
- `cargarModulosCustomDesdeSupabase()` - Obtener mÃ³dulos personalizados de la BD
- `crearModuloCustom(event)` - Crear nuevo mÃ³dulo
- `eliminarModuloCustom(id)` - Eliminar un mÃ³dulo
- `renderModulosCustom(reconstruirNav)` - Renderizar lista de mÃ³dulos
- `cargarModuloCustom(id)` - Cargar datos de un mÃ³dulo

**Dependencias**: `config.js`, `auth.js`, `utils.js`

---

### 7. **ui.js** (Interfaz y ImpresiÃ³n)
**Responsabilidad**: Componentes UI, impresiÃ³n, modales, y configuraciÃ³n.

**Funciones principales**:
- `imprimirPlanillaInhabil()` - Exportar planilla a PDF
- `imprimirSolicitudPabellon()` - Exportar solicitud a PDF
- `renderBedPlan()` - Renderizar plano de camas
- `getBedCardHTML(bed)` - HTML para tarjeta de cama
- `pintarTablaSolicitudes(tbodyId, filas, columnas)` - Renderizar tabla
- `cargarSolicitudesSalida()` - Obtener solicitudes de Sheets
- `pintarResidentesSimplificado(theadId, tbodyId, filas)` - Renderizar tabla de residentes
- `cargarResidentesTurno()` - Obtener residentes del turno
- `getCelda(clave)` / `getCeldasLista(clave)` - Leer configuraciÃ³n
- `guardarCelda(clave, valor)` - Guardar configuraciÃ³n
- `restaurarCeldaPorDefecto(clave)` - Resetear configuraciÃ³n

**Dependencias**: `config.js`, `auth.js`, `google-sheets.js`

**Nota**: Usa `html2pdf.js` (CDN) para generar PDFs.

---

### 8. **main.js** (InicializaciÃ³n)
**Responsabilidad**: Punto de entrada, inicializaciÃ³n de la aplicaciÃ³n.

**Funciones principales**:
- Event listener `DOMContentLoaded` - Ejecuta al cargar la pÃ¡gina
- `restaurarSesion()` - Verificar si existe sesiÃ³n activa

**Dependencias**: Todos los mÃ³dulos anteriores

**Flujo de carga**:
1. HTML se carga
2. Se cargan los mÃ³dulos JS en orden
3. Al terminar de cargar (DOMContentLoaded):
   - Inicializar reloj
   - Restaurar sesiÃ³n desde Supabase
   - Cargar mÃ³dulos personalizados
   - Mostrar login o dashboard

---

## ðŸ”„ Flujo de Datos

```
index.html (carga)
    â†“
config.js (inicializa Supabase)
    â†“
auth.js + otros mÃ³dulos (escuchan eventos)
    â†“
main.js (DOMContentLoaded)
    â†“
restaurarSesion()
    â†“
Mostrar Dashboard o Login
```

---

## ðŸ” Restricciones por Rol

| AcciÃ³n | Admin | Operador | Invitado |
|--------|-------|----------|----------|
| Ver Dashboard | âœ… | âœ… | âœ… |
| Ver mÃ³dulos | âœ… | âœ… | âŒ |
| Crear mÃ³dulos | âœ… | âŒ | âŒ |
| Aprobar usuarios | âœ… | âŒ | âŒ |
| Imprimir PDFs | âœ… | âœ… | âŒ |

---

## ðŸŽ¯ CÃ³mo Actualizar un MÃ³dulo

**Caso: Quieres agregar una nueva funciÃ³n al dashboard**

1. Abre `js/dashboard.js`
2. Busca la funciÃ³n relacionada
3. Realiza los cambios
4. **No necesitas tocar nada mÃ¡s** - el mÃ³dulo se recarga automÃ¡ticamente

**Ventajas**:
- Otros mÃ³dulos no se ven afectados
- Los cambios son aislados
- Puedo revisarlos sin cargar 3500+ lÃ­neas

---

## ðŸ“š GuÃ­a de Referencias

Cuando necesites trabajar con algo especÃ­fico:

| Necesito... | Ir a... |
|------------|---------|
| Cambiar config Supabase | `config.js` |
| Modificar login/registro | `auth.js` |
| Agregar funciÃ³n auxiliar | `utils.js` |
| Integrar nueva Sheet | `google-sheets.js` |
| DiseÃ±ar nuevo dashboard | `dashboard.js` |
| Crear/editar mÃ³dulos personalizados | `modules.js` |
| Cambiar UI o impresiÃ³n | `ui.js` |
| Alterar secuencia de inicio | `main.js` |

---

## ðŸ§ª Testing MÃ³dulos Independientes

Para testear un mÃ³dulo sin cargar todo:

```html
<!-- Crear archivo test-modulo.html -->
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
<!-- Cargar SOLO el mÃ³dulo a testear -->
<script src="js/tu-modulo.js"></script>
<script>
    // Pruebas aquÃ­
    console.log(tuFuncion());
</script>
```

---

## ðŸ“ Notas de Mantenimiento

- **Dependencias circulares**: Evitar que mÃ³dulo A dependa de B y B de A
- **Estado global**: Minimizar. Usar `sesionActiva` de `config.js`
- **Orden de carga**: Respetarlo (ver imports en `index.html`)
- **Fallback**: Si un mÃ³dulo falla, otros siguen funcionando

---

## ðŸš€ Siguientes Pasos (Si necesitas mÃ¡s modularizaciÃ³n)

1. **Separar HTML por vista**: `views/login.html`, `views/dashboard.html`
2. **Componentes Web**: Usar Custom Elements para partes reutilizables
3. **Build tool**: Webpack/Vite para bundling automÃ¡tico
4. **Tests**: Archivo por mÃ³dulo con tests unitarios

