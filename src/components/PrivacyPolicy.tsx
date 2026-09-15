import React from 'react';

export default function PrivacyPolicy() {
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
          Privacy Policy
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
          Effective Date: August 24, 2026
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
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>1. Introduction</h2>
            <p>
              Welcome to Striqo! We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website, mobile application, and related services (collectively, the "Services"). By accessing or using our Services, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>2. Information We Collect</h2>
            <p style={{ marginBottom: '16px' }}>We may collect the following types of information when you use Striqo:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, username, password, and profile picture.</li>
              <li><strong>Gaming Data:</strong> We collect information related to your eFootball ID, tournament participation, match scores, leaderboards, and in-game achievements.</li>
              <li><strong>Device & Usage Information:</strong> We automatically collect information about the device you use to access Striqo, such as IP address, browser type, operating system, and pages visited.</li>
              <li><strong>Communications:</strong> If you contact our support team or communicate with other users on the platform, we may retain records of those communications.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>3. How We Use Your Information</h2>
            <p style={{ marginBottom: '16px' }}>We use the information we collect for various purposes, including:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>To provide, maintain, and improve our Services, including managing tournaments and matchmaking.</li>
              <li>To personalize your experience and deliver content tailored to your gaming interests.</li>
              <li>To communicate with you regarding updates, announcements, security alerts, and support messages.</li>
              <li>To enforce our Terms of Use and maintain a safe, fair, and respectful gaming environment.</li>
              <li>To analyze usage trends and optimize the performance of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>4. Sharing of Information</h2>
            <p>
              We do not sell your personal information to third parties. We may share your information in the following circumstances:
              <br/><br/>
              <strong>With Other Users:</strong> Your username, eFootball ID, tournament history, and leaderboard rankings are visible to other users on the platform.
              <br/><br/>
              <strong>With Service Providers:</strong> We may share information with trusted third-party vendors who assist us in operating our Services (e.g., hosting, analytics, customer support).
              <br/><br/>
              <strong>For Legal Reasons:</strong> We may disclose information if required by law, regulation, or legal process, or to protect the rights, property, or safety of Striqo, our users, or the public.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>5. Data Security</h2>
            <p>
              We implement industry-standard security measures designed to protect your personal information from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security. You are responsible for keeping your account credentials confidential.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>6. Your Rights & Choices</h2>
            <p>
              You have the right to access, update, or delete your account information at any time through your profile settings. You may also opt out of receiving promotional emails by following the unsubscribe instructions included in those emails. Please note that even if you opt out, we may still send you non-promotional administrative messages related to your account.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page and updating the "Effective Date" at the top. Your continued use of the Services after such updates constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>8. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at <strong>privacy@striqo.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
