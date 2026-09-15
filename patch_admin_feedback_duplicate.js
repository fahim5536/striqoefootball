import fs from 'fs';

let code = fs.readFileSync('src/components/AdminFeedback.tsx', 'utf8');

code = code.replace(
  `                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Admin Notes</label>`,
  `                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Duplicate Of (Feedback ID)</label>
                  <input 
                    type="text"
                    value={f.duplicateOf || ''}
                    onChange={(e) => updateFeedback(f.id, { duplicateOf: e.target.value })}
                    placeholder="ID of original feedback..."
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Admin Notes</label>`
);

// We need to change the grid to have 3 columns or just 2 columns and put duplicateOf below severity.
// Wait, the grid was grid-cols-2. Let's just add it as a 3rd item, it will wrap or we can change to grid-cols-3.

fs.writeFileSync('src/components/AdminFeedback.tsx', code);
