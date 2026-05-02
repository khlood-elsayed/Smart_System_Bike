const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const regex1 = /import \* as Icons from '\.\.\/assets\/icons';/g;
      if (regex1.test(content)) {
        content = content.replace(regex1, "import * as Icons from '../assets/Icons.jsx';");
        changed = true;
      }
      
      const regex2 = /import \* as Icons from '\.\.\/\.\.\/assets\/icons';/g;
      if (regex2.test(content)) {
        content = content.replace(regex2, "import * as Icons from '../../assets/Icons.jsx';");
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Done fixing Icon imports.');
