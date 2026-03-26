const fs = require('fs');
const path = require('path');

const srcFrontend = 'd:\\HR Portal\\HR-portal\\src';
const destFrontend = 'd:\\team-lead-main\\client\\src\\hr-portal';

const srcBackend = 'd:\\HR Portal\\hr-portal-backend';
const destBackend = 'd:\\team-lead-main\\server\\src\\hr-portal-backend';

function copyDirRecursiveSync(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(file => {
        const curSrc = path.join(src, file);
        const curDest = path.join(dest, file);
        if (fs.lstatSync(curSrc).isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === 'build') return;
            copyDirRecursiveSync(curSrc, curDest);
        } else {
            fs.copyFileSync(curSrc, curDest);
        }
    });
}

// 1. Copy Frontend
console.log("Copying Frontend...");
copyDirRecursiveSync(path.join(srcFrontend, 'pages'), path.join(destFrontend, 'pages'));
copyDirRecursiveSync(path.join(srcFrontend, 'components'), path.join(destFrontend, 'components'));
copyDirRecursiveSync(path.join(srcFrontend, 'api'), path.join(destFrontend, 'api'));
copyDirRecursiveSync(path.join(srcFrontend, 'context'), path.join(destFrontend, 'context'));
copyDirRecursiveSync(path.join(srcFrontend, 'utils'), path.join(destFrontend, 'utils'));
// Ensure api URL is correct in the ported hr-portal api.js
const apiJsPath = path.join(destFrontend, 'api', 'api.js');
if (fs.existsSync(apiJsPath)) {
    let apiCode = fs.readFileSync(apiJsPath, 'utf8');
    // Change baseURL from whatever it was to exactly where our backend will serve it
    apiCode = apiCode.replace(/baseURL:\s*['"`].*?['"`]/, "baseURL: 'http://localhost:5000/api/hr-portal'");
    fs.writeFileSync(apiJsPath, apiCode);
}

// 2. Copy Backend
console.log("Copying Backend...");
copyDirRecursiveSync(path.join(srcBackend, 'controllers'), path.join(destBackend, 'controllers'));
copyDirRecursiveSync(path.join(srcBackend, 'models'), path.join(destBackend, 'models'));
copyDirRecursiveSync(path.join(srcBackend, 'routes'), path.join(destBackend, 'routes'));
copyDirRecursiveSync(path.join(srcBackend, 'utils'), path.join(destBackend, 'utils'));

if (fs.existsSync(path.join(srcBackend, 'middleware'))) {
    copyDirRecursiveSync(path.join(srcBackend, 'middleware'), path.join(destBackend, 'middleware'));
}

console.log("Copy complete!");
