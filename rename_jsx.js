const fs = require('fs');
const path = require('path');

const hrPortalDir = 'd:\\team-lead-main\\client\\src\\hr-portal';

function renameJsToJsx(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            renameJsToJsx(fullPath);
        } else if (fullPath.endsWith('.js') && !fullPath.includes('api.js')) {
            // we skip api.js as it doesn't contain jsx
            const newPath = fullPath.replace(/\.js$/, '.jsx');
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} -> ${newPath}`);
        }
    }
}

// Strip out .js from extensions in imports inside pages and components
function stripJsExtensions(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            stripJsExtensions(fullPath);
        } else if (fullPath.endsWith('.jsx')) { // Process after renaming
            let content = fs.readFileSync(fullPath, 'utf-8');
            // Remove explicit .js extension from imports (e.g. import Foo from './Foo.js')
            const newContent = content.replace(/from\s+['"]([^'"]+)\.js['"]/g, "from '$1'");
            if(content !== newContent) {
                 fs.writeFileSync(fullPath, newContent);
                 console.log(`Stripped .js from imports in: ${fullPath}`);
            }
        }
    }
}

renameJsToJsx(path.join(hrPortalDir, 'pages'));
renameJsToJsx(path.join(hrPortalDir, 'components'));
if (fs.existsSync(path.join(hrPortalDir, 'context'))) {
    renameJsToJsx(path.join(hrPortalDir, 'context'));
}

// Strip extensions after rename
stripJsExtensions(path.join(hrPortalDir, 'pages'));
stripJsExtensions(path.join(hrPortalDir, 'components'));
if (fs.existsSync(path.join(hrPortalDir, 'context'))) {
    stripJsExtensions(path.join(hrPortalDir, 'context'));
}

console.log("Renaming and stripping completed successfully.");
