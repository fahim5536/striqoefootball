import fs from 'fs';

let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

code = code.replace(
  `import AdminExperiments from './AdminExperiments';`,
  `import AdminExperiments from './AdminExperiments';\nimport AdminBetaManagement from './AdminBetaManagement';`
);

code = code.replace(
  `<a className={\`sidebar-link \${activeTab === 'experiments' ? 'active' : ''}\`} onClick={() => setActiveTab('experiments')}>
            <span className="sidebar-icon">🧪</span>
            Experiments
          </a>`,
  `<a className={\`sidebar-link \${activeTab === 'experiments' ? 'active' : ''}\`} onClick={() => setActiveTab('experiments')}>
            <span className="sidebar-icon">🧪</span>
            Experiments
          </a>
          <a className={\`sidebar-link \${activeTab === 'beta' ? 'active' : ''}\`} onClick={() => setActiveTab('beta')}>
            <span className="sidebar-icon">🗝️</span>
            Beta Access
          </a>`
);

code = code.replace(
  `{activeTab === 'experiments' && <AdminExperiments />}`,
  `{activeTab === 'experiments' && <AdminExperiments />}\n          {activeTab === 'beta' && <AdminBetaManagement />}`
);

fs.writeFileSync('src/components/Admin.tsx', code);
