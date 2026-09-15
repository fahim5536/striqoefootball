import fs from 'fs';
const mapData = JSON.parse(fs.readFileSync('dist/server.cjs.map', 'utf8'));
const sources = mapData.sources;
const contents = mapData.sourcesContent;

for (let i = 0; i < sources.length; i++) {
  if (sources[i] === 'server.ts' || sources[i].endsWith('server.ts')) {
    fs.writeFileSync('server.ts.recovered', contents[i]);
    console.log('Recovered server.ts!');
  }
}
