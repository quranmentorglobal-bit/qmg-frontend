'use client'
import { useState } from 'react'
import { LandingNav, LandingFooter, SocialIcons, LANDING_CSS } from '@/components/landing/LandingLayout'
import Link from 'next/link'

const FAQS = [
  { q: 'How long until I\'m matched with a teacher?',           a: 'Our team matches you within 24 hours of your enquiry — usually much faster. You\'ll receive a WhatsApp message with teacher options.' },
  { q: 'Is the trial lesson really free?',                      a: 'Yes, completely. No credit card required. The trial lesson is a 30–45 minute session so you can meet your teacher before committing.' },
  { q: 'Can I switch teachers if I\'m not satisfied?',          a: 'Absolutely. We want you to love your teacher. You can switch at any time, completely free of charge.' },
  { q: 'What age groups do you teach?',                         a: 'We teach everyone from children as young as 4 to adults and seniors. We have specialists for every age group.' },
  { q: 'What timezone do lessons run in?',                      a: 'Your timezone — whatever works for you. We have teachers available across all major time zones, 7 days a week.' },
]

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  function submitForm() {
    const fn = (document.getElementById('fn') as HTMLInputElement)?.value.trim()
    const em = (document.getElementById('em') as HTMLInputElement)?.value.trim()
    const rl = (document.getElementById('rl') as HTMLSelectElement)?.value
    if (!fn || !em || !rl) { alert('Please fill in your name, email, and goal.'); return }
    if (!/\S+@\S+\.\S+/.test(em)) { alert('Please enter a valid email.'); return }
    const form = document.getElementById('contactForm')
    const sb   = document.getElementById('successBox')
    if (form) {
      form.style.opacity = '0'
      setTimeout(() => {
        form.style.display = 'none'
        if (sb) sb.style.display = 'block'
      }, 400)
    }
  }

  return (
    <>
      <style>{LANDING_CSS + `
        /* ── Contact page ── */
        .contact-page { padding: 90px 0; background: #fff; }
        .contact-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }

        /* ── Interactive contact cards ── */
        .contact-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
        .ccard { background: var(--cream); border-radius: 14px; padding: 20px; border: 1.5px solid var(--cream-d); transition: all .3s; text-decoration: none; display: block; }
        .ccard:hover { background: #fff; border-color: var(--green); box-shadow: 0 8px 28px rgba(27,94,55,.12); transform: translateY(-3px); }
        .ccard-ico  { font-size: 28px; margin-bottom: 10px; }
        .ccard h4   { font-size: 14px; font-weight: 700; color: var(--green-dark); margin-bottom: 4px; }
        .ccard p    { font-size: 13px; color: var(--tl); line-height: 1.5; }
        .ccard-arrow { font-size: 18px; color: var(--green); margin-top: 10px; display: block; transition: transform .2s; }
        .ccard:hover .ccard-arrow { transform: translateX(4px); }

        /* ── Trust stats ── */
        .trust-items { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 28px; }
        .ti { background: var(--cream); border-radius: 12px; padding: 16px; text-align: center; border: 1px solid var(--cream-d); }
        .ti-n { font-family: var(--ff); font-size: 26px; font-weight: 800; color: var(--green-dark); line-height: 1; }
        .ti-l { font-size: 12px; color: var(--tl); margin-top: 3px; }

        /* ── Response expectation strip ── */
        .response-strip { background: linear-gradient(135deg,var(--green-dark),var(--green)); border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; display: flex; align-items: center; gap: 14px; }
        .response-strip .ico { font-size: 28px; flex-shrink: 0; }
        .response-strip h4   { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .response-strip p    { font-size: 13px; color: rgba(255,255,255,.65); }

        /* ── Form ── */
        .cform { background: var(--cream); border-radius: 20px; padding: 44px; border-top: 4px solid var(--gold); box-shadow: 0 4px 24px rgba(0,0,0,.09); }
        .cform h3 { font-family: var(--ff); font-size: 26px; font-weight: 700; color: var(--green-dark); margin-bottom: 6px; }
        .fsub { width: 100%; padding: 15px; font-size: 16px; border-radius: 12px; margin-top: 4px; cursor: pointer; }
        .success-box { display: none; text-align: center; padding: 28px 24px; background: linear-gradient(135deg,#e8f5ee,#d4eee1); border-radius: 12px; color: var(--green); font-weight: 500; font-size: 15px; line-height: 1.7; }

        /* ── FAQ section ── */
        .faq-sec { padding: 80px 0; background: var(--cream); }
        .faq-list { display: flex; flex-direction: column; gap: 12px; max-width: 720px; margin: 0 auto; }
        .faq-item { background: #fff; border-radius: 14px; border: 1px solid var(--cream-d); overflow: hidden; transition: box-shadow .3s; }
        .faq-item:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07); }
        .faq-q { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; background: none; border: none; font-family: var(--fb); font-size: 15px; font-weight: 600; color: var(--green-dark); cursor: pointer; text-align: left; gap: 16px; }
        .faq-q:hover { color: var(--green); }
        .faq-icon { font-size: 20px; flex-shrink: 0; transition: transform .3s; color: var(--green); }
        .faq-icon.open { transform: rotate(45deg); }
        .faq-a { padding: 0 22px 18px; font-size: 14px; color: var(--tl); line-height: 1.72; }

        /* ── Map placeholder ── */
        .map-placeholder { background: var(--cream-d); border-radius: 16px; height: 200px; display: flex; align-items: center; justify-content: center; margin-bottom: 28px; border: 1.5px dashed rgba(27,94,55,.2); flex-direction: column; gap: 8px; }
        .map-placeholder p { font-size: 13px; color: var(--tl); }

        /* ── Hero trust pills ── */
        .hero-trust { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 24px; }
        .htrust { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); color: rgba(255,255,255,.9); font-size: 13px; font-weight: 500; padding: 7px 16px; border-radius: 50px; }

        /* ── Page hero ── */
        .page-hero { background-color: var(--green-dark); }

        @media(max-width:860px) { .contact-inner { grid-template-columns: 1fr; gap: 48px; } .contact-cards { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px) { .trust-items { grid-template-columns: repeat(2,1fr); } .cform { padding: 28px 20px; } .contact-cards { grid-template-columns: 1fr; } }
      `}</style>

      <LandingNav />

      {/* ── Page Hero ── */}
      <section className="page-hero" style={{backgroundImage:"url('/images/contact/contact-hero.jpg')"}}>
        <div className="page-hero-bg" style={{backgroundImage:"url('/images/contact/contact-hero.jpg')"}}></div>
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">›</span><span>Book Free Trial</span>
          </div>
          <div className="sl center wh">Get Started Today</div>
          <h1>Book Your <span>Free</span><br/>Trial Lesson</h1>
          <p>Fill in the form and we'll match you with the perfect teacher within 24 hours. No credit card, no commitment.</p>
          <div className="hero-trust">
            {['✅ No credit card', '⚡ Matched in 24 hours', '🔒 100% free', '🌍 Any timezone'].map((t, i) => (
              <span className="htrust" key={i}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main contact section ── */}
      <section className="contact-page">
        <div className="container">
          <div className="contact-inner">

            {/* LEFT — info */}
            <div>
              <div className="sl">Contact Us</div>
              <h2 className="st">We're Here to <span>Help</span></h2>
              <p className="ss" style={{marginBottom:28}}>Our team is available around the clock to answer questions, match you with teachers, and make sure your learning journey starts right.</p>

              {/* Response expectation */}
              <div className="response-strip">
                <span className="ico">⚡</span>
                <div>
                  <h4>Usually respond within 2 hours</h4>
                  <p>Mon–Sun · 8am–10pm PKT · WhatsApp & Email</p>
                </div>
              </div>

              {/* Interactive contact cards */}
              <div className="contact-cards">
                <a href="mailto:info@quranmentorglobal.com" className="ccard">
                  <div className="ccard-ico">📧</div>
                  <h4>Email Us</h4>
                  <p>info@quranmentorglobal.com</p>
                  <span className="ccard-arrow">→</span>
                </a>
                <a href="https://wa.me/message/QuranMentorGlobal" target="_blank" rel="noopener noreferrer" className="ccard">
                  <div className="ccard-ico">💬</div>
                  <h4>WhatsApp</h4>
                  <p>Available 24/7 for enquiries</p>
                  <span className="ccard-arrow">→</span>
                </a>
                <a href="https://instagram.com/QuranMentorGlobal" target="_blank" rel="noopener noreferrer" className="ccard">
                  <div className="ccard-ico">📸</div>
                  <h4>Instagram</h4>
                  <p>@QuranMentorGlobal</p>
                  <span className="ccard-arrow">→</span>
                </a>
                <a href="https://facebook.com/QuranMentorGlobal" target="_blank" rel="noopener noreferrer" className="ccard">
                  <div className="ccard-ico">👥</div>
                  <h4>Facebook</h4>
                  <p>QuranMentorGlobal</p>
                  <span className="ccard-arrow">→</span>
                </a>
              </div>

              {/* Trust stats */}
              <div className="trust-items">
                {[
                  { n:'10K+', l:'Students enrolled'   },
                  { n:'500+', l:'Certified teachers'  },
                  { n:'4.9★', l:'Average rating'      },
                  { n:'100+', l:'Countries served'    },
                ].map((s, i) => (
                  <div className="ti" key={i}>
                    <div className="ti-n">{s.n}</div>
                    <div className="ti-l">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="map-placeholder">
                <span style={{fontSize:32}}>🌍</span>
                <p>Serving students in 100+ countries worldwide</p>
              </div>

              <SocialIcons />
            </div>

            {/* RIGHT — form */}
            <div>
              <div className="cform">
                <h3>Book Your Free Lesson</h3>
                <p style={{fontSize:14,color:'var(--tl)',marginBottom:26}}>No credit card needed. Fill in your details and we'll be in touch within 24 hours.</p>

                <div id="contactForm">
                  <div className="fg-row">
                    <div className="fg"><label>First Name</label><input type="text" id="fn" placeholder="Ahmed" /></div>
                    <div className="fg"><label>Last Name</label><input type="text" id="ln" placeholder="Khan" /></div>
                  </div>
                  <div className="fg"><label>Email Address</label><input type="email" id="em" placeholder="ahmed@example.com" /></div>
                  <div className="fg"><label>WhatsApp Number</label><input type="tel" id="ph" placeholder="+44 7700 000000" /></div>
                  <div className="fg">
                    <label>Country</label>
                    <select id="ct">
                      <option value="">Select your country</option>
                      {['Pakistan','United Kingdom','United Arab Emirates','United States','Saudi Arabia','Canada','Australia','Bangladesh','Other'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="fg">
                    <label>I want to</label>
                    <select id="rl">
                      <option value="">Select your goal</option>
                      <option>Learn Quran (Adult Student)</option>
                      <option>Enroll my child (Parent)</option>
                      <option>Learn Tajweed specifically</option>
                      <option>Join the Hifz programme</option>
                      <option>Teach on the platform (Qari)</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Message (optional)</label>
                    <textarea id="msg" placeholder="Tell us about your background and goals..."></textarea>
                  </div>
                  <button className="btn btn-green fsub" onClick={submitForm}>
                    Book My Free Trial Lesson →
                  </button>
                  <p style={{textAlign:'center',fontSize:12,color:'var(--tl)',marginTop:10}}>
                    🔒 Your details are private. We never share your information.
                  </p>
                </div>

                <div className="success-box" id="successBox">
                  🌙 JazakAllah Khair! We've received your request.<br/>
                  Our team will contact you within 24 hours to schedule your free trial lesson.<br/>
                  May Allah bless your journey. ✦
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ section ── */}
      <section className="faq-sec">
        <div className="container">
          <div className="section-hd">
            <div className="sl center">Common Questions</div>
            <h2 className="st" style={{textAlign:'center',margin:'0 auto 16px'}}>Frequently Asked <span>Questions</span></h2>
            <p className="ss" style={{margin:'0 auto 56px',textAlign:'center'}}>Everything you need to know before booking your first lesson.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div className="faq-item" key={i}>
                <button
                  className="faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <span className={`faq-icon${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                {openFaq === i && <div className="faq-a">{faq.a}</div>}
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:40}}>
            <p style={{fontSize:14,color:'var(--tl)',marginBottom:16}}>Still have questions?</p>
            <a href="mailto:info@quranmentorglobal.com" className="btn btn-outline-green">Email Us Directly →</a>
          </div>
        </div>
      </section>

      {/* ── Hadith ── */}
      <div className="hadith">
        <div className="container">
          <p className="hadith-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</p>
          <p className="hadith-en">"The best among you are those who learn the Quran and teach it."</p>
          <p className="hadith-src">— Sahih Al-Bukhari</p>
        </div>
      </div>

      <LandingFooter />
      <button id="stbtn" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Scroll to top">↑</button>
    </>
  )
}
