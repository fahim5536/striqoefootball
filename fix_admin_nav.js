import fs from 'fs';
let code = fs.readFileSync('src/components/Admin.tsx', 'utf8');

const navLinksOld = `          <a className={\`sidebar-link \${activeTab === 'logs' ? 'active' : ''}\`} onClick={() => setActiveTab('logs')}>
            <span className="nav-icon">📋</span> Activity Logs
          </a>
        </nav>`;

const navLinksNew = `          <a className={\`sidebar-link \${activeTab === 'logs' ? 'active' : ''}\`} onClick={() => setActiveTab('logs')}>
            <span className="nav-icon">📋</span> Activity Logs
          </a>
          <div className="nav-group-label">OPERATIONS</div>
          <a className={\`sidebar-link \${activeTab === 'features' ? 'active' : ''}\`} onClick={() => setActiveTab('features')}>
            <span className="nav-icon">🚩</span> Feature Flags
          </a>
          <a className={\`sidebar-link \${activeTab === 'remoteConfig' ? 'active' : ''}\`} onClick={() => setActiveTab('remoteConfig')}>
            <span className="nav-icon">🎛️</span> Remote Config
          </a>
          <a className={\`sidebar-link \${activeTab === 'feedback' ? 'active' : ''}\`} onClick={() => setActiveTab('feedback')}>
            <span className="nav-icon">💬</span> Beta Feedback
          </a>
          <a className={\`sidebar-link \${activeTab === 'experiments' ? 'active' : ''}\`} onClick={() => setActiveTab('experiments')}>
            <span className="nav-icon">🧪</span> Experiments
          </a>
        </nav>`;

const renderOld = `          {activeTab === 'logs' && <AdminLogs />}`;

const renderNew = `          {activeTab === 'logs' && <AdminLogs />}
          {activeTab === 'features' && <AdminFeatureFlags />}
          {activeTab === 'remoteConfig' && <AdminRemoteConfig />}
          {activeTab === 'feedback' && <AdminFeedback />}
          {activeTab === 'experiments' && <AdminExperiments />}`;

const importsNew = `import AdminFeatureFlags from './AdminFeatureFlags';
import AdminRemoteConfig from './AdminRemoteConfig';
import AdminFeedback from './AdminFeedback';
import AdminExperiments from './AdminExperiments';
export default function Admin() {`;

code = code.replace(navLinksOld, navLinksNew);
code = code.replace(renderOld, renderNew);
code = code.replace("export default function Admin() {", importsNew);

fs.writeFileSync('src/components/Admin.tsx', code);
console.log('Fixed admin nav');
