# 📊 ProTrader Journal

Una aplicación web moderna y profesional para llevar un registro detallado de tus operaciones de trading. Diseñada con una interfaz intuitiva y múltiples temas personalizables, ProTrader Journal te ayuda a analizar tu rendimiento y mejorar tus estrategias de trading.

## ✨ Características Principales

### 📝 Gestión de Operaciones
- **Registro de operaciones**: Crea, edita y elimina entradas de trading con información detallada
- **Vista de calendario**: Navega fácilmente por tus operaciones usando el calendario integrado
- **Filtros avanzados**: Filtra operaciones por fecha, par de divisas, resultado (ganancia/pérdida)
- **Estadísticas en tiempo real**: Visualiza métricas clave como ganancias totales, ratio de aciertos, mejor/peor operación

### 🎨 Personalización
- **Múltiples temas**: 6 temas oscuros y 6 temas claros para adaptar la interfaz a tu preferencia
- **Título personalizable**: Personaliza el nombre de tu journal
- **Tablero de visión**: Agrega imágenes motivacionales para mantenerte enfocado en tus objetivos

### 📈 Análisis y Métricas
- **Dashboard de estadísticas**: 
  - Ganancia/pérdida total
  - Número de operaciones ganadoras vs perdedoras
  - Ratio de aciertos (win rate)
  - Mejor y peor operación
  - Balance de cuenta actualizado
- **Gráficos visuales**: Representación gráfica de tus resultados
- **Análisis por par de divisas**: Estadísticas desglosadas por instrumento de trading

### 💾 Persistencia de Datos
- **Almacenamiento local**: Todos tus datos se guardan automáticamente en el navegador (localStorage)
- **Exportar datos**: Descarga tus datos en formato JSON para respaldo
- **Importar datos**: Restaura tus datos desde un archivo JSON previamente exportado
- **Sincronización automática**: Los cambios se guardan automáticamente sin necesidad de guardar manualmente

### 📱 Diseño Responsive
- **Interfaz adaptativa**: Funciona perfectamente en escritorio, tablet y móvil
- **Navegación optimizada**: Menús y controles adaptados para diferentes tamaños de pantalla

## 🛠️ Stack Tecnológico

- **React 19**: Framework de UI moderno y eficiente
- **Vite 6**: Build tool rápido para desarrollo y producción
- **Tailwind CSS 4**: Framework de utilidades CSS para diseño rápido
- **Lucide React**: Iconos modernos y consistentes
- **localStorage API**: Persistencia de datos en el navegador

### Dependencias Principales
- `react` / `react-dom`: Framework de UI
- `lucide-react`: Biblioteca de iconos
- `clsx`: Utilidad para manejo de clases CSS
- `tailwind-merge`: Merge inteligente de clases Tailwind

## 🚀 Instalación

### Requisitos Previos
- Node.js (versión LTS recomendada) - [Descargar Node.js](https://nodejs.org/)
- npm (incluido con Node.js)

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

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   - La aplicación se abrirá automáticamente en `http://localhost:5173`
   - Si no se abre automáticamente, navega manualmente a esa URL

## 📖 Uso

### Primera Vez
Al abrir la aplicación por primera vez, verás un modal de bienvenida donde podrás:
- Establecer el título de tu journal
- Seleccionar un tema inicial
- Configurar tu capital inicial
- Seleccionar los pares de divisas que operas

### Agregar una Operación
1. Haz clic en el botón **"Nueva Operación"** (icono +)
2. Completa los campos:
   - Fecha y hora
   - Par de divisas
   - Tipo de operación (Compra/Venta)
   - Precio de entrada y salida
   - Tamaño de la posición
   - Notas y observaciones
3. Guarda la operación

### Ver Estadísticas
- Accede al panel de métricas desde el botón de estadísticas
- Visualiza tus ganancias/pérdidas totales
- Revisa tu ratio de aciertos
- Analiza tus mejores y peores operaciones

### Personalizar Tema
1. Abre la configuración (icono de engranaje)
2. Selecciona la pestaña "Tema"
3. Elige entre los 12 temas disponibles (6 oscuros y 6 claros)
4. El cambio se aplica instantáneamente

### Exportar/Importar Datos
- **Exportar**: Ve a Configuración → Datos → Exportar. Se descargará un archivo JSON con todos tus datos
- **Importar**: Ve a Configuración → Datos → Importar. Selecciona un archivo JSON previamente exportado

## 📁 Estructura del Proyecto

```
tjournal/
├── src/
│   ├── App.jsx              # Componente principal de la aplicación
│   ├── main.jsx             # Punto de entrada de React
│   ├── index.css            # Estilos globales y Tailwind
│   └── utils/
│       └── storage.js        # Utilidades para localStorage (exportar/importar)
├── public/                  # Archivos estáticos
├── build/                   # Iconos para build de Electron (opcional)
├── dist/                    # Build de producción (generado)
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind CSS
├── postcss.config.js        # Configuración de PostCSS
├── eslint.config.js         # Configuración de ESLint
└── guide.md                 # Guía para convertir a app de escritorio
```

## 🔧 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo con hot-reload
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza el build de producción localmente

## 🖥️ Convertir a Aplicación de Escritorio

Esta aplicación puede convertirse en una aplicación de escritorio (.exe para Windows, .app para Mac, .AppImage para Linux) usando Electron. Consulta el archivo `guide.md` para instrucciones detalladas paso a paso.

### Resumen Rápido
1. Instalar Electron y dependencias:
   ```bash
   npm install --save-dev electron electron-builder wait-on concurrently cross-env
   ```
2. Crear archivo `electron.js` en la raíz
3. Modificar `package.json` con scripts de Electron
4. Ejecutar `npm run dist` para generar el ejecutable

## 🎯 Características Técnicas

### Persistencia de Datos
- Todos los datos se almacenan en `localStorage` del navegador
- Claves de almacenamiento versionadas (`_v1`) para futuras migraciones
- Validación de esquema al importar datos
- Soporte para merge o reemplazo completo de datos

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

## 📝 Notas de Desarrollo

- La aplicación utiliza React Hooks para el manejo de estado
- Los datos se persisten automáticamente en cada cambio
- El diseño está optimizado para rendimiento con React 19
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)

## 👤 Autor

**williamfloress.dev**

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 🤝 Contribuciones

Este es un proyecto personal. Si deseas contribuir o reportar problemas, por favor abre un issue en el repositorio.

---

**Versión**: 0.1.0

¡Feliz trading! 📈
