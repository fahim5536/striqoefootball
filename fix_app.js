import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldImport = `import SyncStatus from './components/SyncStatus';`;
const newImport = `import SyncStatus from './components/SyncStatus';
import FeedbackModal from './components/FeedbackModal';`;

const oldRender = `          <Footer />`;
const newRender = `          <Footer />
          <button 
            onClick={() => document.getElementById('feedback-modal')?.classList.remove('hidden')}
            className="fixed bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 z-40 tooltip" 
            title="Leave Feedback"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <div id="feedback-modal" className="hidden">
            <FeedbackModal onClose={() => document.getElementById('feedback-modal')?.classList.add('hidden')} />
          </div>`;

if(code.includes(oldImport) && !code.includes("FeedbackModal")) {
    code = code.replace(oldImport, newImport);
    code = code.replace(oldRender, newRender);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Added feedback button to app');
}
