const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const backendEntry = path.resolve(__dirname, '../../pos-backend/app.js');
const outputDir = path.resolve(__dirname, '../resources');
const outputFile = path.join(outputDir, 'server.bundle.js');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📦 Bundling Express Backend...');

esbuild.build({
    entryPoints: [backendEntry],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: outputFile,
    external: [
        // Mark native modules as external - electron-builder will handle them
    ],
    packages: 'external', // Don't bundle node_modules at all
    loader: {
        '.node': 'file'
    },
    minify: false, // Keep readable for debugging
    sourcemap: true,
    logLevel: 'info',
})
    .then(() => {
        console.log('✅ Backend bundled successfully!');
        console.log('   Output:', outputFile);
        const backendNodeModules = path.resolve(__dirname, '../../pos-backend/node_modules');
        const bcryptSource = path.join(backendNodeModules, 'bcrypt');
        const bcryptDest = path.join(outputDir, 'node_modules', 'bcrypt');

        if (fs.existsSync(bcryptSource)) {
            console.log('📋 Copying bcrypt native module...');
            fs.cpSync(bcryptSource, bcryptDest, { recursive: true });
            console.log('✅ bcrypt copied!');
        }
    })
    .catch((err) => {
        console.error('❌ Build failed:', err);
        process.exit(1);
    });
