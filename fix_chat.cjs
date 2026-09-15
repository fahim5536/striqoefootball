const fs = require('fs');

let code = fs.readFileSync('src/components/GlobalChat.tsx', 'utf8');

code = code.replace(
  'onClick={() => setIsOpen(true)}',
  'onClick={() => setIsOpen(!isOpen)}'
);

code = code.replace(
  'z-[100] flex flex-col shadow-2xl"',
  'z-[1001] flex flex-col shadow-2xl"'
);

code = code.replace(
  'className="fixed bottom-6 right-6 z-50 p-4',
  'className="fixed bottom-6 right-6 z-[1002] p-4'
);

fs.writeFileSync('src/components/GlobalChat.tsx', code);
console.log('Fixed GlobalChat');
