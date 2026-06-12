// src/components/landing/LandingLayout.tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const FB_SVG = <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
const IG_SVG = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
const YT_SVG = <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM10 15.5v-7l6 3.5-6 3.5z"/></svg>

export const SocialIcons = ({ dark = false }: { dark?: boolean }) => (
  <div style={{display:'flex',gap:10}}>
    {[
      { href:'https://facebook.com/QuranMentorGlobal', icon: FB_SVG },
      { href:'https://instagram.com/QuranMentorGlobal', icon: IG_SVG },
      { href:'https://youtube.com/@QuranMentorGlobal', icon: YT_SVG },
    ].map((s, i) => (
      <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
        style={{width:42,height:42,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
          background: dark ? 'rgba(255,255,255,.07)' : 'var(--cream)',
          border: dark ? '1px solid rgba(184,149,42,.18)' : '1px solid var(--cream-d)',
          color: dark ? 'rgba(255,255,255,.6)' : 'var(--tm)',
          transition:'all .3s',cursor:'pointer'}}>
        {s.icon}
      </a>
    ))}
  </div>
)

export const LandingNav = () => {
  const pathname = usePathname()

  useEffect(() => {
    const nav = document.getElementById('qmg-nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    ;(window as any).toggleMenu = () => { document.getElementById('mobMenu')?.classList.toggle('open'); document.getElementById('ham')?.classList.toggle('open') }
    ;(window as any).closeMenu = () => { document.getElementById('mobMenu')?.classList.remove('open'); document.getElementById('ham')?.classList.remove('open') }
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/courses', label: 'Courses' },
    { href: '/teachers', label: 'Teachers' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <div className="lbar">
        <div className="container">
          <span className="lbar-h">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
          <div className="lsw">
            <button className="lbtn active">EN</button>
            <button className="lbtn" disabled>اردو</button>
            <button className="lbtn" disabled>عربي</button>
          </div>
        </div>
      </div>
      <nav className="nav" id="qmg-nav">
        <div className="container">
          <Link href="/" className="nav-logo">
            <img src="/logo.png" alt="QuranMentorGlobal" className="logo-img" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
            <div className="logo-txt">
              <div className="name">Quran <span>Mentor</span> Global</div>
              <div className="tag">Learn · Connect · Grow</div>
            </div>
          </Link>
          <ul className="nav-links">
            {links.map(l => (
              <li key={l.href}><Link href={l.href} className={pathname === l.href ? 'active' : ''}>{l.label}</Link></li>
            ))}
          </ul>
          <div className="nav-cta">
            <Link href="/auth/login" className="btn btn-outline-green btn-sm">Login</Link>
            <Link href="/auth/signup" className="btn btn-green btn-sm">Sign Up Free →</Link>
          </div>
          <button className="ham" id="ham" onClick={() => (window as any).toggleMenu?.()} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div className="mob-menu" id="mobMenu">
          {links.map(l => <Link key={l.href} href={l.href} onClick={() => (window as any).closeMenu?.()}>{l.label}</Link>)}
          <div className="mob-divider"></div>
          <Link href="/auth/login" onClick={() => (window as any).closeMenu?.()}>Login</Link>
          <Link href="/auth/signup" className="btn btn-green" style={{textAlign:'center',justifyContent:'center',marginTop:4}} onClick={() => (window as any).closeMenu?.()}>Sign Up Free →</Link>
        </div>
      </nav>
    </>
  )
}

export const LandingFooter = () => (
  <footer className="footer">
    <div className="container">
      <div className="fgrid2">
        <div>
          <div className="fb-name">Quran <span>Mentor</span> Global</div>
          <div className="fb-tag">Learn Quran · Connect Globally · Grow Spiritually</div>
          <p className="fb-desc">Connecting students with certified Qaris and teachers worldwide for a personalized, spiritual learning experience. For all ages, all levels, all backgrounds.</p>
          <SocialIcons dark />
        </div>
        <div className="fc2"><h4>Platform</h4><ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/courses">Our Courses</a></li>
          <li><Link href="/platform/teachers">Find a Teacher</Link></li>
          <li><a href="/contact">How It Works</a></li>
          <li><Link href="/auth/signup">Teach With Us</Link></li>
        </ul></div>
        <div className="fc2"><h4>Courses</h4><ul>
          <li><Link href="/platform/teachers">Noorani Qaida</Link></li>
          <li><Link href="/platform/teachers">Tajweed</Link></li>
          <li><Link href="/platform/teachers">Hifz Programme</Link></li>
          <li><Link href="/platform/teachers">Tafseer</Link></li>
          <li><Link href="/platform/teachers">Kids Classes</Link></li>
        </ul></div>
        <div className="fc2"><h4>Company</h4><ul>
          <li><a href="/about">Privacy Policy</a></li>
          <li><a href="/about">Terms of Service</a></li>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="mailto:info@quranmentorglobal.com">Email Us</a></li>
          <li><Link href="/auth/login">Student Login</Link></li>
        </ul></div>
      </div>
      <div className="fbot">
        <p>© 2025 Quran Mentor Global. All rights reserved. | www.QuranMentorGlobal.com</p>
        <div className="fbot-ar">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</div>
      </div>
    </div>
  </footer>
)

export const LANDING_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Amiri:wght@400;700&display=swap');
  :root{--green:#1B5E37;--green-dark:#0D3D20;--green-mid:#2A7A4A;--gold:#B8952A;--gold-light:#D4AF50;--gold-pale:#F0E4B8;--cream:#F5F0E8;--cream-d:#EDE6D6;--td:#1A1A1A;--tm:#3D3D3D;--tl:#6B6B6B;--ff:'Playfair Display',Georgia,serif;--fb:'DM Sans',system-ui,sans-serif;--fa:'Amiri',serif;--r:12px;--rl:20px;--rx:28px;--sh:0 4px 24px rgba(0,0,0,.09);--shl:0 12px 48px rgba(0,0,0,.16);--ease:cubic-bezier(.4,0,.2,1)}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
  body{font-family:var(--fb);color:var(--td);background:#fff;overflow-x:hidden;line-height:1.6}
  img{max-width:100%;display:block}a{text-decoration:none;color:inherit}ul{list-style:none}
  .container{max-width:1180px;margin:0 auto;padding:0 24px}
  .btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--fb);font-size:15px;font-weight:600;padding:15px 32px;border-radius:50px;border:none;cursor:pointer;transition:all .3s var(--ease);white-space:nowrap}
  .btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold-light));color:#fff;box-shadow:0 4px 20px rgba(184,149,42,.3)}.btn-gold:hover{transform:translateY(-3px)}
  .btn-green{background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;box-shadow:0 4px 20px rgba(27,94,55,.3)}.btn-green:hover{transform:translateY(-3px)}
  .btn-outline-white{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.45)}.btn-outline-white:hover{background:rgba(255,255,255,.1);border-color:#fff;transform:translateY(-3px)}
  .btn-outline-green{background:transparent;color:var(--green);border:2px solid var(--green)}.btn-outline-green:hover{background:var(--green);color:#fff;transform:translateY(-3px)}
  .btn-sm{padding:10px 22px;font-size:13px}
  .sl{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:12px;display:flex;align-items:center;gap:10px}
  .sl::before,.sl::after{content:'';flex:none;width:26px;height:1.5px;background:var(--gold)}
  .sl.center{justify-content:center}.sl.wh{color:var(--gold-light)}.sl.wh::before,.sl.wh::after{background:var(--gold-light)}
  .st{font-family:var(--ff);font-size:clamp(28px,4vw,46px);font-weight:700;color:var(--green-dark);line-height:1.18;margin-bottom:18px}.st span{color:var(--gold)}
  .ss{font-size:17px;color:var(--tm);line-height:1.78;max-width:560px}
  .section-hd{text-align:center;margin-bottom:64px}.section-hd .ss{margin:0 auto}
  .lbar{background:var(--green-dark);padding:9px 0;border-bottom:1px solid rgba(184,149,42,.2)}
  .lbar .container{display:flex;justify-content:space-between;align-items:center}
  .lbar-h{font-family:var(--fa);font-size:14px;color:var(--gold-light)}
  .lsw{display:flex;gap:4px}
  .lbtn{font-size:12px;font-weight:500;padding:4px 13px;border-radius:20px;border:1px solid rgba(184,149,42,.3);background:transparent;color:rgba(255,255,255,.6);cursor:pointer;font-family:var(--fb);transition:all .25s}
  .lbtn.active{background:var(--gold);color:#fff;border-color:var(--gold)}
  .nav{background:rgba(255,255,255,.96);backdrop-filter:blur(20px);border-bottom:1px solid rgba(27,94,55,.08);position:sticky;top:0;z-index:200;transition:all .4s}
  .nav.scrolled{background:rgba(255,255,255,.9);box-shadow:0 4px 32px rgba(0,0,0,.1)}
  .nav .container{display:flex;align-items:center;justify-content:space-between;height:74px}
  .nav-logo{display:flex;align-items:center;gap:12px;cursor:pointer}
  .logo-img{height:48px;width:auto;border-radius:8px;object-fit:contain}
  .logo-txt .name{font-family:var(--ff);font-size:18px;font-weight:700;color:var(--green-dark);line-height:1.1}
  .logo-txt .name span{color:var(--gold)}.logo-txt .tag{font-size:10px;color:var(--tl);letter-spacing:.1em;text-transform:uppercase}
  .nav-links{display:flex;align-items:center;gap:4px}
  .nav-links a{font-size:14px;font-weight:500;color:var(--tm);padding:8px 14px;border-radius:8px;transition:all .22s}
  .nav-links a:hover,.nav-links a.active{color:var(--green);background:rgba(27,94,55,.06)}
  .nav-cta{display:flex;gap:10px;align-items:center}
  .ham{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:6px}
  .ham span{width:24px;height:2px;background:var(--green-dark);border-radius:2px;transition:all .3s;display:block}
  .ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}.ham.open span:nth-child(2){opacity:0}.ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .mob-menu{display:none;position:fixed;top:118px;left:0;right:0;background:#fff;border-bottom:2px solid var(--green);padding:20px 24px;flex-direction:column;gap:4px;box-shadow:var(--shl);z-index:199}
  .mob-menu.open{display:flex}
  .mob-menu a{font-size:16px;font-weight:500;padding:12px 16px;border-radius:10px;color:var(--tm);transition:all .2s;display:block}
  .mob-menu a:hover{background:var(--cream);color:var(--green)}
  .mob-divider{height:1px;background:var(--cream-d);margin:8px 0}
  .page-hero{background:linear-gradient(135deg,var(--green-dark) 0%,var(--green) 100%);padding:100px 0 80px;text-align:center;position:relative;overflow:hidden}
  .page-hero h1{font-family:var(--ff);font-size:clamp(32px,5vw,58px);font-weight:800;color:#fff;line-height:1.12;margin-bottom:18px}.page-hero h1 span{color:var(--gold-light)}
  .page-hero p{font-size:18px;color:rgba(255,255,255,.72);max-width:520px;margin:0 auto 32px;line-height:1.72}
  .breadcrumb{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:rgba(255,255,255,.45);margin-bottom:20px}
  .breadcrumb a{color:rgba(255,255,255,.6);transition:color .2s}.breadcrumb a:hover{color:#fff}.breadcrumb .sep{color:rgba(255,255,255,.25)}
  .footer{background:var(--green-dark);padding:68px 0 0;position:relative;overflow:hidden}
  .footer::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
  .fgrid2{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
  .fb-name{font-family:var(--ff);font-size:21px;font-weight:700;color:#fff;margin-bottom:4px}.fb-name span{color:var(--gold)}
  .fb-tag{font-size:10px;color:rgba(255,255,255,.3);letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}
  .fb-desc{font-size:13px;color:rgba(255,255,255,.48);line-height:1.8;margin-bottom:22px}
  .fc2 h4{font-size:11px;font-weight:700;color:var(--gold-light);text-transform:uppercase;letter-spacing:.12em;margin-bottom:16px}
  .fc2 ul{display:flex;flex-direction:column;gap:10px}
  .fc2 ul li a{font-size:13px;color:rgba(255,255,255,.48);transition:all .2s;display:inline-block}.fc2 ul li a:hover{color:var(--gold-light);transform:translateX(4px)}
  .fbot{border-top:1px solid rgba(255,255,255,.07);padding:22px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .fbot p{font-size:12px;color:rgba(255,255,255,.28)}.fbot-ar{font-family:var(--fa);font-size:14px;color:var(--gold);direction:rtl}
  .soc{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .3s;cursor:pointer}
  .soc:hover{background:var(--gold)!important;color:#fff!important;border-color:var(--gold)!important;transform:translateY(-3px) scale(1.1)}
  .hadith{background:linear-gradient(140deg,var(--green) 0%,var(--green-dark) 100%);padding:82px 0;text-align:center}
  .hadith-ar{font-family:var(--fa);font-size:clamp(22px,3.5vw,38px);color:var(--gold-light);margin-bottom:16px;direction:rtl}
  .hadith-en{font-family:var(--ff);font-size:clamp(18px,2.8vw,28px);color:#fff;font-style:italic;margin-bottom:10px}
  .hadith-src{font-size:13px;color:rgba(255,255,255,.42)}
  .ci{display:flex;align-items:flex-start;gap:15px;padding:12px;border-radius:12px;transition:background .2s}
  .ci:hover{background:var(--cream)}.ci-ico{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,var(--green),var(--green-mid));display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
  .ci-b h4{font-size:14px;font-weight:600;color:var(--green-dark);margin-bottom:2px}.ci-b p{font-size:13px;color:var(--tl)}
  .fg{margin-bottom:16px}.fg label{display:block;font-size:13px;font-weight:600;color:var(--tm);margin-bottom:6px}
  .fg input,.fg select,.fg textarea{width:100%;padding:12px 16px;border:1.5px solid #E0DDD5;border-radius:10px;font-family:var(--fb);font-size:14px;color:var(--td);background:#fff;transition:all .25s;outline:none}
  .fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--green);box-shadow:0 0 0 3px rgba(27,94,55,.1)}
  .fg textarea{min-height:108px;resize:vertical}.fg-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  #stbtn{position:fixed;bottom:28px;right:28px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--green-mid));color:#fff;border:none;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:200;opacity:0;transition:all .4s;box-shadow:0 4px 20px rgba(27,94,55,.4)}
  #stbtn:hover{transform:translateY(-4px) scale(1.05)}
  @media(max-width:1024px){.fgrid2{grid-template-columns:1fr 1fr;gap:32px}}
  @media(max-width:900px){.nav-links,.nav-cta{display:none}.ham{display:flex}}
  @media(max-width:768px){.nav-links,.nav-cta{display:none!important}.ham{display:flex!important}.fgrid2{grid-template-columns:1fr;gap:24px}.fg-row{grid-template-columns:1fr}}
  @media(max-width:600px){.lbar-h{display:none}}
`
