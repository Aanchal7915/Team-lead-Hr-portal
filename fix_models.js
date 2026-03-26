const fs = require('fs');
const path = require('path');

const modelsDir = 'd:\\team-lead-main\\server\\src\\hr-portal-backend\\models';
const files = fs.readdirSync(modelsDir);

files.forEach(file => {
    if(file.endsWith('.js')) {
        const filePath = path.join(modelsDir, file);
        let content = fs.readFileSync(filePath, 'utf-8');
        
        // Find "mongoose.model('Name', " and safely replace with "mongoose.model('LegacyName', "
        content = content.replace(/mongoose\.model\(['"]([^'"]+)['"]\s*,/g, (match, modelName) => {
             // Only prepend if not already Legacy
             if(!modelName.startsWith('Legacy')) {
                 return `mongoose.model('Legacy${modelName}',`;
             }
             return match;
        });
        
        fs.writeFileSync(filePath, content);
    }
});

console.log("Model references namespaced successfully!");
