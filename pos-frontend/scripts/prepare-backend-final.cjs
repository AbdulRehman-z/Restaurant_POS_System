const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '../../pos-backend');
const destDir = path.resolve(__dirname, '../resources/backend');

console.log('🚀 Preparing Backend for Electron...');

// 1. Clean destination
if (fs.existsSync(destDir)) {
    console.log('🧹 Cleaning previous build...');
    fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

//2. Copy ALL files including node_modules
console.log('📂 Copying backend files...');
execSync(`cp -r ${sourceDir}/* ${destDir}/`, { stdio: 'inherit' });

// 3. Ensure node_modules exists and is production-ready
console.log('📦 Installing production dependencies...');
try {
    execSync('npm install --production --legacy-peer-deps', { cwd: destDir, stdio: 'inherit' });
} catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    process.exit(1);
}

console.log('✅ Backend prepared at:', destDir);
