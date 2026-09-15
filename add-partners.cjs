const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const target = `      {/* Featured Banner */}`;
const replacement = `      {/* Official Partners */}
      <section className="partners-section">
        <div className="container-max" style={{ textAlign: 'center', padding: '60px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>
          <h2 className="section-heading-premium" style={{ marginBottom: '40px', fontSize: '24px', letterSpacing: '0.15em', color: '#ffffff' }}>
            OFFICIAL PARTNERS
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '40px', opacity: 0.7 }}>
            <div style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '28px', fontWeight: 900, color: '#E2E8F0', letterSpacing: '0.1em' }}>
              KONAMI
            </div>
          </div>
        </div>
      </section>

      {/* Featured Banner */}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/Dashboard.tsx', code);
