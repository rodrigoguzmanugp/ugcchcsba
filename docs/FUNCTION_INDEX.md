# ðŸ“š Ãndice de Funciones por MÃ³dulo

Referencia rÃ¡pida para encontrar dÃ³nde estÃ¡ cada funciÃ³n.

---

## ðŸ“¦ config.js (ConfiguraciÃ³n Global)
**Constantes y estado global**

```
SUPABASE_URL              - URL del proyecto Supabase
SUPABASE_ANON_KEY         - Clave pÃºblica de Supabase
supabaseClient            - Cliente Supabase inicializado
ADMIN_EMAIL               - Correo del administrador
LEGACY_EMAIL_DOMAIN       - Dominio para cuentas sin Gmail
sesionActiva              - Estado de la sesiÃ³n actual
SHEET_URLS                - URLs de Google Sheets por mÃ³dulo
SPREADSHEET_IDS           - IDs de Spreadsheets para API
```

---

## ðŸ” auth.js (AutenticaciÃ³n - 340 lÃ­neas)
**GestiÃ³n de usuarios, login, registro, aprobaciÃ³n**

```
usuarioAEmail(valor)
    Convierte "usuario" en "usuario@gestorcamas.local"
    O devuelve el correo si contiene @

mostrarTabLogin(tab)
    Cambia entre pestaÃ±a "Iniciar SesiÃ³n" y "Registrar Operador"

verificarConexionSupabase(errorEl)
    Verifica que Supabase estÃ© configurado

extraerCorreoParaMostrar(user)
    Obtiene el mejor correo disponible (Gmail > correo real > nada)

iniciarSesion(event)
    â­ FLUJO PRINCIPAL DE LOGIN
    1. Obtiene usuario/clave/turno/Ã¡rea del formulario
    2. Autentica con Supabase
    3. Obtiene perfil de la BD
    4. Valida aprobaciÃ³n
    5. Abre sesiÃ³n o muestra error

registrarOperador(event)
    â­ FLUJO DE REGISTRO
    1. Valida que sea correo @gmail.com
    2. Crea cuenta en Supabase Auth
    3. Trigger del servidor crea perfil automÃ¡ticamente
    4. Usuario queda pendiente de aprobaciÃ³n
    5. Se cierra sesiÃ³n y se muestra confirmaciÃ³n

ingresarInvitado()
    Abre sesiÃ³n como "Invitado" sin credenciales
    Solo lectura, no crea sesiÃ³n en Supabase

cerrarSesion()
    Logout: Supabase + reload

esInvitado()
    Booleano: Â¿SesiÃ³n actual es invitado?

bloquearSiInvitado(mensaje)
    Muestra alert si es invitado
    Retorna true/false para usar con if

abrirSesion(sesion)
    â­ CUANDO ENTRA UN USUARIO
    1. Guarda sesion en sesionActiva
    2. Oculta login, muestra app-shell
    3. Aplica datos en interfaz
    4. Actualiza botÃ³n de Google

actualizarBadgePendientes()
    Solo admin: Muestra badge con nÃºmero de usuarios pendientes

abrirPanelAprobaciones() / cerrarPanelAprobaciones()
    Abre/cierra modal de aprobaciÃ³n de usuarios

cargarPendientes()
    Carga lista de usuarios sin aprobar
    Muestra nombre, email, permisos, turno, Ã¡rea

aprobarUsuario(id)
    Marca usuario como "aprobado" en BD
    Actualiza lista y badge

rechazarUsuario(id, usuario)
    Elimina perfil de usuario de la BD
    Pide confirmaciÃ³n

aplicarSesionEnInterfaz(sesion)
    â­ ACTUALIZA LA UI CON DATOS DE USUARIO
    - Nombre: user-badge-nombre
    - Rol: user-badge-rol
    - Email: user-badge-email
    - BotÃ³n de "Usuarios Pendientes" (solo admin)

restaurarSesion()
    Al cargar: Verifica si existe sesiÃ³n en Supabase
    Si existe, obtiene perfil y abre sesiÃ³n
    Si no, muestra login
```

---

## ðŸ”§ utils.js (Utilidades - 60 lÃ­neas)
**Funciones auxiliares generales**

