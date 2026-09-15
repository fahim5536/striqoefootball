const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = `            <div className="hero-image-wrapper">
              <img 
                src="/striqohome.png" 
                alt="STRIQO eFootball Championship" 
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>`;

const replacement = `            <div className="hero-image-wrapper">
              <img 
                src="/striqohome.png" 
                alt="STRIQO eFootball Championship" 
                className="hero-image"
              />
            </div>
          </div>
        </div>

        {/* Hero Right Side Labels */}
        <div className="hero-right-labels">
          <div className="hero-label-item">
            FRIENDLIES <span className="hero-label-dot">•</span>
          </div>
          <div className="hero-label-item active">
            TOURNAMENTS <span className="hero-label-line" />
          </div>
          <div className="hero-label-item">
            LEADERBOARD <span className="hero-label-dot">•</span>
          </div>
        </div>
      </section>`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
