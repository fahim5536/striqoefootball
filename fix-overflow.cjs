const fs = require('fs');

const css = `
/* Global Box Sizing & Mobile Overflow Prevention */
html, body {
  overflow-x: hidden;
  max-width: 100vw;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
}

img, video, canvas, svg {
  max-width: 100%;
  height: auto;
}

main, section {
  max-width: 100vw;
  overflow-x: hidden;
}
`;

fs.appendFileSync('src/index.css', css);