```
updateClock()
    Actualiza elemento #current-time cada segundo
    Formato: HH:MM (24h, locale es-AR)

slugify(texto)
    Convierte "Mi MÃ³dulo Custom" â†’ "mi-modulo-custom"
    Elimina acentos, espacios, caracteres especiales

parseCelda(celda)
    Limpia valor de celda: elimina espacios, convierte 0/- en ""
    Usado para datos de Google Sheets

pareceEncabezado(fila)
    Detecta si fila es encabezado
    Busca palabras clave: nombre, usuario, codigo, id, descripciÃ³n, title

getBanColor(color)
    Mapea color en texto â†’ clase Tailwind
    rojo â†’ bg-red-100 text-red-800
    azul â†’ bg-blue-100 text-blue-800
    verde, amarillo, purpura, rosa
```

---

## ðŸ“Š google-sheets.js (Google Sheets - 120 lÃ­neas)
**Lectura de datos desde Google Sheets**

```
guardarTokenGoogle(token, expiresIn)
    Guarda token OAuth de Google en sessionStorage
    Calcula fecha de expiraciÃ³n

obtenerTokenGoogleVigente()
    Recupera token de sessionStorage
    Verifica que no estÃ© expirado
    Si expirÃ³, lo elimina y devuelve null

actualizarBotonGoogle()
    Si hay token: Muestra "Google Conectado âœ“" (deshabilitado)
    Si no: Muestra "Conectar Google" (habilitado)

conectarGoogle()
    Abre flujo OAuth de Google
    Solicita scope: spreadsheets.readonly

leerConAPIOficial(spreadsheetId, sheetName, rango)
    â­ LECTURA DIRECTA VIA API
    Requiere token OAuth vÃ¡lido
    Retorna array con datos
    Ejemplo: leerConAPIOficial('id123', 'Informe', 'A1:D10')

leerCeldaGviz(sheetName, cellRef)
    â­ LECTURA SIN AUTENTICACIÃ“N (publica)
    Usa Google Visualization API
    Lee una celda individual
    Ejemplo: leerCeldaGviz('Informe', 'B5') â†’ valor

leerSumaCeldas(sheetName, cellRefs)
    Lee mÃºltiples celdas y suma sus valores
    Ejemplo: leerSumaCeldas('Informe', ['B5', 'C5', 'D5']) â†’ suma

leerRangoGviz(sheetName, rango)
    â­ LECTURA DE RANGO (sin autenticaciÃ³n)
    Lee tabla completa
    Retorna array de arrays
    Ejemplo: leerRangoGviz('Residentes', 'A1:F50')
```

---

## ðŸ“ˆ dashboard.js (Dashboard - 50 lÃ­neas)
**Dashboard principal y KPIs**

```
cargarKpisCamasCriticas()
    Obtiene datos de camas crÃ­ticas desde Google Sheets
    Actualiza tarjetas de ocupaciÃ³n

pintarKpiCard(prefix, data)
    Renderiza tarjeta de KPI
    Ejemplo: pintarKpiCard('adulto-uci', {porcentaje: 92, disponibles: 2, total: 24})

construirCeldasCamasCriticas()
    Retorna objeto con referencias de celdas Sheets
    adultoUciPorcentaje, adultoUciDisponibles, adultoUciTotal, etc.

cargarMatricesInforme()
    Carga matrices de datos del informe (ocupaciÃ³n por tipo/Ã¡rea)

pintarMatrizPorTipos(contenedorId, bloque)
    Renderiza matriz HTML
    Pone datos en elemento #contenedorId

pintarResumenOcupacionalInforme()
    Muestra resumen general de ocupaciÃ³n
```

---

## ðŸ“¦ modules.js (MÃ³dulos Personalizados - 160 lÃ­neas)
**GestiÃ³n de mÃ³dulos custom**

```
getSheetUrl(modId)
    Obtiene URL de Google Sheets para un mÃ³dulo
    Ejemplo: getSheetUrl('novedades')

openModuleSheet(modId)
    Abre la Sheet en nueva pestaÃ±a

openNovedadesSheet() / openNovedadesSheetDirect()
    Atajos para abrir sheet de novedades

configureSheetUrl(modId, modName)
    Permite al usuario cambiar la URL de un mÃ³dulo

navigateToModule(modId)
    Navega a un mÃ³dulo especÃ­fico (con restricciÃ³n invitado)

switchModule(modId)
    Cambia entre pestaÃ±as de mÃ³dulos

obtenerModulosCustomCache()
    Obtiene mÃ³dulos del cache local (localStorage)

cargarModulosCustomDesdeSupabase()
    â­ OBTIENE MÃ“DULOS DE LA BD
    SELECT * FROM modulos_custom ORDER BY posicion

abrirModalCrearModulo() / cerrarModalCrearModulo()
    Abre/cierra modal de crear mÃ³dulo

crearModuloCustom(event)
    â­ CREAR NUEVO MÃ“DULO
    1. Obtiene nombre y URL de formulario
    2. Inserta en tabla modulos_custom
    3. Recarga pÃ¡gina

eliminarModuloCustom(id)
    â­ ELIMINA MÃ“DULO
    1. Pide confirmaciÃ³n
    2. DELETE en Supabase
    3. Recarga pÃ¡gina

crearSeccionModuloCustom(m)
    Retorna HTML de una tarjeta de mÃ³dulo

cargarModuloCustom(id)
    Carga datos de un mÃ³dulo especÃ­fico

renderModulosCustom(reconstruirNav)
    Renderiza lista de mÃ³dulos personalizados
    Opcional: reconstruir navegaciÃ³n
```

