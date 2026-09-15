import fs from 'fs';

let code = fs.readFileSync('src/components/AdminFeatureFlags.tsx', 'utf8');

code = code.replace(
  `const toggleFlag = async (id: string, current: boolean) => {`,
  `const updateType = async (id: string, type: string) => {
    try {
      await fetch(\`/api/featureFlags/\${id}\`, {
        method: 'PUT',
        headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      fetchFlags();
    } catch (e) {}
  };

  const toggleFlag = async (id: string, current: boolean) => {`
);

code = code.replace(
  `<td className="p-4 text-sm text-zinc-400">
                  <span className="bg-zinc-800 px-2 py-1 rounded text-xs">{flag.type}</span>
                </td>`,
  `<td className="p-4 text-sm text-zinc-400">
                  <select 
                    value={flag.type} 
                    onChange={e => updateType(flag.id, e.target.value)}
                    className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none"
                  >
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="BETA_ONLY">BETA ONLY</option>
                    <option value="ADMIN_ONLY">ADMIN ONLY</option>
                  </select>
                </td>`
);

fs.writeFileSync('src/components/AdminFeatureFlags.tsx', code);
