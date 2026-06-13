// src/app/privacy-policy/page.tsx
'use client'
import { LandingNav, LandingFooter, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const SECTIONS = [
  { title: '1. Information We Collect', content: `We collect information you provide directly to us when you create an account, book a lesson, or contact us. This includes your name, email address, country, phone number (optional), and payment information. We also automatically collect certain information about your device and how you use our platform, including IP address, browser type, and pages visited.` },
  { title: '2. How We Use Your Information', content: `We use the information we collect to provide, maintain, and improve our services; process transactions and send related information; match students with appropriate teachers; send administrative messages, updates, and promotional communications; monitor and analyse usage patterns; and comply with legal obligations.` },
  { title: '3. Information Sharing', content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with teachers on our platform to facilitate lessons, payment processors to handle transactions, and service providers who assist us in operating our platform. We may also disclose information when required by law or to protect the rights and safety of our users.` },
  { title: '4. Data Security', content: `We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. All data is encrypted in transit using SSL/TLS. Passwords are hashed and never stored in plain text. However, no method of transmission over the internet is 100% secure.` },
  { title: '5. Cookies', content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. See our Cookie Policy for full details.` },
  { title: '6. Children\'s Privacy', content: `Our platform is available to children under the supervision of a parent or guardian. Parents must create an account and actively monitor their child's lessons. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If you believe your child has provided us with personal information without your consent, please contact us immediately.` },
  { title: '7. Your Rights', content: `You have the right to access, update, or delete your personal information at any time through your account settings. You may also request a copy of your data, request restriction of processing, or object to processing. To exercise these rights, contact us at info@quranmentorglobal.com. We will respond within 30 days.` },
  { title: '8. Data Retention', content: `We retain your personal information for as long as your account is active or as needed to provide our services. If you close your account, we will delete your personal information within 90 days, except where we are required to retain it for legal purposes.` },
  { title: '9. Changes to This Policy', content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.` },
  { title: '10. Contact Us', content: `If you have any questions about this Privacy Policy, please contact us at: info@quranmentorglobal.com | QuranMentorGlobal.com | Lahore, Pakistan` },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <style>{LANDING_CSS + `
        .legal-page { padding: 80px 0 100px; background: #fff; }
        .legal-inner { max-width: 780px; margin: 0 auto; }
        .legal-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--gold-pale); color: var(--green-dark); font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 6px 16px; border-radius: 50px; margin-bottom: 20px; }
        .legal-inner h1 { font-family: var(--ff); font-size: clamp(28px,4vw,44px); font-weight: 800; color: var(--green-dark); margin-bottom: 10px; }
        .legal-meta { font-size: 14px; color: var(--tl); margin-bottom: 48px; padding-bottom: 24px; border-bottom: 2px solid var(--cream-d); }
        .legal-section { margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid var(--cream-d); }
        .legal-section:last-child { border-bottom: none; }
        .legal-section h2 { font-family: var(--ff); font-size: 20px; font-weight: 700; color: var(--green-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
        .legal-section h2::before { content: ''; width: 4px; height: 22px; background: linear-gradient(var(--green), var(--gold)); border-radius: 2px; flex-shrink: 0; }
        .legal-section p { font-size: 15px; color: var(--tm); line-height: 1.85; }
        .legal-nav { background: var(--cream); border-radius: 16px; padding: 24px 28px; margin-bottom: 48px; }
        .legal-nav h3 { font-size: 13px; font-weight: 700; color: var(--green-dark); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px; }
        .legal-nav ul { display: flex; flex-direction: column; gap: 8px; }
        .legal-nav ul li a { font-size: 14px; color: var(--green); text-decoration: none; display: flex; align-items: center; gap: 6px; transition: gap .2s; }
        .legal-nav ul li a:hover { gap: 10px; }
        .legal-links { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--cream-d); }
        .legal-links a { font-size: 14px; color: var(--green); font-weight: 600; text-decoration: none; }
        .legal-links a:hover { text-decoration: underline; }
        .page-hero { background-color: var(--green-dark); }
        #stbtn{position:fixed;bottom:28px;right:28px;width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:1;transition:all .4s;box-shadow:0 4px 20px rgba(27,94,55,.4)}
      `}</style>

      <LandingNav />

      <section className="page-hero" style={{background:'linear-gradient(135deg,#0D3D20,#1B5E37)',padding:'80px 0 60px',textAlign:'center'}}>
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Privacy Policy</span></div>
          <h1 style={{fontFamily:'var(--ff)',fontSize:'clamp(28px,4vw,50px)',fontWeight:800,color:'#fff',marginBottom:12}}>Privacy <span>Policy</span></h1>
          <p style={{fontSize:16,color:'rgba(255,255,255,.72)',maxWidth:480,margin:'0 auto'}}>How we collect, use, and protect your personal information.</p>
        </div>
      </section>

      <section className="legal-page">
        <div className="container">
          <div className="legal-inner">
            <div className="legal-meta">
              <strong>Last Updated:</strong> January 2025 &nbsp;·&nbsp; <strong>Effective Date:</strong> January 2025 &nbsp;·&nbsp; <a href="mailto:info@quranmentorglobal.com" style={{color:'var(--green)'}}>info@quranmentorglobal.com</a>
            </div>

            <div className="legal-nav">
              <h3>Contents</h3>
              <ul>
                {SECTIONS.map((s, i) => (
                  <li key={i}><a href={`#s${i}`}>→ {s.title}</a></li>
                ))}
              </ul>
            </div>

            {SECTIONS.map((s, i) => (
              <div className="legal-section" key={i} id={`s${i}`}>
                <h2>{s.title}</h2>
                <p>{s.content}</p>
              </div>
            ))}

            <div className="legal-links">
              <Link href="/terms-of-service">Terms of Service</Link>
              <Link href="/cookie-policy">Cookie Policy</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