---

## ðŸŽ¨ ui.js (Interfaz - 180 lÃ­neas)
**Componentes UI, impresiÃ³n, configuraciÃ³n**

```
imprimirPlanillaInhabil()
    â­ EXPORTAR A PDF
    Obtiene elemento #planilla-inhabil
    Genera PDF con html2pdf.js
    Descarga como "Planilla_Inhabil.pdf"
    (Bloqueado para invitado)

imprimirSolicitudPabellon()
    â­ EXPORTAR A PDF
    Similar a anterior, elemento #solicitud-pabellon
    Descarga como "Solicitud_Pabellon.pdf"
    (Bloqueado para invitado)

renderBedPlan()
    Renderiza plano de camas en #bed-plan-container
    Grid 4 columnas con tarjetas de camas

getBedCardHTML(bed)
    Retorna HTML de tarjeta de cama
    Muestra: nÃºmero, estado (ocupada/disponible), color

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
    â­ OBTIENE CONFIGURACIÃ“N
    SELECT * FROM config_celdas

getCelda(clave)
    Obtiene valor de configuraciÃ³n (localStorage)

getCeldasLista(clave)
    Obtiene array de valores (split por coma)

guardarCelda(clave, valorNuevo)
    â­ GUARDA CONFIGURACIÃ“N
    1. localStorage
    2. INSERT/UPDATE en Supabase (si conectado)

restaurarCeldaPorDefecto(clave)
    Elimina configuraciÃ³n
    localStorage + DELETE en Supabase
```

---

## ðŸš€ main.js (InicializaciÃ³n - 40 lÃ­neas)
**Punto de entrada de la aplicaciÃ³n**

```
DOMContentLoaded (event listener)
    â­ EJECUTA AL CARGAR LA PÃGINA
    1. Verificar Supabase configurado
    2. Iniciar reloj (updateClock())
    3. Restaurar sesiÃ³n
    4. Cargar mÃ³dulos personalizados

restaurarSesion()
    1. Obtiene sesiÃ³n de Supabase
    2. Si existe: obtiene perfil
    3. Abre sesiÃ³n automÃ¡ticamente
    4. Si no: muestra login
```

---

## ðŸ”— Llamadas Cruzadas (Funciones que dependen de otras)

```
iniciarSesion
    â†’ usuarioAEmail
    â†’ verificarConexionSupabase
    â†’ abrirSesion

abrirSesion
    â†’ aplicarSesionEnInterfaz
    â†’ actualizarBotonGoogle

aplicarSesionEnInterfaz
    â†’ restaurarSesion (recursiva)
    â†’ extraerCorreoParaMostrar

crearModuloCustom
    â†’ bloquearSiInvitado
    â†’ guardarCelda (para persistencia)

imprimirPlanillaInhabil
    â†’ bloquearSiInvitado

cargarMatricesInforme
    â†’ leerRangoGviz
    â†’ pintarMatrizPorTipos

pintarResidentesSimplificado
    â†’ pareceEncabezado
    â†’ parseCelda
```

---

## ðŸ’¡ Tips de BÃºsqueda RÃ¡pida

| Quiero... | FunciÃ³n | MÃ³dulo |
|-----------|---------|--------|
| Verificar si es admin | `sesionActiva.rol === 'admin'` | config.js |
| Obtener usuario actual | `sesionActiva.usuario` | config.js |
| Leer un valor de Sheets | `leerCeldaGviz()` | google-sheets.js |
| Convertir a URL-friendly | `slugify()` | utils.js |
| Bloquear acciÃ³n para invitado | `bloquearSiInvitado()` | auth.js |
| Guardar configuraciÃ³n | `guardarCelda()` | ui.js |
| Crear PDF | `imprimirPlanillaInhabil()` | ui.js |

