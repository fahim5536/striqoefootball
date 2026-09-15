import fs from 'fs';

let code = fs.readFileSync('logger.ts', 'utf8');

const newFormat = `
    new winston.transports.Console({
      format: config.server.env === 'production' 
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
`;

const oldFormatRegex = /new winston\.transports\.Console\(\{[\s\S]*?\}\),/;
if (code.match(oldFormatRegex)) {
  code = code.replace(oldFormatRegex, newFormat);
  fs.writeFileSync('logger.ts', code);
  console.log('Logger format updated');
} else {
  console.log('Old logger format not found');
}
