const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf-8');

// We'll replace the existing .stats-grid definitions with a unified one.
// The easiest way is to append a strong override at the very end to ensure it takes precedence,
// or we can remove the old ones.

css = css.replace(/\.stats-grid\s*\{[^}]+\}/g, '');
css = css.replace(/@media[^{]+\{\s*\.stats-grid\s*\{[^}]+\}\s*\}/g, '');

// Also clean up other stat-* elements? Let's just append the new styles.
fs.writeFileSync('src/index.css', css);
