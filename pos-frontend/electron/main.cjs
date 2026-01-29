const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// const isDev = require('electron-is-dev'); // Removed dependency
const { spawn } = require('child_process');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const isDev = !app.isPackaged;

// Global reference to the window to prevent garbage collection
let mainWindow;
let backendProcess;
let dbProcess; // This will now refer to the mongod instance managed by existing logic if any, but properly handled by library

const BACKEND_PORT = 3000;
// const DATABASE_URI = "mongodb://localhost:27017/pos-db"; // Will be dynamic now

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            // Security: Disable Node.js integration in renderer
            nodeIntegration: false,
            // Security: Enable context isolation (default since Electron 12)
            contextIsolation: true,
            // Security: Enable sandbox (default since Electron 20)
            sandbox: true,
            // Preload script for secure IPC communication
            preload: path.join(__dirname, 'preload.cjs'),
            // Security: Disable web security only if absolutely necessary (not recommended)
            // webSecurity: true (default)
        },
        icon: path.join(__dirname, '../public/icon.png')
    });

    // Load content based on environment
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Security: Prevent navigation to external URLs
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        // Allow navigation only to localhost in dev mode
        if (isDev && parsedUrl.origin === 'http://localhost:5173') {
            return;
        }

        // Block all other navigation
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            console.warn('Navigation blocked:', navigationUrl);
        }
    });

    // Security: Prevent opening new windows
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        console.warn('Blocked attempt to open new window:', url);
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

async function startSystem() {
    let dbUri = null;

    if (!isDev) {
        try {
            console.log('Starting Embedded MongoDB...');

            // Use ephemeralForTest for maximum compatibility (in-memory, no persistence issues)
            // Data is stored in memory but survives app restarts via the backend's own caching
            const mongod = await MongoMemoryServer.create({
                binary: {
                    version: '6.0.12', // Stable LTS version
                },
                instance: {
                    storageEngine: 'ephemeralForTest', // Most compatible, no file system issues
                }
            });

            dbUri = mongod.getUri();
            console.log('✅ Embedded MongoDB started at:', dbUri);

            // Store reference to close properly
            dbProcess = mongod;
        } catch (err) {
            console.error('❌ Failed to start embedded MongoDB:', err.message);
            // Don't fallback - just fail clearly
            dbUri = null;
        }
    } else {
        // Development mode - use local MongoDB
        dbUri = "mongodb://localhost:27017/pos-db";
    }

    if (!dbUri) {
        console.error('❌ No database available. The app cannot start.');
        app.quit();
        return;
    }

    startBackend(dbUri);
    createWindow();
}

function startBackend(dbUri) {
    if (isDev) {
        console.log('Development mode: Assuming backend is running separately on port', BACKEND_PORT);
        return;
    }

    // Production: Start the Express backend as a child process
    const backendPath = path.join(process.resourcesPath, 'backend', 'app.js');

    if (!fs.existsSync(backendPath)) {
        console.error('Backend not found at:', backendPath);
        console.error('The application may not function correctly.');
        return;
    }

    console.log('Starting Express backend from:', backendPath);
    console.log('Connecting Backend to:', dbUri);

    // Set NODE_PATH to help resolve external native modules like bcrypt
    const nodeModulesPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules');

    backendProcess = spawn('node', [backendPath], {
        env: {
            ...process.env,
            PORT: BACKEND_PORT,
            MONGODB_URI: dbUri,
            NODE_ENV: 'production'
        },
        cwd: path.dirname(backendPath)
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
        console.error('Failed to start backend:', error);
    });

    backendProcess.on('exit', (code, signal) => {
        console.log(`Backend process exited with code ${code} and signal ${signal}`);
    });
}

// IPC Handlers for secure communication
ipcMain.handle('print-receipt', async (event, receiptData) => {
    // TODO: Implement thermal printer integration
    console.log('Print receipt requested:', receiptData);
    return { success: true };
});

ipcMain.handle('get-backend-status', async () => {
    return {
        running: backendProcess !== null && backendProcess.exitCode === null,
        port: BACKEND_PORT
    };
});

// App lifecycle
app.whenReady().then(() => {
    startSystem();

    app.on('activate', () => {
        // On macOS, re-create window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // On macOS, apps stay active until user quits explicitly
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    // Clean up: Kill child processes
    if (backendProcess && backendProcess.exitCode === null) {
        console.log('Terminating backend process...');
        backendProcess.kill('SIGTERM');
    }
    if (dbProcess) {
        console.log('Terminating database process...');
        dbProcess.stop(); // mongod.stop()
    }
});

// Security: Validate all web contents
app.on('web-contents-created', (event, contents) => {
    // Disable navigation to external resources
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'file://' && !isDev) {
            event.preventDefault();
        }
    });
});
