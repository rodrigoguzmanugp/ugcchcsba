# 📚 Índice de Funciones por Módulo

Referencia rápida para encontrar dónde está cada función.

---

## 📦 config.js (Configuración Global)
**Constantes y estado global**

```
SUPABASE_URL              - URL del proyecto Supabase
SUPABASE_ANON_KEY         - Clave pública de Supabase
supabaseClient            - Cliente Supabase inicializado
ADMIN_EMAIL               - Correo del administrador
LEGACY_EMAIL_DOMAIN       - Dominio para cuentas sin Gmail
sesionActiva              - Estado de la sesión actual
SHEET_URLS                - URLs de Google Sheets por módulo
SPREADSHEET_IDS           - IDs de Spreadsheets para API
```

---

## 🔐 auth.js (Autenticación - 340 líneas)
**Gestión de usuarios, login, registro, aprobación**

```
usuarioAEmail(valor)
    Convierte "usuario" en "usuario@gestorcamas.local"
    O devuelve el correo si contiene @

mostrarTabLogin(tab)
    Cambia entre pestaña "Iniciar Sesión" y "Registrar Operador"

verificarConexionSupabase(errorEl)
    Verifica que Supabase esté configurado

extraerCorreoParaMostrar(user)
    Obtiene el mejor correo disponible (Gmail > correo real > nada)

iniciarSesion(event)
    ⭐ FLUJO PRINCIPAL DE LOGIN
    1. Obtiene usuario/clave/turno/área del formulario
    2. Autentica con Supabase
    3. Obtiene perfil de la BD
    4. Valida aprobación
    5. Abre sesión o muestra error

registrarOperador(event)
    ⭐ FLUJO DE REGISTRO
    1. Valida que sea correo @gmail.com
    2. Crea cuenta en Supabase Auth
    3. Trigger del servidor crea perfil automáticamente
    4. Usuario queda pendiente de aprobación
    5. Se cierra sesión y se muestra confirmación

ingresarInvitado()
    Abre sesión como "Invitado" sin credenciales
    Solo lectura, no crea sesión en Supabase

cerrarSesion()
    Logout: Supabase + reload

esInvitado()
    Booleano: ¿Sesión actual es invitado?

bloquearSiInvitado(mensaje)
    Muestra alert si es invitado
    Retorna true/false para usar con if

abrirSesion(sesion)
    ⭐ CUANDO ENTRA UN USUARIO
    1. Guarda sesion en sesionActiva
    2. Oculta login, muestra app-shell
    3. Aplica datos en interfaz
    4. Actualiza botón de Google

actualizarBadgePendientes()
    Solo admin: Muestra badge con número de usuarios pendientes

abrirPanelAprobaciones() / cerrarPanelAprobaciones()
    Abre/cierra modal de aprobación de usuarios

cargarPendientes()
    Carga lista de usuarios sin aprobar
    Muestra nombre, email, permisos, turno, área

aprobarUsuario(id)
    Marca usuario como "aprobado" en BD
    Actualiza lista y badge

rechazarUsuario(id, usuario)
    Elimina perfil de usuario de la BD
    Pide confirmación

aplicarSesionEnInterfaz(sesion)
    ⭐ ACTUALIZA LA UI CON DATOS DE USUARIO
    - Nombre: user-badge-nombre
    - Rol: user-badge-rol
    - Email: user-badge-email
    - Botón de "Usuarios Pendientes" (solo admin)

restaurarSesion()
    Al cargar: Verifica si existe sesión en Supabase
    Si existe, obtiene perfil y abre sesión
    Si no, muestra login
```

---

## 🔧 utils.js (Utilidades - 60 líneas)
**Funciones auxiliares generales**

```
updateClock()
    Actualiza elemento #current-time cada segundo
    Formato: HH:MM (24h, locale es-AR)

slugify(texto)
    Convierte "Mi Módulo Custom" → "mi-modulo-custom"
    Elimina acentos, espacios, caracteres especiales

parseCelda(celda)
    Limpia valor de celda: elimina espacios, convierte 0/- en ""
    Usado para datos de Google Sheets

pareceEncabezado(fila)
    Detecta si fila es encabezado
    Busca palabras clave: nombre, usuario, codigo, id, descripción, title

getBanColor(color)
    Mapea color en texto → clase Tailwind
    rojo → bg-red-100 text-red-800
    azul → bg-blue-100 text-blue-800
    verde, amarillo, purpura, rosa
```

