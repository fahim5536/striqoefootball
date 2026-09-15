import fs from 'fs';

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  `<div className="modal-input-group">
                  <input type="text" className="modal-input" placeholder="eFootball User ID" required id="googleEfootballId" />
                </div>`,
  `<div className="modal-input-group">
                  <input type="text" className="modal-input" placeholder="eFootball User ID" required id="googleEfootballId" />
                </div>
                <div className="modal-input-group" style={{ marginTop: '8px' }}>
                  <input type="text" className="modal-input" placeholder="Beta Invitation Code (Required)" required value={betaCode} onChange={(e) => setBetaCode(e.target.value)} style={{ borderColor: '#00e5ff' }} />
                </div>`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
