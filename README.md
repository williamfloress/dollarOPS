# DollarOPS Trading Journal

Una aplicación web moderna y profesional para llevar un registro detallado de tus operaciones de trading. Diseñada con una interfaz intuitiva y múltiples temas personalizables, DollarOPS Trading Journal te ayuda a analizar tu rendimiento y mejorar tus estrategias de trading.

## Características Principales

### Autenticación y Usuarios
- **Sistema de autenticación completo**: Registro, inicio de sesión y recuperación de contraseña
- **Integración con Supabase** (opcional): Almacenamiento en la nube y sincronización entre dispositivos
- **Modo local**: Funciona sin configuración adicional usando localStorage
- **Perfil de usuario**: Configuración personalizada por usuario
- **Sesión persistente**: Mantén tu sesión activa entre visitas

### Gestión de Operaciones
- **Registro de operaciones**: Crea, edita y elimina entradas de trading con información detallada
- **Vista de calendario**: Navega fácilmente por tus operaciones usando el calendario integrado
- **Filtros avanzados**: Filtra operaciones por fecha, par de divisas, resultado (ganancia/pérdida)
- **Estadísticas en tiempo real**: Visualiza métricas clave como ganancias totales, ratio de aciertos, mejor/peor operación
- **Gráficos de rendimiento**: Visualización de métricas con gráficos interactivos

### Personalización
- **Múltiples temas**: 6 temas oscuros y 6 temas claros para adaptar la interfaz a tu preferencia
- **Título personalizable**: Personaliza el nombre de tu journal
- **Tablero de visión**: Agrega imágenes motivacionales para mantenerte enfocado en tus objetivos
- **Almacenamiento de imágenes**: Las imágenes se guardan en Supabase Storage (si está configurado) o en localStorage

### Análisis y Métricas
- **Dashboard de estadísticas**: 
  - Ganancia/pérdida total
  - Número de operaciones ganadoras vs perdedoras
  - Ratio de aciertos (win rate)
  - Mejor y peor operación
  - Balance de cuenta actualizado
- **Gráficos visuales**: Representación gráfica de tus resultados con gráficos de línea y área
- **Análisis por par de divisas**: Estadísticas desglosadas por instrumento de trading
- **Métricas avanzadas**: Análisis detallado de tu rendimiento de trading

### Persistencia de Datos
- **Almacenamiento flexible**: 
  - **Modo local**: Todos tus datos se guardan automáticamente en el navegador (localStorage)
  - **Modo Supabase**: Sincronización en la nube con base de datos PostgreSQL
- **Exportar datos**: Descarga tus datos en formato JSON para respaldo
- **Importar datos**: Restaura tus datos desde un archivo JSON previamente exportado
- **Sincronización automática**: Los cambios se guardan automáticamente sin necesidad de guardar manualmente
- **Migración de datos**: Herramientas para migrar de localStorage a Supabase

### Diseño Responsive
- **Interfaz adaptativa**: Funciona perfectamente en escritorio, tablet y móvil
- **Navegación optimizada**: Menús y controles adaptados para diferentes tamaños de pantalla
- **Experiencia táctil**: Optimizado para dispositivos táctiles

## Stack Tecnológico

### Frontend
- **React 19**: Framework de UI moderno y eficiente
- **Vite 6**: Build tool rápido para desarrollo y producción
- **Tailwind CSS 4**: Framework de utilidades CSS para diseño rápido
- **Lucide React**: Iconos modernos y consistentes

### Backend (Opcional)
- **Supabase**: Backend como servicio (BaaS) para autenticación y almacenamiento
  - Autenticación con email/password
  - Base de datos PostgreSQL
  - Storage para imágenes
  - Row Level Security (RLS)

### Dependencias Principales
- `react` / `react-dom`: Framework de UI (v19.2.0)
- `@supabase/supabase-js`: Cliente de Supabase para integración backend (v2.86.2)
- `lucide-react`: Biblioteca de iconos (v0.554.0)
- `clsx`: Utilidad para manejo de clases CSS (v2.1.1)
- `tailwind-merge`: Merge inteligente de clases Tailwind (v3.4.0)

### Herramientas de Desarrollo
- `vite`: Build tool y dev server
- `tailwindcss`: Framework CSS
- `eslint`: Linter para código JavaScript/React
- `postcss`: Procesador CSS
- `autoprefixer`: Agregar prefijos CSS automáticamente

## Instalación

