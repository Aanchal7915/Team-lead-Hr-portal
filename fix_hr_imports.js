const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
        walk(p, callback);
    } else {
        callback(p);
    }
  });
};

const root = 'd:/team-lead-main/client/src/hr-portal';

walk(root, (file) => {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    let c = fs.readFileSync(file, 'utf8');
    // regex matches 'from' followed by quote, then relative path with NO dot near end
    let nc = c.replace(/from\s+(['"])(\.\.?[^'"]*?)(['"])/g, (match, quote, path) => {
      if (!path.match(/\.[a-zA-Z0-9]+$/)) {
        let ext = '.jsx';
        if (path.includes('/api/') || path.includes('/utils/')) {
           ext = '.js';
        }
        return `from ${quote}${path}${ext}${quote}`;
      }
      return match;
    });
    fs.writeFileSync(file, nc);
  }
});

console.log('Extensions added successfully');
