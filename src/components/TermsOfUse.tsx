import React from 'react';

export default function TermsOfUse() {
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '100px', background: 'var(--bg-main)', minHeight: '100vh' }}>
      <div className="container-max" style={{ padding: '0 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ 
          fontFamily: '"Inter", sans-serif', 
          fontSize: 'clamp(32px, 5vw, 48px)', 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          color: '#ffffff', 
          marginBottom: '16px' 
        }}>
          Terms of Use
        </h1>
        <div style={{ 
          fontFamily: '"Inter", sans-serif', 
          fontSize: '14px', 
          fontWeight: 600, 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase', 
          color: '#00e5ff', 
          marginBottom: '48px',
          borderBottom: '1px solid rgba(0,229,255,0.2)',
          paddingBottom: '24px'
        }}>
          Last Updated: August 24, 2026
        </div>

        <div style={{ 
          fontFamily: '"Inter", sans-serif', 
          fontSize: '16px', 
          color: '#F8FAFC', 
          lineHeight: 1.8,
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>1. Acceptance of Terms</h2>
            <p>
              Welcome to Striqo ("we," "our," or "us"). By accessing, registering for, or using the Striqo platform, website, mobile applications, or any associated services (collectively, the "Services"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to all the terms and conditions outlined herein, you may not access or use the Services.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>2. User Eligibility and Accounts</h2>
            <p style={{ marginBottom: '16px' }}>
              <strong>Eligibility:</strong> You must be at least 13 years of age to use the Services. If you are under the age of majority in your jurisdiction, you must have the consent of a parent or legal guardian.
            </p>
            <p>
              <strong>Account Registration:</strong> To participate in tournaments and access certain features, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to keep your account information updated. You are entirely responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>3. Fair Play and Conduct</h2>
            <p style={{ marginBottom: '16px' }}>Striqo is dedicated to fostering a competitive yet respectful e-sports environment. By participating, you agree to adhere to the following rules of conduct:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>No Cheating:</strong> The use of exploits, hacks, unauthorized third-party software, match-fixing, or any method to gain an unfair advantage is strictly prohibited.</li>
              <li><strong>Respectful Behavior:</strong> Harassment, abuse, hate speech, threats, or toxic behavior toward other players, admins, or staff will not be tolerated.</li>
              <li><strong>Accurate Reporting:</strong> You must report match results truthfully. Submitting false screenshots or fraudulent match results is a violation of these Terms.</li>
              <li><strong>Compliance:</strong> You must comply with all specific rules set forth for individual tournaments or events hosted on Striqo.</li>
            </ul>
            <p style={{ marginTop: '16px' }}>Failure to comply with these rules may result in immediate disqualification, suspension, or permanent termination of your account at our sole discretion.</p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>4. Tournaments and Rewards</h2>
            <p>
              Striqo may offer tournaments, leagues, and events that feature prizes, virtual currency, or other rewards. The rules, structure, and prize distribution for each event will be detailed on the specific event page. We reserve the right to modify, delay, or cancel tournaments due to technical issues, insufficient participation, or suspected fraudulent activity. Any rewards earned on the platform (e.g., Striqo Coins) have no real-world monetary value unless explicitly stated otherwise, and are non-transferable outside of the platform.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>5. Intellectual Property</h2>
            <p>
              All content on the Striqo platform, including but not limited to text, graphics, logos, images, software, and the compilation thereof, is the property of Striqo or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of any content without our express written consent. eFootball and related trademarks are the property of Konami Digital Entertainment Co., Ltd., and Striqo is not officially affiliated with or endorsed by Konami.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Striqo and its affiliates, directors, employees, or agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Services; (b) any conduct or content of any third party on the Services; or (c) unauthorized access, use, or alteration of your transmissions or content.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to the Services at any time, with or without cause, and with or without notice, including for violations of these Terms. Upon termination, your right to use the Services will immediately cease.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>8. Changes to Terms</h2>
            <p>
              We may revise these Terms of Use from time to time. If we make material changes, we will notify you by updating the "Last Updated" date at the top of these Terms and, where appropriate, providing additional notice. Your continued use of the Services following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>9. Contact Information</h2>
            <p>
              If you have any questions or concerns about these Terms of Use, please contact our support team at <strong>support@striqo.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
