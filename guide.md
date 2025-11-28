# Guía Paso a Paso: Convertir ProTrader Journal en App de Escritorio (.exe)

Esta guía te permitirá tomar el código React que hemos creado y empaquetarlo en un archivo ejecutable profesional para Windows (o Mac/Linux) usando Vite + Electron.

## Paso 1: Requisitos Previos

Asegúrate de tener instalado Node.js en tu computadora.

- **Descargar**: https://nodejs.org/ (Versión LTS recomendada)

## Paso 2: Crear el Proyecto Base

Abre tu terminal (PowerShell o CMD) y ejecuta los siguientes comandos uno por uno:

```bash
# 1. Crear un nuevo proyecto con Vite (selecciona React + JavaScript cuando pregunte)
npm create vite@latest trading-journal-app -- --template react

# 2. Entrar en la carpeta
cd trading-journal-app

# 3. Instalar las dependencias necesarias para el diseño y la lógica
npm install lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer

# 4. Inicializar Tailwind CSS
npx tailwindcss init -p
```

## Paso 3: Configurar Estilos (Tailwind CSS)

### Configurar `tailwind.config.js`

Abre el archivo `tailwind.config.js` en tu editor y reemplaza `content: []` por:

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

### Configurar `src/index.css`

Abre el archivo `src/index.css` y reemplaza TODO su contenido por:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* Evita scrollbars dobles en la app de escritorio */
}
```

## Paso 4: Insertar el Código del Journal

1. Ve a la carpeta `src`
2. Elimina el archivo `App.css` (ya no lo necesitamos)
3. Abre el archivo `src/App.jsx` y borra todo su contenido
4. Pega el código completo del "TradingJournalMVP.jsx" que te proporcioné en el chat dentro de `src/App.jsx`

## Paso 5: Instalar y Configurar Electron

Ahora convertiremos esta web en una app de escritorio. En la terminal ejecuta:

```bash
npm install --save-dev electron electron-builder wait-on concurrently cross-env
```

### Crear archivo `electron.js`

Crea un archivo llamado `electron.js` en la raíz del proyecto (junto al `package.json`) y pega esto:

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true, // Oculta la barra de menú nativa fea
    title: "Trader Journal"
  });

  // En desarrollo carga la URL de Vite, en producción carga el archivo html compilado
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, './dist/index.html')}`;
  win.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Modificar `package.json`

Modifica el archivo `package.json`. Busca la sección `"scripts"` y reemplázala por esta:

```json
"main": "electron.js",
"scripts": {
  "dev": "concurrently -k \"cross-env BROWSER=none npm run react-start\" \"npm run electron-start\"",
  "react-start": "vite",
  "electron-start": "wait-on http://localhost:5173 && electron .",
  "build": "vite build",
  "dist": "npm run build && electron-builder",
  "preview": "vite preview"
},
"build": {
  "appId": "com.protrader.journal",
  "productName": "ProTrader Journal",
  "files": [
    "dist/**/*",
    "electron.js"
  ],
  "directories": {
    "output": "release"
  }
}
```

> **Nota Importante**: Debes añadir `"main": "electron.js",` al inicio del `package.json` (arriba de `"scripts"`).

## Paso 6: ¡Ejecutar y Crear el .exe!

### Para probarlo en modo desarrollo:

```bash
npm run dev
```

(Se abrirá una ventana de escritorio con tu aplicación funcionando).

### Para crear el archivo instalable (.exe):

```bash
npm run dist
```

Al finalizar, tendrás una nueva carpeta llamada `release`. Dentro encontrarás el instalador `ProTrader Journal Setup X.X.X.exe`.

¡Felicidades! Ahora tienes tu Journal de Trading profesional instalado en tu PC.
..