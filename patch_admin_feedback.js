import fs from 'fs';

let code = fs.readFileSync('src/components/AdminFeedback.tsx', 'utf8');

code = code.replace(
  "const updateStatus = async (id: string, status: string) => {",
  "const updateFeedback = async (id: string, data: any) => {\n    try {\n      await fetch(`/api/feedbacks/${id}`, {\n        method: 'PUT',\n        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },\n        body: JSON.stringify(data)\n      });\n      fetchFeedbacks();\n    } catch (e) {\n      console.error(e);\n    }\n  };\n\n  const updateStatus = async (id: string, status: string) => {"
);

code = code.replace(
  "onChange={(e) => updateStatus(f.id, e.target.value)}",
  "onChange={(e) => updateFeedback(f.id, { status: e.target.value })}"
);

code = code.replace(
  /<div className="flex-1">[\s\S]*?<div className="flex justify-between items-start mb-2">[\s\S]*?<div>[\s\S]*?<div className="flex items-center gap-2 mb-1">/m,
  `<div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">`
);

code = code.replace(
  `{f.category && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{f.category}</span>}`,
  `{f.category && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{f.category}</span>}
                    {f.priority && <span className={\`text-xs px-2 py-0.5 rounded font-bold \${f.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-300'}\`}>{f.priority}</span>}
                    {f.severity && <span className={\`text-xs px-2 py-0.5 rounded \${f.severity === 'CRITICAL' ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-300'}\`}>{f.severity}</span>}`
);

code = code.replace(
  `<p className="text-white text-sm whitespace-pre-wrap">{f.content}</p>`,
  `<p className="text-white text-sm whitespace-pre-wrap">{f.content}</p>
              
              <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
                  <select 
                    value={f.priority || 'MEDIUM'}
                    onChange={(e) => updateFeedback(f.id, { priority: e.target.value })}
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Severity</label>
                  <select 
                    value={f.severity || 'MINOR'}
                    onChange={(e) => updateFeedback(f.id, { severity: e.target.value })}
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="MINOR">Minor</option>
                    <option value="MAJOR">Major</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Admin Notes</label>
                  <textarea 
                    value={f.adminNotes || ''}
                    onChange={(e) => updateFeedback(f.id, { adminNotes: e.target.value })}
                    placeholder="Internal notes..."
                    className="w-full text-sm bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                  />
                </div>
              </div>`
);

fs.writeFileSync('src/components/AdminFeedback.tsx', code);