### Requisitos Previos
- **Node.js** (versión LTS recomendada) - [Descargar Node.js](https://nodejs.org/)
- **npm** (incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

### Pasos de Instalación

1. **Clonar o descargar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd tjournal
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (Opcional - Solo si usas Supabase)**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```
   
   > **Nota**: Si no configuras Supabase, la aplicación funcionará en modo local usando localStorage.

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   - La aplicación se abrirá automáticamente en `http://localhost:5173`
   - Si no se abre automáticamente, navega manualmente a esa URL

## Configuración de Supabase (Opcional)

La aplicación puede funcionar completamente en modo local, pero si deseas usar autenticación y sincronización en la nube, necesitas configurar Supabase:

1. **Crear un proyecto en Supabase**: [https://supabase.com](https://supabase.com)
2. **Configurar la base de datos**: Ejecuta el script SQL en `supabase-schema.sql`
3. **Crear un bucket de Storage**: Crea un bucket llamado `motivational-images` en Supabase Storage
4. **Configurar variables de entorno**: Agrega las credenciales en el archivo `.env`

Para más detalles, consulta la documentación en la carpeta `documentation/`:
- `supabase-integration-guide.md`: Guía completa de integración
- `database-schema-with-users.md`: Esquema de base de datos
- `user-login-implementation-guide.md`: Guía de implementación de autenticación

## Uso

### Primera Vez

#### Modo Local
Al abrir la aplicación por primera vez (sin Supabase), verás un modal de bienvenida donde podrás:
- Establecer el título de tu journal
- Seleccionar un tema inicial
- Configurar tu capital inicial
- Seleccionar los pares de divisas que operas

#### Modo con Supabase
Si tienes Supabase configurado:
1. Crea una cuenta o inicia sesión
2. Completa el perfil de usuario
3. Configura tu journal (título, tema, capital inicial, pares de divisas)

### Agregar una Operación
1. Haz clic en el botón **"Nueva Operación"** (icono +)
2. Completa los campos:
   - Fecha y hora
   - Par de divisas
   - Tipo de operación (Compra/Venta)
   - Precio de entrada y salida
   - Tamaño de la posición
   - Notas y observaciones
3. Guarda la operación (se guarda automáticamente)

### Ver Estadísticas
- Accede al panel de métricas desde el botón de estadísticas
- Visualiza tus ganancias/pérdidas totales
- Revisa tu ratio de aciertos
- Analiza tus mejores y peores operaciones
- Explora gráficos de rendimiento

### Personalizar Tema
1. Abre la configuración (icono de engranaje)
2. Selecciona la pestaña "Tema"
3. Elige entre los 12 temas disponibles (6 oscuros y 6 claros)
4. El cambio se aplica instantáneamente

### Exportar/Importar Datos
- **Exportar**: Ve a Configuración → Datos → Exportar. Se descargará un archivo JSON con todos tus datos
- **Importar**: Ve a Configuración → Datos → Importar. Selecciona un archivo JSON previamente exportado
- **Migrar a Supabase**: Si migras de modo local a Supabase, tus datos se migrarán automáticamente

### Gestión de Perfil (Solo con Supabase)
- **Editar perfil**: Accede a la configuración de perfil desde el menú de usuario
- **Cambiar contraseña**: Opción disponible en la configuración de perfil
- **Recuperar contraseña**: Usa la opción "¿Olvidaste tu contraseña?" en el login

## Estructura del Proyecto

```
tjournal/
├── src/
│   ├── App.jsx                    # Componente principal de la aplicación
│   ├── main.jsx                   # Punto de entrada de React
│   ├── index.css                  # Estilos globales y Tailwind
│   ├── assets/                    # Recursos estáticos (imágenes, SVG)
│   ├── components/                # Componentes reutilizables
│   │   ├── Auth.jsx              # Componente de autenticación
│   │   └── ProfileSettings.jsx   # Configuración de perfil de usuario
│   └── utils/                    # Utilidades y helpers
│       ├── storage.js            # Utilidades para localStorage (exportar/importar)
│       └── supabase.js           # Cliente y utilidades de Supabase
├── public/                        # Archivos estáticos públicos
│   ├── icon.png                  # Icono de la aplicación
│   └── vite.svg                  # Logo de Vite
├── build/                         # Iconos para build de Electron (opcional)
│   ├── icon.icns                 # Icono para macOS
│   └── icon.png                  # Icono para Windows/Linux
├── dist/                          # Build de producción (generado automáticamente)
├── documentation/                 # Documentación del proyecto
│   ├── supabase-integration-guide.md
│   ├── database-schema-with-users.md
│   ├── user-login-implementation-guide.md
│   ├── localStorage-schema.md
│   ├── image-storage-migration-guide.md
│   ├── advanced-auth-features-guide.md
│   ├── metric_charts.md
│   ├── resetpassword.md
│   ├── guide.md                  # Guía para convertir a app de escritorio
│   └── todo.md                  # Lista de tareas pendientes
├── .env                          # Variables de entorno (crear manualmente)
├── .gitignore                    # Archivos ignorados por Git
├── package.json                  # Dependencias y scripts
├── package-lock.json             # Lock file de dependencias
├── vite.config.js                # Configuración de Vite
├── tailwind.config.js            # Configuración de Tailwind CSS
├── postcss.config.js             # Configuración de PostCSS
├── eslint.config.js              # Configuración de ESLint
├── supabase-schema.sql           # Script SQL para crear tablas en Supabase
├── convert_statement.py          # Script Python para convertir estados de cuenta
└── README.md                     # Este archivo
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con hot-reload en `http://localhost:5173`
- `npm run build`: Construye la aplicación para producción (genera carpeta `dist/`)
- `npm run preview`: Previsualiza el build de producción localmente

## Convertir a Aplicación de Escritorio

Esta aplicación puede convertirse en una aplicación de escritorio (.exe para Windows, .app para Mac, .AppImage para Linux) usando Electron. Consulta el archivo `documentation/guide.md` para instrucciones detalladas paso a paso.

### Resumen Rápido
1. Instalar Electron y dependencias:
   ```bash
   npm install --save-dev electron electron-builder wait-on concurrently cross-env
   ```
2. Crear archivo `electron.js` en la raíz
3. Modificar `package.json` con scripts de Electron
4. Ejecutar `npm run dist` para generar el ejecutable

## Características Técnicas

### Persistencia de Datos

#### Modo Local (localStorage)
- Todos los datos se almacenan en `localStorage` del navegador
- Claves de almacenamiento versionadas (`_v1`) para futuras migraciones
- Validación de esquema al importar datos
- Soporte para merge o reemplazo completo de datos
- Límite de almacenamiento: ~5-10MB (dependiendo del navegador)

#### Modo Supabase (Cloud)
- Base de datos PostgreSQL con Row Level Security (RLS)
- Autenticación segura con JWT tokens
- Storage para imágenes motivacionales
- Sincronización automática entre dispositivos
- Backup automático en la nube
- Sin límites prácticos de almacenamiento

### Temas Disponibles

**Temas Oscuros:**
- Pro Blue (slate_blue)
- Cyber Violet (zinc_violet)
- Zen Emerald (neutral_emerald)
- Midnight Rose (slate_rose)
- Ocean Deep (slate_teal)
- Amber Night (zinc_amber)

**Temas Claros:**
- Light Blue (light_blue)
- Light Violet (light_violet)
- Light Emerald (light_emerald)
- Light Rose (light_rose)
- Light Teal (light_teal)
- Light Amber (light_amber)

### Responsive Design
- Breakpoints optimizados para móvil, tablet y escritorio
- Menús colapsables en dispositivos móviles
- Navegación táctil optimizada
- Gráficos adaptativos según el tamaño de pantalla

### Seguridad
- Autenticación con Supabase Auth (si está configurado)
- Row Level Security (RLS) en base de datos
- Validación de datos en cliente y servidor
- Tokens JWT para sesiones seguras
- Encriptación de contraseñas (manejado por Supabase)

## Documentación Adicional

El proyecto incluye documentación detallada en la carpeta `documentation/`:

- **`supabase-integration-guide.md`**: Guía completa para integrar Supabase
- **`database-schema-with-users.md`**: Esquema completo de la base de datos
- **`user-login-implementation-guide.md`**: Detalles de implementación de autenticación
- **`localStorage-schema.md`**: Esquema de datos para modo local
- **`image-storage-migration-guide.md`**: Migración de imágenes a Supabase Storage
- **`advanced-auth-features-guide.md`**: Funciones avanzadas de autenticación
- **`metric_charts.md`**: Documentación de gráficos y métricas
- **`resetpassword.md`**: Guía de recuperación de contraseña
- **`guide.md`**: Guía para convertir a aplicación de escritorio

## Notas de Desarrollo

- La aplicación utiliza **React Hooks** para el manejo de estado
- Los datos se persisten automáticamente en cada cambio
- El diseño está optimizado para rendimiento con **React 19**
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)
- Soporte para **modo offline** cuando se usa localStorage
- **TypeScript types** disponibles para mejor desarrollo (ver `@types/react`)

### Arquitectura
- **Componente único principal**: `App.jsx` contiene toda la lógica de la aplicación
- **Utilidades separadas**: Funciones de almacenamiento y Supabase en carpetas `utils/`
- **Componentes modulares**: Autenticación y perfil en componentes separados
- **Estilos con Tailwind**: Diseño utility-first con configuración personalizada

## Migración de Datos

### De LocalStorage a Supabase
Si ya tienes datos en localStorage y quieres migrar a Supabase:
1. Configura Supabase según la documentación
2. Inicia sesión en la aplicación
3. Los datos se migrarán automáticamente al iniciar sesión por primera vez
4. Las imágenes se migrarán de base64 a Supabase Storage

Para más detalles, consulta `documentation/image-storage-migration-guide.md`.

## Solución de Problemas

### La aplicación no inicia
- Verifica que Node.js esté instalado: `node --version`
- Reinstala dependencias: `rm -rf node_modules && npm install`
- Verifica que el puerto 5173 esté disponible

### Errores con Supabase
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el proyecto Supabase esté activo
- Revisa la consola del navegador para errores específicos
- Consulta `documentation/supabase-integration-guide.md`

### Los datos no se guardan
- Verifica que el navegador permita localStorage
- Si usas modo privado/incógnito, algunos navegadores bloquean localStorage
- Verifica la consola del navegador para errores

## Autor

**williamfloress.dev**

## Licencia

Este proyecto es privado. Todos los derechos reservados.

## Contribuciones

Este es un proyecto personal. Si deseas contribuir o reportar problemas, por favor abre un issue en el repositorio.

## Soporte

Para preguntas o problemas:
- Revisa la documentación en `documentation/`
- Abre un issue en el repositorio
- Contacta al autor: williamfloress.dev

---

**Versión**: 0.1.0

¡Feliz trading!
