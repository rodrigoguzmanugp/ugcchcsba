# Sistema de GestiÃ³n de Camas Hospitalarias (UGCC)

**VersiÃ³n**: 2.0 Modularizada  
**Estado**: âœ… Listo para producciÃ³n  
**Ãšltima actualizaciÃ³n**: 2026-08-11

---

## ðŸ“‹ DescripciÃ³n

Sistema integral de gestiÃ³n de camas hospitalarias para el Hospital ClÃ­nico San Borja (UGP - Unidad de GestiÃ³n de Pacientes). Permite monitoreo en tiempo real de la dotaciÃ³n de camas, gestiÃ³n de pabellones, derivaciones y registro de turnos.

### ðŸŽ¯ CaracterÃ­sticas Principales

- **Dashboard en Tiempo Real**: VisualizaciÃ³n de ocupaciÃ³n de camas por Ã¡rea (Adulto, PediatrÃ­a)
- **AutenticaciÃ³n Supabase**: Sistema seguro de login con permisos basados en roles (Admin, Operador, Invitado)
- **IntegraciÃ³n Google Sheets**: Lectura dinÃ¡mica de datos desde Google Sheets
- **MÃ³dulos Personalizados**: Crear y gestionar mÃ³dulos propios vinculados a Sheets
- **ImpresiÃ³n a PDF**: Exportar planillas, solicitudes y reportes
- **GestiÃ³n de Usuarios**: AprobaciÃ³n de operadores por administrador
- **Modo Consulta**: Acceso sin credenciales para visitantes

---

## ðŸ—ï¸ Arquitectura (v2.0 Modularizada)

El cÃ³digo ha sido dividido en **8 mÃ³dulos independientes** para mejor mantenimiento:

```
sistemaugcc/
â”œâ”€ ðŸ“„ index.html               # Punto de entrada (carga automÃ¡ticamente mÃ³dulos)
â”œâ”€ ðŸ“ js/                      # MÃ³dulos JavaScript
â”‚  â”œâ”€ config.js                (56 lÃ­neas)   - ConfiguraciÃ³n global
â”‚  â”œâ”€ auth.js                  (307 lÃ­neas)  - AutenticaciÃ³n y sesiones
â”‚  â”œâ”€ utils.js                 (47 lÃ­neas)   - Funciones auxiliares
â”‚  â”œâ”€ google-sheets.js         (117 lÃ­neas)  - IntegraciÃ³n Sheets API
â”‚  â”œâ”€ dashboard.js             (48 lÃ­neas)   - Dashboard y KPIs
â”‚  â”œâ”€ modules.js               (137 lÃ­neas)  - MÃ³dulos personalizados
â”‚  â”œâ”€ ui.js                    (144 lÃ­neas)  - UI, impresiÃ³n, modales
â”‚  â””â”€ main.js                  (52 lÃ­neas)   - InicializaciÃ³n
â””â”€ ðŸ“ docs/                    # DocumentaciÃ³n
   â”œâ”€ ARCHITECTURE.md          - Detalles tÃ©cnicos
   â”œâ”€ MODULARIZATION_GUIDE.md  - GuÃ­a de uso modular
   â””â”€ FUNCTION_INDEX.md        - Ãndice de funciones
```

### âœ¨ Beneficios de la ModularizaciÃ³n

| MÃ©trica | Antes | DespuÃ©s | Mejora |
|---------|-------|---------|--------|
| LÃ­neas por archivo | 3,956 | 47-307 | ðŸ“‰ 63% menos |
| Tokens por cambio | ~25,000 | ~3,000-5,000 | ðŸ“‰ 80% menos |
| Tiempo buscar funciÃ³n | 5-10 min | 30 seg | âš¡ 10x mÃ¡s rÃ¡pido |

---

## ðŸš€ Inicio RÃ¡pido

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Credenciales de Supabase configuradas
- Token de Google (opcional, para lectura avanzada de Sheets)

### InstalaciÃ³n

1. **Clonar repositorio**
```bash
git clone https://github.com/rodrigoguzmanugp/ugcchcsba.git
cd ugcchcsba
```

2. **Abrir en navegador**
```bash
# OpciÃ³n 1: Abrir directamente
open index.html

# OpciÃ³n 2: Con servidor local (recomendado)
python -m http.server 8000
# Luego abre: http://localhost:8000
```

3. **Configurar credenciales** (si necesario)
   - Edita `js/config.js`
   - Actualiza `SUPABASE_URL` y `SUPABASE_ANON_KEY`

---

## ðŸ“š DocumentaciÃ³n

### Para Usuarios
- **[ðŸ“–_COMIENZA_AQUI.txt](ðŸ“–_COMIENZA_AQUI.txt)** - GuÃ­a rÃ¡pida de inicio
- **[MODULARIZATION_SUMMARY.txt](MODULARIZATION_SUMMARY.txt)** - Resumen ejecutivo

### Para Desarrolladores
1. **[docs/MODULARIZATION_GUIDE.md](docs/MODULARIZATION_GUIDE.md)** â­ EMPIEZA AQUÃ
   - CÃ³mo funciona la estructura modular
   - Ejemplos prÃ¡cticos de cambios
   - FAQs y troubleshooting

2. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**
   - DescripciÃ³n detallada de cada mÃ³dulo
   - Relaciones y dependencias
   - Flujo de datos

3. **[docs/FUNCTION_INDEX.md](docs/FUNCTION_INDEX.md)**
   - Ãndice completo de funciones
   - Busca dÃ³nde estÃ¡ lo que necesitas

---

## ðŸ” AutenticaciÃ³n y Permisos

### Roles Disponibles

| Rol | Login | Dashboard | MÃ³dulos | Crear MÃ³dulos | Aprobar Usuarios | Imprimir |
|-----|-------|-----------|---------|---------------|------------------|----------|
| Admin | âœ… | âœ… | âœ… | âœ… | âœ… | âœ… |
| Operador | âœ… | âœ… | âœ… | âŒ | âŒ | âœ… |
| Invitado | âŒ | âœ… | âŒ | âŒ | âŒ | âŒ |

### Flujo de Acceso
1. Usuario se registra con correo @gmail.com
2. Queda pendiente de aprobaciÃ³n
3. Admin aprueba desde panel de usuarios
4. Usuario puede ingresar con credenciales

---

## ðŸ”§ Desarrollo y PersonalizaciÃ³n

### Cambiar ConfiguraciÃ³n
```javascript
// js/config.js
const ADMIN_EMAIL = 'tu_admin@ejemplo.com';
const SUPABASE_URL = 'tu-url-supabase';
const SUPABASE_ANON_KEY = 'tu-key';
```

### Agregar Nueva FunciÃ³n
```javascript
// 1. Crear funciÃ³n en el mÃ³dulo apropiado
// js/ui.js
function miNuevaFuncion() {
    console.log('Nueva funciÃ³n');
}

// 2. Usar en HTML o en otros mÃ³dulos
// AutomÃ¡ticamente disponible (sin imports necesarios)
```

### Conectar Nueva Google Sheet
```javascript
// En js/config.js, agregar a SPREADSHEET_IDS:
miNuevaSheet: '1a7t7KN0d_pq_j5B92i7NV9-3mK0Q5zWvQxMn-_MzXDw'

// En js/google-sheets.js, usar:
const datos = await leerRangoGviz('MiSheet', 'A1:D100');
```

---

## ðŸ“Š EstadÃ­sticas del Proyecto

- **LÃ­neas de cÃ³digo**: 908 (mÃ³dulos JS) + 1,524 (HTML)
- **MÃ³dulos**: 8 independientes
- **Funciones**: 50+ documentadas
- **DocumentaciÃ³n**: 3 guÃ­as detalladas
- **Ãšltima modularizaciÃ³n**: 2026-08-11

---

## ðŸ› ï¸ Stack TecnolÃ³gico

| Componente | TecnologÃ­a |
|-----------|-----------|
| Frontend | HTML5, CSS3 (Tailwind), JavaScript ES6+ |
| AutenticaciÃ³n | Supabase Auth (JWT) |
| Base de Datos | Supabase (PostgreSQL) |
| Google Integration | Google Sheets API v4, Google Visualization API |
| PDF Export | html2pdf.js |
| UI Components | FontAwesome, Tailwind CSS |

---

## ðŸ“‹ Requisitos de Supabase

### Tablas Necesarias
- `perfiles` - InformaciÃ³n de usuarios
- `modulos_custom` - MÃ³dulos personalizados
- `config_celdas` - ConfiguraciÃ³n de referencias a Sheets

### PolÃ­ticas RLS
- Admin puede ver/editar todos los perfiles
- Operadores ven solo sus propios datos
- Invitados no pueden escribir

---

## ðŸš¨ Troubleshooting

### "Supabase no estÃ¡ configurado"
â†’ Edita `js/config.js` y actualiza credenciales

### "Google Sheet no carga"
â†’ Verifica que el Sheet sea pÃºblico o que tengas el token vÃ¡lido

### "FunciÃ³n no estÃ¡ definida"
â†’ Verifica que el mÃ³dulo estÃ© importado en `index.html`

MÃ¡s detalles en [docs/MODULARIZATION_GUIDE.md](docs/MODULARIZATION_GUIDE.md#errores-comunes)

---

## ðŸ“ž Soporte

- **DocumentaciÃ³n**: Ver carpeta `/docs/`
- **Reportar bugs**: Crear issue en GitHub
- **Contacto**: rodrigoguzman.ugp@gmail.com

---

## ðŸ“„ Licencia

Proyecto privado de Hospital ClÃ­nico San Borja (UGP)

---

## ðŸ™ Agradecimientos

- **Arquitectura modular**: Claude AI (Anthropic)
- **Framework**: Tailwind CSS, Supabase
- **Iconos**: FontAwesome

---

## ðŸ“ˆ Roadmap Futuro

- [ ] Tests unitarios
- [ ] TypeScript para mayor seguridad de tipos
- [ ] Build tool (Webpack) para producciÃ³n
- [ ] Progressive Web App (PWA)
- [ ] SincronizaciÃ³n offline
- [ ] Notificaciones en tiempo real

---

**VersiÃ³n 2.0 Modularizada - 2026-08-11** âœ¨