---

## 📊 google-sheets.js (Google Sheets - 120 líneas)
**Lectura de datos desde Google Sheets**

```
guardarTokenGoogle(token, expiresIn)
    Guarda token OAuth de Google en sessionStorage
    Calcula fecha de expiración

obtenerTokenGoogleVigente()
    Recupera token de sessionStorage
    Verifica que no esté expirado
    Si expiró, lo elimina y devuelve null

actualizarBotonGoogle()
    Si hay token: Muestra "Google Conectado ✓" (deshabilitado)
    Si no: Muestra "Conectar Google" (habilitado)

conectarGoogle()
    Abre flujo OAuth de Google
    Solicita scope: spreadsheets.readonly

leerConAPIOficial(spreadsheetId, sheetName, rango)
    ⭐ LECTURA DIRECTA VIA API
    Requiere token OAuth válido
    Retorna array con datos
    Ejemplo: leerConAPIOficial('id123', 'Informe', 'A1:D10')

leerCeldaGviz(sheetName, cellRef)
    ⭐ LECTURA SIN AUTENTICACIÓN (publica)
    Usa Google Visualization API
    Lee una celda individual
    Ejemplo: leerCeldaGviz('Informe', 'B5') → valor

leerSumaCeldas(sheetName, cellRefs)
    Lee múltiples celdas y suma sus valores
    Ejemplo: leerSumaCeldas('Informe', ['B5', 'C5', 'D5']) → suma

leerRangoGviz(sheetName, rango)
    ⭐ LECTURA DE RANGO (sin autenticación)
    Lee tabla completa
    Retorna array de arrays
    Ejemplo: leerRangoGviz('Residentes', 'A1:F50')
```

---

## 📈 dashboard.js (Dashboard - 50 líneas)
**Dashboard principal y KPIs**

```
cargarKpisCamasCriticas()
    Obtiene datos de camas críticas desde Google Sheets
    Actualiza tarjetas de ocupación

pintarKpiCard(prefix, data)
    Renderiza tarjeta de KPI
    Ejemplo: pintarKpiCard('adulto-uci', {porcentaje: 92, disponibles: 2, total: 24})

construirCeldasCamasCriticas()
    Retorna objeto con referencias de celdas Sheets
    adultoUciPorcentaje, adultoUciDisponibles, adultoUciTotal, etc.

cargarMatricesInforme()
    Carga matrices de datos del informe (ocupación por tipo/área)

pintarMatrizPorTipos(contenedorId, bloque)
    Renderiza matriz HTML
    Pone datos en elemento #contenedorId

pintarResumenOcupacionalInforme()
    Muestra resumen general de ocupación
```

---

## 📦 modules.js (Módulos Personalizados - 160 líneas)
**Gestión de módulos custom**

```
getSheetUrl(modId)
    Obtiene URL de Google Sheets para un módulo
    Ejemplo: getSheetUrl('novedades')

openModuleSheet(modId)
    Abre la Sheet en nueva pestaña

openNovedadesSheet() / openNovedadesSheetDirect()
    Atajos para abrir sheet de novedades

configureSheetUrl(modId, modName)
    Permite al usuario cambiar la URL de un módulo

navigateToModule(modId)
    Navega a un módulo específico (con restricción invitado)

switchModule(modId)
    Cambia entre pestañas de módulos

obtenerModulosCustomCache()
    Obtiene módulos del cache local (localStorage)

cargarModulosCustomDesdeSupabase()
    ⭐ OBTIENE MÓDULOS DE LA BD
    SELECT * FROM modulos_custom ORDER BY posicion

abrirModalCrearModulo() / cerrarModalCrearModulo()
    Abre/cierra modal de crear módulo

crearModuloCustom(event)
    ⭐ CREAR NUEVO MÓDULO
    1. Obtiene nombre y URL de formulario
    2. Inserta en tabla modulos_custom
    3. Recarga página

eliminarModuloCustom(id)
    ⭐ ELIMINA MÓDULO
    1. Pide confirmación
    2. DELETE en Supabase
    3. Recarga página

crearSeccionModuloCustom(m)
    Retorna HTML de una tarjeta de módulo

cargarModuloCustom(id)
    Carga datos de un módulo específico

renderModulosCustom(reconstruirNav)
    Renderiza lista de módulos personalizados
    Opcional: reconstruir navegación
```

