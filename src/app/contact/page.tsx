'use client'
import { LandingNav, LandingFooter, SocialIcons, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

export default function ContactPage() {
  function submitForm() {
    const fn = (document.getElementById('fn') as HTMLInputElement)?.value.trim()
    const em = (document.getElementById('em') as HTMLInputElement)?.value.trim()
    const rl = (document.getElementById('rl') as HTMLSelectElement)?.value
    if (!fn || !em || !rl) { alert('Please fill in your name, email, and goal.'); return }
    if (!/\S+@\S+\.\S+/.test(em)) { alert('Please enter a valid email.'); return }
    const form = document.getElementById('contactForm')
    const sb = document.getElementById('successBox')
    if (form) { form.style.opacity = '0'; setTimeout(() => { form.style.display = 'none'; if(sb) sb.style.display = 'block' }, 400) }
  }

  return (
    <>
      <style>{LANDING_CSS + `
        .contact-page{padding:100px 0;background:#fff}
        .contact-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
        .trust-items{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:28px 0}
        .ti{background:var(--cream);border-radius:12px;padding:16px;text-align:center}
        .ti-n{font-family:var(--ff);font-size:26px;font-weight:800;color:var(--green-dark);line-height:1}
        .ti-l{font-size:12px;color:var(--tl);margin-top:3px}
        .cform{background:var(--cream);border-radius:20px;padding:44px;border-top:4px solid var(--gold);box-shadow:0 4px 24px rgba(0,0,0,.09)}
        .cform h3{font-family:var(--ff);font-size:26px;font-weight:700;color:var(--green-dark);margin-bottom:6px}
        .hero-trust{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px}
        .htrust{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.9);font-size:13px;font-weight:500;padding:7px 16px;border-radius:50px}
        .success-box{display:none;text-align:center;padding:24px;background:linear-gradient(135deg,#e8f5ee,#d4eee1);border-radius:12px;color:var(--green);font-weight:500;font-size:15px;line-height:1.7}
        .fsub{width:100%;padding:15px;font-size:16px;border-radius:12px;margin-top:4px;cursor:pointer}
        @media(max-width:860px){.contact-inner{grid-template-columns:1fr;gap:48px}}
        @media(max-width:480px){.trust-items{grid-template-columns:repeat(2,1fr)}.cform{padding:28px 20px}}
      `}</style>

      <LandingNav />

      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link><span className="sep">›</span><span>Book Free Trial</span></div>
          <div className="sl center wh">Get Started Today</div>
          <h1>Book Your <span>Free</span><br/>Trial Lesson</h1>
          <p>Fill in the form and we'll match you with the perfect teacher within 24 hours. Your first lesson is completely free — no commitment, no credit card needed.</p>
          <div className="hero-trust">
            {['✅ No credit card','⚡ Matched in 24 hours','🔒 100% free','🌍 Any timezone'].map((t, i) => (
              <span className="htrust" key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-page">
        <div className="container">
          <div className="contact-inner">
            {/* Info */}
            <div>
              <div className="sl">Contact Us</div>
              <h2 className="st">We're Here to <span>Help</span></h2>
              <p className="ss" style={{marginBottom:28}}>Our team is available around the clock to answer questions, match you with teachers, and make sure your learning journey starts right.</p>

              <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:28}}>
                {[
                  { ico:'🌐', title:'Website', val:'www.QuranMentorGlobal.com' },
                  { ico:'📧', title:'Email', val:'info@quranmentorglobal.com' },
                  { ico:'📱', title:'WhatsApp', val:'Available 24/7 for enquiries' },
                  { ico:'🕐', title:'Response Time', val:'Within 24 hours — usually much faster' },
                  { ico:'🌍', title:'Timezones', val:'We serve UK, USA, Pakistan, Gulf & beyond' },
                ].map((c, i) => (
                  <div className="ci" key={i}>
                    <div className="ci-ico">{c.ico}</div>
                    <div className="ci-b"><h4>{c.title}</h4><p>{c.val}</p></div>
                  </div>
                ))}
              </div>

              <div className="trust-items">
                {[
                  { n:'10K+', l:'Students enrolled' },
                  { n:'500+', l:'Certified teachers' },
                  { n:'4.9★', l:'Average rating' },
                  { n:'100+', l:'Countries served' },
                ].map((s, i) => (
                  <div className="ti" key={i}><div className="ti-n">{s.n}</div><div className="ti-l">{s.l}</div></div>
                ))}
              </div>

              <SocialIcons />
            </div>

            {/* Form */}
            <div>
              <div className="cform">
                <h3>Book Your Free Lesson</h3>
                <p style={{fontSize:14,color:'var(--tl)',marginBottom:26}}>No credit card needed. Just fill in your details and we'll be in touch.</p>
                <div id="contactForm">
                  <div className="fg-row">
                    <div className="fg"><label>First Name</label><input type="text" id="fn" placeholder="Ahmed" /></div>
                    <div className="fg"><label>Last Name</label><input type="text" id="ln" placeholder="Khan" /></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="email" id="em" placeholder="ahmed@example.com" /></div>
                  <div className="fg"><label>WhatsApp Number</label><input type="tel" id="ph" placeholder="+44 7700 000000" /></div>
                  <div className="fg"><label>Country</label>
                    <select id="ct">
                      <option value="">Select your country</option>
                      {['Pakistan','United Kingdom','United Arab Emirates','United States','Saudi Arabia','Canada','Australia','Bangladesh','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>I want to</label>
                    <select id="rl">
                      <option value="">Select your goal</option>
                      <option>Learn Quran (Adult Student)</option>
                      <option>Enroll my child (Parent)</option>
                      <option>Learn Tajweed specifically</option>
                      <option>Join the Hifz programme</option>
                      <option>Teach on the platform (Qari)</option>
                    </select>
                  </div>
                  <div className="fg"><label>Message (optional)</label><textarea id="msg" placeholder="Tell us about your background and goals..."></textarea></div>
                  <button className="btn btn-green fsub" onClick={submitForm}>Book My Free Trial Lesson →</button>
                  <p style={{textAlign:'center',fontSize:12,color:'var(--tl)',marginTop:10}}>🔒 Your details are private. We never share your information.</p>
                </div>
                <div className="success-box" id="successBox">
                  🌙 JazakAllah Khair! We've received your request.<br/>
                  Our team will contact you within 24 hours to schedule your free trial lesson. May Allah bless your journey. ✦
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