---

## 🎨 ui.js (Interfaz - 180 líneas)
**Componentes UI, impresión, configuración**

```
imprimirPlanillaInhabil()
    ⭐ EXPORTAR A PDF
    Obtiene elemento #planilla-inhabil
    Genera PDF con html2pdf.js
    Descarga como "Planilla_Inhabil.pdf"
    (Bloqueado para invitado)

imprimirSolicitudPabellon()
    ⭐ EXPORTAR A PDF
    Similar a anterior, elemento #solicitud-pabellon
    Descarga como "Solicitud_Pabellon.pdf"
    (Bloqueado para invitado)

renderBedPlan()
    Renderiza plano de camas en #bed-plan-container
    Grid 4 columnas con tarjetas de camas

getBedCardHTML(bed)
    Retorna HTML de tarjeta de cama
    Muestra: número, estado (ocupada/disponible), color

pintarTablaSolicitudes(tbodyId, filas, columnas)
    Renderiza tabla de solicitudes
    tbody debe existir

cargarSolicitudesSalida()
    Obtiene solicitudes de Google Sheets

detectarSecciones(filaSecciones)
    Detecta secciones en encabezado
    Retorna objeto {seccion: indice}

pintarResidentesSimplificado(theadId, tbodyId, filas)
    Renderiza tabla de residentes
    thead = encabezado, tbody = datos

cargarResidentesTurno()
    Obtiene residentes del turno desde Sheets

cargarConfigCeldas()
    ⭐ OBTIENE CONFIGURACIÓN
    SELECT * FROM config_celdas

getCelda(clave)
    Obtiene valor de configuración (localStorage)

getCeldasLista(clave)
    Obtiene array de valores (split por coma)

guardarCelda(clave, valorNuevo)
    ⭐ GUARDA CONFIGURACIÓN
    1. localStorage
    2. INSERT/UPDATE en Supabase (si conectado)

restaurarCeldaPorDefecto(clave)
    Elimina configuración
    localStorage + DELETE en Supabase
```

---

## 🚀 main.js (Inicialización - 40 líneas)
**Punto de entrada de la aplicación**

```
DOMContentLoaded (event listener)
    ⭐ EJECUTA AL CARGAR LA PÁGINA
    1. Verificar Supabase configurado
    2. Iniciar reloj (updateClock())
    3. Restaurar sesión
    4. Cargar módulos personalizados

restaurarSesion()
    1. Obtiene sesión de Supabase
    2. Si existe: obtiene perfil
    3. Abre sesión automáticamente
    4. Si no: muestra login
```

---

## 🔗 Llamadas Cruzadas (Funciones que dependen de otras)

```
iniciarSesion
    → usuarioAEmail
    → verificarConexionSupabase
    → abrirSesion

abrirSesion
    → aplicarSesionEnInterfaz
    → actualizarBotonGoogle

aplicarSesionEnInterfaz
    → restaurarSesion (recursiva)
    → extraerCorreoParaMostrar

crearModuloCustom
    → bloquearSiInvitado
    → guardarCelda (para persistencia)

imprimirPlanillaInhabil
    → bloquearSiInvitado

cargarMatricesInforme
    → leerRangoGviz
    → pintarMatrizPorTipos

pintarResidentesSimplificado
    → pareceEncabezado
    → parseCelda
```

---

## 💡 Tips de Búsqueda Rápida

| Quiero... | Función | Módulo |
|-----------|---------|--------|
| Verificar si es admin | `sesionActiva.rol === 'admin'` | config.js |
| Obtener usuario actual | `sesionActiva.usuario` | config.js |
| Leer un valor de Sheets | `leerCeldaGviz()` | google-sheets.js |
| Convertir a URL-friendly | `slugify()` | utils.js |
| Bloquear acción para invitado | `bloquearSiInvitado()` | auth.js |
| Guardar configuración | `guardarCelda()` | ui.js |
| Crear PDF | `imprimirPlanillaInhabil()` | ui.js |

