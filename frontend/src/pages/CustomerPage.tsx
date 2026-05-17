import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/4f_logu.png'
import { api, getImageUrl, type AppSetting, type MenuItem, type Offer } from '../services/api'

type Lang = 'en' | 'ar'
const t = (en: string, ar: string, lang: Lang) => lang === 'ar' ? ar : en

type Review = { id: string; name: string; rating: number; text: string; date: string; item?: string; itemName?: string }

function getReviews(): Review[] {
    try { return JSON.parse(localStorage.getItem('ff-reviews') || '[]') } catch { return [] }
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span style={{ display: 'inline-flex', gap: 1 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ fontSize: size, color: s <= rating ? '#d4943a' : 'rgba(212,148,58,0.18)', lineHeight: 1 }}>★</span>
            ))}
        </span>
    )
}

function useScrollY() {
    const [y, setY] = useState(0)
    useEffect(() => {
        const fn = () => setY(window.scrollY)
        window.addEventListener('scroll', fn, { passive: true })
        return () => window.removeEventListener('scroll', fn)
    }, [])
    return y
}

export default function CustomerPage() {
    const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('ff-lang') as Lang) || 'en')
    const isRTL = lang === 'ar'
    const [menu, setMenu] = useState<MenuItem[]>([])
    const [offers, setOffers] = useState<Offer[]>([])
    const [settings, setSettings] = useState<AppSetting | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCard, setActiveCard] = useState<number | null>(null)
    const scrollY = useScrollY()

    useEffect(() => { localStorage.setItem('ff-lang', lang) }, [lang])

    useEffect(() => {
        setReviews(getReviews())
        Promise.all([api.getMenu(), api.getActiveOffers(), api.getSettings()])
            .then(([m, o, s]) => { setMenu(m.filter((x: MenuItem) => x.avail)); setOffers(o); setSettings(s) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const topPicks = menu.slice(0, 4)
    const footerText = lang === 'ar' ? (settings?.editableFooterAr || '© 2026 فور فريندز كافيه') : (settings?.editableFooterEn || '© 2026 For Friends Café')
    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0'
    const navOpaque = scrollY > 40

    const ITEM_BG: Record<string, { bg: string; accent: string }> = {
        hot: { bg: 'radial-gradient(ellipse at 30% 20%, #3a1500 0%, #1a0900 60%, #0d0600 100%)', accent: '#c07d40' },
        cold: { bg: 'radial-gradient(ellipse at 30% 20%, #001830 0%, #00101f 60%, #000a14 100%)', accent: '#4fa3d0' },
        tea: { bg: 'radial-gradient(ellipse at 30% 20%, #0a2210 0%, #051508 60%, #020e04 100%)', accent: '#5ea86a' },
        food: { bg: 'radial-gradient(ellipse at 30% 20%, #251000 0%, #160900 60%, #0a0500 100%)', accent: '#d4943a' },
    }

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#070503', color: '#ede0cc', fontFamily: "'Gilda Display', 'Playfair Display', Georgia, serif", overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Gilda+Display&family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                body { margin: 0; }
                ::selection { background: rgba(192,125,64,0.3); color: #f5e0c0; }

                @keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
                @keyframes drift    { 0%,100%{transform:translateY(0px) rotate(0deg)} 33%{transform:translateY(-8px) rotate(0.5deg)} 66%{transform:translateY(-4px) rotate(-0.3deg)} }
                @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
                @keyframes glow     { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
                @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes ping     { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
                @keyframes line-in  { from{scaleX:0} to{scaleX:1} }

                ::-webkit-scrollbar { width: 2px; }
                ::-webkit-scrollbar-thumb { background: rgba(192,125,64,0.3); }

                .ff-nav-link {
                    color: rgba(237,224,204,0.5);
                    text-decoration: none;
                    font-family: 'Jost', sans-serif;
                    font-weight: 500;
                    font-size: 12px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    padding: 8px 0;
                    position: relative;
                    transition: color 0.3s;
                }
                .ff-nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 4px; left: 0; right: 0;
                    height: 1px;
                    background: #c07d40;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
                }
                .ff-nav-link:hover { color: #ede0cc; }
                .ff-nav-link:hover::after { transform: scaleX(1); }

                .ff-pill-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 11px 28px;
                    border-radius: 2px;
                    background: linear-gradient(135deg, #c07d40, #8b4f1c);
                    color: white;
                    text-decoration: none;
                    font-family: 'Jost', sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.25s, transform 0.25s, box-shadow 0.25s;
                    box-shadow: 0 4px 24px rgba(192,125,64,0.35);
                    position: relative;
                    overflow: hidden;
                }
                .ff-pill-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
                    opacity: 0;
                    transition: opacity 0.25s;
                }
                .ff-pill-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 36px rgba(192,125,64,0.55); }
                .ff-pill-btn:hover::before { opacity: 1; }
                .ff-pill-btn:active { transform: translateY(0); }

                .ff-ghost-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 10px 24px;
                    border-radius: 2px;
                    background: transparent;
                    color: rgba(237,224,204,0.6);
                    text-decoration: none;
                    font-family: 'Jost', sans-serif;
                    font-weight: 500;
                    font-size: 12px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    border: 1px solid rgba(237,224,204,0.15);
                    cursor: pointer;
                    transition: all 0.25s;
                }
                .ff-ghost-btn:hover {
                    border-color: rgba(192,125,64,0.5);
                    color: #c07d40;
                    background: rgba(192,125,64,0.05);
                }

                .ff-pick-card {
                    position: relative;
                    border-radius: 3px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s;
                    border: 1px solid rgba(237,224,204,0.06);
                }
                .ff-pick-card:hover {
                    transform: translateY(-8px) scale(1.01);
                    box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(192,125,64,0.12);
                    border-color: rgba(192,125,64,0.25);
                }
                .ff-pick-card-img {
                    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
                }
                .ff-pick-card:hover .ff-pick-card-img {
                    transform: scale(1.06);
                }

                .ff-review-card {
                    border-radius: 3px;
                    background: #100c09;
                    border: 1px solid rgba(237,224,204,0.06);
                    padding: clamp(20px,2.5vw,28px);
                    display: flex; flex-direction: column; gap: 14px;
                    transition: border-color 0.3s, transform 0.3s;
                    position: relative;
                    overflow: hidden;
                }
                .ff-review-card::before {
                    content: '"';
                    position: absolute; top: -10px; right: 16px;
                    font-family: 'Cormorant', serif;
                    font-size: 120px;
                    color: rgba(192,125,64,0.06);
                    line-height: 1;
                    pointer-events: none;
                }
                .ff-review-card:hover {
                    border-color: rgba(192,125,64,0.18);
                    transform: translateY(-3px);
                }

                .ff-feature-card {
                    border-radius: 3px;
                    background: #0d0a07;
                    border: 1px solid rgba(237,224,204,0.05);
                    padding: clamp(24px,3vw,36px);
                    position: relative;
                    overflow: hidden;
                    transition: border-color 0.35s, transform 0.35s;
                }
                .ff-feature-card::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #c07d40, #8b4f1c);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.45s cubic-bezier(0.4,0,0.2,1);
                }
                .ff-feature-card:hover { border-color: rgba(192,125,64,0.2); transform: translateY(-4px); }
                .ff-feature-card:hover::after { transform: scaleX(1); }

                .shimmer-text {
                    background: linear-gradient(90deg, #c07d40 0%, #f5d49a 30%, #c07d40 50%, #8b4f1c 70%, #c07d40 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 5s linear infinite;
                }

                .ff-divider {
                    display: flex; align-items: center; gap: 16px;
                    color: rgba(192,125,64,0.3);
                    font-family: 'Jost', sans-serif;
                    font-size: 10px;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                }
                .ff-divider::before, .ff-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(192,125,64,0.2), transparent);
                }

                .ff-hero-grid  { display: grid; grid-template-columns: 1fr 440px; gap: 80px; align-items: center; }
                .ff-picks-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 18px; }
                .ff-feats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
                .ff-reviews-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }

                @media(max-width:1100px) {
                    .ff-hero-grid { grid-template-columns: 1fr; gap: 48px; }
                    .ff-picks-grid { grid-template-columns: repeat(2,1fr); }
                    .ff-feats-grid { grid-template-columns: repeat(2,1fr); }
                }
                @media(max-width:768px) {
                    .ff-reviews-grid { grid-template-columns: 1fr; }
                    .ff-picks-grid { grid-template-columns: repeat(2,1fr); gap: 12px; }
                    .ff-feats-grid { grid-template-columns: repeat(2,1fr); gap: 12px; }
                    .hide-mobile { display: none !important; }
                }
                @media(max-width:480px) {
                    .ff-picks-grid { gap: 8px; }
                    .ff-feats-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            {/* ═══ NAV ════════════════════════════════════════════════ */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
                height: 72,
                background: navOpaque ? 'rgba(7,5,3,0.97)' : 'transparent',
                backdropFilter: navOpaque ? 'blur(24px)' : 'none',
                borderBottom: navOpaque ? '1px solid rgba(192,125,64,0.1)' : '1px solid transparent',
                transition: 'background 0.4s, backdrop-filter 0.4s, border-color 0.4s',
            }}>
                <div style={{ maxWidth: 1320, margin: '0 auto', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(16px,4vw,48px)' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(192,125,64,0.4)', flexShrink: 0 }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Gilda Display', serif", fontSize: 17, color: '#ede0cc', letterSpacing: '0.02em', lineHeight: 1 }}>For Friends</div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(192,125,64,0.6)', letterSpacing: '0.25em', lineHeight: 1.4, textTransform: 'uppercase' }}>Café</div>
                        </div>
                    </Link>

                    {/* Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                        <Link to="/menu-order" className="ff-nav-link hide-mobile">{t('Menu', 'القائمة', lang)}</Link>
                        <Link to="/track/search" className="ff-nav-link hide-mobile">{t('Track Order', 'تتبع طلبك', lang)}</Link>
                        <button
                            onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(237,224,204,0.4)', letterSpacing: '0.15em', padding: '6px 8px', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#c07d40')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,224,204,0.4)')}>
                            {lang === 'en' ? 'عربي' : 'EN'}
                        </button>
                        <Link to="/menu-order" className="ff-pill-btn">
                            {t('Order Now', 'اطلب الآن', lang)}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ═══ OFFER STRIP ══════════════════════════════════════ */}
            {offers.length > 0 && (
                <div style={{ position: 'relative', zIndex: 5, marginTop: 72, background: 'rgba(192,125,64,0.08)', borderBottom: '1px solid rgba(192,125,64,0.12)', padding: '10px clamp(16px,4vw,48px)' }}>
                    <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: '0.05em' }}>
                        <span style={{ fontSize: 14 }}>{offers[0].emoji}</span>
                        <span style={{ color: '#c07d40', fontWeight: 600 }}>{lang === 'ar' && offers[0].titleAr ? offers[0].titleAr : offers[0].title}</span>
                        <span style={{ color: 'rgba(192,125,64,0.45)' }}>·</span>
                        <span style={{ color: 'rgba(237,224,204,0.4)' }}>{lang === 'ar' && offers[0].subtitleAr ? offers[0].subtitleAr : offers[0].subtitle}</span>
                    </div>
                </div>
            )}

            {/* ═══ HERO ══════════════════════════════════════════════ */}
            <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: offers.length > 0 ? 0 : 72 }}>
                {/* Background atmosphere */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 65% 45%, rgba(30,14,3,0.9) 0%, #070503 70%)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '10%', right: '5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,125,64,0.08) 0%, transparent 70%)', zIndex: 0, animation: 'glow 6s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '5%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,125,64,0.05) 0%, transparent 70%)', zIndex: 0 }} />

                {/* Grain texture overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.35, zIndex: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '180px' }} />

                <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,48px)', position: 'relative', zIndex: 1, width: '100%' }}>
                    <div className="ff-hero-grid">
                        {/* Left column: Copy */}
                        <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both' }}>
                            {/* Label */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c07d40' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c07d40', display: 'inline-block', boxShadow: '0 0 0 0 rgba(192,125,64,0.4)', animation: 'ping 1.8s cubic-bezier(0,0,0.2,1) infinite' }} />
                                {t('Open Now · Pickup Ready', 'مفتوح الآن · جاهز للاستلام', lang)}
                            </div>

                            {/* Headline */}
                            <h1 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(52px,8.5vw,100px)', fontWeight: 300, color: '#ede0cc', margin: '0 0 8px', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                                {t('Crafted', 'مصنوع', lang)}
                            </h1>
                            <h1 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(52px,8.5vw,100px)', fontWeight: 300, fontStyle: 'italic', margin: '0 0 8px', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                                <span className="shimmer-text">{t('with passion', 'بشغف', lang)}</span>
                            </h1>
                            <h1 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(52px,8.5vw,100px)', fontWeight: 300, color: 'rgba(237,224,204,0.35)', margin: '0 0 40px', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
                                {t('for friends.', 'للأصدقاء.', lang)}
                            </h1>

                            {/* Description */}
                            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 'clamp(14px,1.6vw,17px)', color: 'rgba(237,224,204,0.45)', lineHeight: 1.8, margin: '0 0 44px', maxWidth: 460 }}>
                                {t('Premium coffee, artisanal drinks, and fresh food — crafted to order. Skip the line, just pick up when ready.',
                                    'قهوة مميزة، مشروبات حرفية، وطعام طازج — محضر عند الطلب. تخطَّ الطابور، فقط استلم عندما يكون جاهزاً.', lang)}
                            </p>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: 40, marginBottom: 48, flexWrap: 'wrap' }}>
                                {[
                                    { val: avgRating, label: t('Avg Rating', 'متوسط التقييم', lang), suf: '★' },
                                    { val: menu.length > 0 ? `${menu.length}+` : '20+', label: t('Menu Items', 'أصناف', lang), suf: '' },
                                    { val: '5 min', label: t('Avg Pickup', 'وقت الاستلام', lang), suf: '' },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(32px,4.5vw,48px)', fontWeight: 600, color: '#ede0cc', lineHeight: 1 }}>
                                            {s.val}<span style={{ color: '#c07d40', fontSize: '0.55em', marginLeft: 2 }}>{s.suf}</span>
                                        </div>
                                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: 'rgba(237,224,204,0.3)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Link to="/menu-order" className="ff-pill-btn" style={{ fontSize: 12, padding: '14px 36px', letterSpacing: '0.15em' }}>
                                    {t('Explore Menu', 'استعرض القائمة', lang)}
                                </Link>
                                <Link to="/track/search" className="ff-ghost-btn" style={{ fontSize: 11, padding: '13px 24px' }}>
                                    {t('Track Order', 'تتبع طلبك', lang)}
                                </Link>
                            </div>
                        </div>

                        {/* Right column: decorative visual */}
                        <div className="hide-mobile" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: 340, height: 340 }}>
                                {/* Outer ring */}
                                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(192,125,64,0.12)', animation: 'spin-slow 30s linear infinite' }} />
                                {/* Middle ring */}
                                <div style={{ position: 'absolute', inset: 32, borderRadius: '50%', border: '1px solid rgba(192,125,64,0.08)' }} />
                                {/* Glow */}
                                <div style={{ position: 'absolute', inset: 64, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,125,64,0.1) 0%, transparent 70%)', animation: 'glow 4s ease-in-out infinite' }} />
                                {/* Center emoji */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, filter: 'drop-shadow(0 8px 32px rgba(192,125,64,0.3))', animation: 'drift 8s ease-in-out infinite' }}>
                                    ☕
                                </div>
                                {/* Orbiting dots */}
                                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                    <div key={i} style={{
                                        position: 'absolute',
                                        top: '50%', left: '50%',
                                        width: 6, height: 6,
                                        borderRadius: '50%',
                                        background: i % 2 === 0 ? '#c07d40' : 'rgba(192,125,64,0.3)',
                                        transform: `rotate(${deg}deg) translateX(160px) translateY(-50%)`,
                                        boxShadow: i % 2 === 0 ? '0 0 8px rgba(192,125,64,0.6)' : 'none',
                                    }} />
                                ))}
                            </div>
                        </div>
                    </div>{/* closes ff-hero-grid */}

                    {/* Scroll indicator */}
                    <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: scrollY > 20 ? 0 : 1, transition: 'opacity 0.4s' }}>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(192,125,64,0.4)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>{t('Scroll', 'انزل', lang)}</div>
                        <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(192,125,64,0.5), transparent)', animation: 'fadeUp 1s 1s ease both' }} />
                    </div>
                </div>
            </section>

            {/* ═══ PICKS SECTION ══════════════════════════════════════ */}
            {!loading && topPicks.length > 0 && (
                <section style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,48px)', maxWidth: 1320, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: '0.28em', color: 'rgba(192,125,64,0.5)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
                                {t('Crowd Favourites', 'المفضلة لدى الجميع', lang)}
                            </div>
                            <h2 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 400, color: '#ede0cc', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                                {t('What people love', 'ما يحبه الناس', lang)}
                            </h2>
                        </div>
                        <Link to="/menu-order" className="ff-ghost-btn">{t('Full Menu →', 'القائمة الكاملة →', lang)}</Link>
                    </div>

                    <div className="ff-picks-grid">
                        {topPicks.map((item, idx) => {
                            const style = ITEM_BG[item.cat] || ITEM_BG.hot
                            return (
                                <Link key={item.id} to="/menu-order" style={{ textDecoration: 'none' }}>
                                    <div
                                        className="ff-pick-card"
                                        style={{ animation: `fadeUp 0.6s ${idx * 0.1}s cubic-bezier(0.22,1,0.36,1) both`, animationFillMode: 'both' }}
                                        onMouseEnter={() => setActiveCard(item.id)}
                                        onMouseLeave={() => setActiveCard(null)}
                                    >
                                        {/* Image area */}
                                        <div style={{ height: 'clamp(160px,22vw,220px)', position: 'relative', overflow: 'hidden', background: style.bg }}>
                                            {getImageUrl(item.imageUrl) ? (
                                                <img
                                                    src={getImageUrl(item.imageUrl)}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                                                />
                                            ) : (
                                                <div className="ff-pick-card-img" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(52px,8vw,72px)', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))', opacity: 0.8 }}>
                                                    {item.emoji}
                                                </div>
                                            )}
                                            {/* Price badge */}
                                            <div style={{ position: 'absolute', top: 12, right: isRTL ? 'auto' : 12, left: isRTL ? 12 : 'auto', padding: '5px 12px', background: 'rgba(7,5,3,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(192,125,64,0.25)', borderRadius: 2, fontFamily: "'Cormorant', serif", fontSize: 13, fontWeight: 600, color: style.accent }}>
                                                SAR {item.price.toFixed(2)}
                                            </div>
                                            {/* Gradient overlay */}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(7,5,3,0.96) 100%)' }} />
                                        </div>

                                        {/* Text */}
                                        <div style={{ padding: '14px 16px 18px', background: '#0d0a07' }}>
                                            <div style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(15px,2vw,19px)', fontWeight: 600, color: '#ede0cc', marginBottom: 5, lineHeight: 1.2 }}>
                                                {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                                            </div>
                                            {item.desc && (
                                                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 11, color: 'rgba(237,224,204,0.35)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                                                    {lang === 'ar' ? item.descAr : item.desc}
                                                </div>
                                            )}
                                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ width: 24, height: 1, background: `linear-gradient(90deg, ${style.accent}, transparent)`, transition: 'width 0.35s', ...(activeCard === item.id ? { width: 48 } : {}) }} />
                                                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: style.accent, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: activeCard === item.id ? 1 : 0, transition: 'opacity 0.25s' }}>
                                                    {t('Order →', 'اطلب →', lang)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* ═══ FEATURES ══════════════════════════════════════════ */}
            <section style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,48px)', borderTop: '1px solid rgba(237,224,204,0.04)', background: 'linear-gradient(to bottom, #070503, #050402)' }}>
                <div style={{ maxWidth: 1320, margin: '0 auto' }}>
                    <div className="ff-divider" style={{ marginBottom: 52 }}>
                        {t('The For Friends Experience', 'تجربة فور فريندز', lang)}
                    </div>

                    <div className="ff-feats-grid">
                        {[
                            { icon: '✦', title: t('Premium Beans', 'حبوب مميزة', lang), desc: t('Specialty-grade, single origin, ethically sourced from the world\'s finest farms.', 'درجة متخصصة، أصل واحد، مصدر أخلاقي من أفضل مزارع العالم.', lang), accent: '#c07d40' },
                            { icon: '⚡', title: t('Quick Pickup', 'استلام سريع', lang), desc: t('Order ahead, skip the line. Your drink is ready the moment you arrive.', 'اطلب مسبقاً، تخطَّ الطابور. مشروبك جاهز لحظة وصولك.', lang), accent: '#d4943a' },
                            { icon: '◈', title: t('Made Fresh', 'طازج دائماً', lang), desc: t('Every single order crafted fresh to your exact specifications, every time.', 'كل طلب يُحضَّر طازجاً وفق مواصفاتك تماماً، في كل مرة.', lang), accent: '#b86f35' },
                            { icon: '◉', title: t('Loyalty Perks', 'مكافآت الولاء', lang), desc: t('Regular customers receive exclusive offers, early access, and special discounts.', 'العملاء المنتظمون يحصلون على عروض حصرية ووصول مبكر وخصومات خاصة.', lang), accent: '#e8a848' },
                        ].map((f, i) => (
                            <div key={f.title} className="ff-feature-card" style={{ animation: `fadeUp 0.6s ${i * 0.08}s cubic-bezier(0.22,1,0.36,1) both`, animationFillMode: 'both' }}>
                                <div style={{ fontFamily: "'Cormorant', serif", fontSize: 28, color: f.accent, marginBottom: 20, lineHeight: 1, display: 'block' }}>{f.icon}</div>
                                <div style={{ fontFamily: "'Gilda Display', serif", fontSize: 18, color: '#ede0cc', marginBottom: 10, letterSpacing: '0.01em' }}>{f.title}</div>
                                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 13, color: 'rgba(237,224,204,0.38)', lineHeight: 1.7 }}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ REVIEWS ═══════════════════════════════════════════ */}
            <section style={{ padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,48px)', maxWidth: 1320, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: '0.28em', color: 'rgba(192,125,64,0.5)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
                            {t('What People Say', 'ماذا يقول الناس', lang)}
                        </div>
                        <h2 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 400, color: '#ede0cc', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {t('Guest Reviews', 'آراء العملاء', lang)}
                        </h2>
                        {reviews.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <StarRating rating={Math.round(parseFloat(avgRating))} size={13} />
                                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(237,224,204,0.4)', fontWeight: 300 }}>
                                    {avgRating} {t('from', 'من', lang)} {reviews.length} {t('reviews', 'مراجعة', lang)}
                                </span>
                            </div>
                        )}
                    </div>
                    <Link to="/menu-order" className="ff-pill-btn" style={{ fontSize: 11, letterSpacing: '0.15em' }}>
                        {t('Order & Review', 'اطلب وقيّم', lang)}
                    </Link>
                </div>

                {reviews.length === 0 ? (
                    <>
                        <div style={{ borderRadius: 3, border: '1px dashed rgba(192,125,64,0.15)', padding: 'clamp(32px,5vw,56px)', textAlign: 'center', marginBottom: 28, background: 'rgba(192,125,64,0.02)' }}>
                            <div style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(18px,3vw,26px)', fontStyle: 'italic', color: 'rgba(237,224,204,0.5)', marginBottom: 10 }}>
                                {t('Be the first to share your experience', 'كن أول من يشارك تجربته', lang)}
                            </div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 13, color: 'rgba(237,224,204,0.25)', marginBottom: 24 }}>
                                {t('Order something and leave a review from the tracking page.', 'اطلب شيئاً واترك مراجعة من صفحة التتبع.', lang)}
                            </div>
                            <Link to="/menu-order" className="ff-pill-btn" style={{ fontSize: 11, padding: '12px 32px' }}>
                                {t('Order Now', 'اطلب الآن', lang)}
                            </Link>
                        </div>
                        <div className="ff-reviews-grid">
                            {[
                                { name: 'Ahmed K.', rating: 5, text: 'The cappuccino here is absolutely incredible. Rich, smooth and perfectly balanced. My new daily ritual.', date: '2 days ago' },
                                { name: 'Sara M.', rating: 5, text: 'The iced latte is divine. Ordering was seamless and pickup was instant. Will definitely return.', date: '1 week ago' },
                                { name: 'Omar N.', rating: 4, text: 'Exceptional atmosphere, even better coffee. Staff are warm and the food is beautifully fresh.', date: '2 weeks ago' },
                            ].map((r, i) => <ReviewCard key={i} review={r} lang={lang} />)}
                        </div>
                    </>
                ) : (
                    <div className="ff-reviews-grid">
                        {reviews.slice(0, 6).map((r, i) => <ReviewCard key={i} review={{ ...r, itemName: r.item || r.itemName }} lang={lang} />)}
                    </div>
                )}
            </section>

            {/* ═══ CTA STRIP ══════════════════════════════════════════ */}
            <section style={{ margin: '0 clamp(16px,4vw,48px) clamp(48px,6vw,80px)', borderRadius: 4, overflow: 'hidden', position: 'relative', border: '1px solid rgba(192,125,64,0.12)' }}>
                <div style={{ background: 'radial-gradient(ellipse 100% 200% at 70% 50%, rgba(30,14,3,0.95) 0%, rgba(12,8,4,0.99) 100%)', padding: 'clamp(40px,6vw,72px) clamp(24px,5vw,72px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32, position: 'relative', zIndex: 1 }}>
                    {/* Decorative */}
                    <div style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', fontSize: 120, opacity: 0.04, fontFamily: "'Cormorant', serif", fontStyle: 'italic', letterSpacing: '-0.02em', userSelect: 'none', pointerEvents: 'none' }}>
                        {t('Order', 'اطلب', lang)}
                    </div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(28px,5vw,52px)', fontWeight: 400, color: '#ede0cc', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {t('Ready for something extraordinary?', 'مستعد لشيء استثنائي؟', lang)}
                        </h2>
                        <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 'clamp(13px,1.5vw,15px)', color: 'rgba(237,224,204,0.35)', margin: 0 }}>
                            {t('Browse the full menu and order ahead — no waiting, just excellence.',
                                'تصفح القائمة الكاملة واطلب مسبقاً — لا انتظار، فقط التميز.', lang)}
                        </p>
                    </div>
                    <Link to="/menu-order" className="ff-pill-btn" style={{ fontSize: 12, padding: '16px 44px', letterSpacing: '0.15em', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                        ☕ {t('View Full Menu', 'عرض القائمة', lang)}
                    </Link>
                </div>
            </section>

            {/* ═══ FOOTER ══════════════════════════════════════════════ */}
            <footer style={{ background: '#06040200', borderTop: '1px solid rgba(192,125,64,0.1)' }}>
                <style>{`
                    .ff-footer-wrap { max-width: 1320px; margin: 0 auto; padding: 0 clamp(18px,4vw,48px); }
                    /* Top CTA strip */
                    .ff-footer-cta { display: flex; justify-content: space-between; align-items: center; padding: clamp(28px,4vw,44px) 0; border-bottom: 1px solid rgba(192,125,64,0.1); gap: 20px; flex-wrap: wrap; }
                    /* Main grid */
                    .ff-footer-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1.3fr; gap: clamp(24px,4vw,56px); padding: clamp(36px,5vw,56px) 0 clamp(28px,4vw,44px); }
                    /* Links */
                    .ff-footer-link { font-family: 'Jost',sans-serif; font-size: 13.5px; font-weight: 400; color: rgba(237,224,204,0.42); text-decoration: none; display: flex; align-items: center; gap: 10px; padding: 5px 0; transition: color 0.2s, gap 0.2s; }
                    .ff-footer-link:hover { color: rgba(237,224,204,0.85); gap: 14px; }
                    .ff-footer-link-arrow { font-size: 10px; color: #c07d40; flex-shrink: 0; transition: transform 0.2s; }
                    .ff-footer-link:hover .ff-footer-link-arrow { transform: translateX(3px); }
                    /* Social */
                    .ff-social-btn { width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(192,125,64,0.18); display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.22s; background: rgba(192,125,64,0.04); color: rgba(237,224,204,0.5); }
                    .ff-social-btn:hover { border-color: rgba(192,125,64,0.55); background: rgba(192,125,64,0.1); color: #c07d40; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(192,125,64,0.15); }
                    /* Section title */
                    .ff-ft { font-family: 'Jost',sans-serif; font-size: 10px; font-weight: 600; color: #c07d40; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
                    .ff-ft::after { content: ''; flex: 1; height: 1px; background: rgba(192,125,64,0.12); }
                    /* Contact row */
                    .ff-contact-row { display: flex; align-items: flex-start; gap: 11px; margin-bottom: 13px; }
                    .ff-contact-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(192,125,64,0.07); border: 1px solid rgba(192,125,64,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
                    .ff-contact-text { font-family: 'Jost',sans-serif; font-size: 13px; color: rgba(237,224,204,0.5); line-height: 1.55; text-decoration: none; transition: color 0.2s; }
                    .ff-contact-text:hover { color: #c07d40; }
                    /* Bottom bar */
                    .ff-footer-bottom { border-top: 1px solid rgba(192,125,64,0.07); padding: 18px 0 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
                    /* Hours pill */
                    .ff-open-pill { display: inline-flex; align-items: center; gap: 6px; padding: 4px 11px; border-radius: 999px; background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); }
                    /* Divider line */
                    .ff-footer-divider { width: 28px; height: 2px; background: linear-gradient(90deg, #c07d40, transparent); border-radius: 999px; margin-bottom: 14px; }
                    /* Responsive */
                    @media(max-width: 1000px) { .ff-footer-grid { grid-template-columns: 1fr 1fr; } }
                    @media(max-width: 580px) {
                        .ff-footer-grid { grid-template-columns: 1fr; gap: 28px; }
                        .ff-footer-cta { flex-direction: column; text-align: center; }
                    }
                `}</style>

                <div className="ff-footer-wrap">

                    {/* ── Top CTA strip ── */}
                    <div className="ff-footer-cta">
                        <div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,30px)', fontWeight: 700, color: '#ede0cc', letterSpacing: '-0.01em', marginBottom: 6 }}>
                                {t('Ready to order?', 'هل أنت مستعد للطلب؟', lang)}
                            </div>
                            <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, color: 'rgba(237,224,204,0.38)', fontWeight: 300 }}>
                                {t('Skip the queue — order ahead and pick up when ready.', 'تجاوز الطابور — اطلب مسبقاً واستلم عندما تكون جاهزاً.', lang)}
                            </div>
                        </div>
                        <Link to="/menu-order" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: 'clamp(12px,2vw,14px) clamp(24px,3vw,36px)', borderRadius: 4, background: 'linear-gradient(135deg,#c07d40,#7a3d12)', color: 'white', textDecoration: 'none', fontFamily: "'Jost',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 6px 28px rgba(192,125,64,0.35)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            ☕ {t('Order Now', 'اطلب الآن', lang)}
                        </Link>
                    </div>

                    {/* ── Main grid ── */}
                    <div className="ff-footer-grid">

                        {/* Brand column */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(192,125,64,0.35)', flexShrink: 0 }}>
                                    <img src={logo} alt="For Friends" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: '#ede0cc', letterSpacing: '0.04em', lineHeight: 1.1 }}>For Friends</div>
                                    <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 9, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 3 }}>Café & Roastery</div>
                                </div>
                            </div>
                            <div className="ff-footer-divider" />
                            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, fontWeight: 300, color: 'rgba(237,224,204,0.32)', lineHeight: 1.75, margin: '0 0 22px', maxWidth: 270 }}>
                                {t('Premium specialty coffee, artisanal drinks, and fresh food — crafted to order.', 'قهوة متخصصة مميزة، مشروبات حرفية، وطعام طازج — محضر حسب الطلب.', lang)}
                            </p>
                            {/* Social icons */}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {settings?.instagram && (
                                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="ff-social-btn" title="Instagram">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                                    </a>
                                )}
                                {settings?.snapchat && (
                                    <a href={settings.snapchat} target="_blank" rel="noopener noreferrer" className="ff-social-btn" title="Snapchat">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7 2 5 5.5 5 8.5c0 1.2.1 2 .3 2.6-.3.1-.6.2-.9.2-.4 0-.7-.1-.9-.1-.5 0-.9.3-.9.7 0 .5.5.8 1.2 1 .1 0 .2.1.3.1-.3.5-.8 1.2-1.8 1.7-.3.1-.4.4-.3.7.2.5 1.1.8 2.5 1 .1.3.2.7.3 1 .1.3.3.5.7.5h.1c.3 0 .7-.1 1.2-.1.4 0 .9.1 1.5.5.5.3 1 .5 1.7.5s1.2-.2 1.7-.5c.6-.4 1.1-.5 1.5-.5.5 0 .9.1 1.2.1h.1c.4 0 .6-.2.7-.5.1-.3.2-.7.3-1 1.4-.2 2.3-.5 2.5-1 .1-.3 0-.6-.3-.7-1-.5-1.5-1.2-1.8-1.7.1 0 .2-.1.3-.1.7-.2 1.2-.5 1.2-1 0-.4-.4-.7-.9-.7-.2 0-.5.1-.9.1-.3 0-.6-.1-.9-.2.2-.6.3-1.4.3-2.6C19 5.5 17 2 12 2z" /></svg>
                                    </a>
                                )}
                                {settings?.facebook && (
                                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="ff-social-btn" title="Facebook">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                    </a>
                                )}
                                {settings?.twitter && (
                                    <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="ff-social-btn" title="X / Twitter">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    </a>
                                )}
                                {settings?.whatsapp && (
                                    <a href={`https://wa.me/${(settings.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ff-social-btn" title="WhatsApp">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                                    </a>
                                )}
                                {!settings?.instagram && !settings?.snapchat && !settings?.facebook && !settings?.twitter && !settings?.whatsapp && (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {['IG', 'SC', 'FB', 'X'].map(s => (
                                            <div key={s} className="ff-social-btn" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.3 }}>{s}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <div className="ff-ft">{t('Explore', 'استكشف', lang)}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {[
                                    [t('Home', 'الرئيسية', lang), '/'],
                                    [t('Full Menu', 'القائمة الكاملة', lang), '/menu-order'],
                                    [t('Track My Order', 'تتبع طلبي', lang), '/track/search'],
                                ].map(([label, href]) => (
                                    <Link key={label} to={href} className="ff-footer-link">
                                        <span className="ff-footer-link-arrow">›</span>
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div>
                            <div className="ff-ft">{t('Hours', 'أوقات العمل', lang)}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { days: t('Sat – Thu', 'السبت – الخميس', lang), hours: t('7:00 AM – 12:00 AM', '٧:٠٠ ص – ١٢:٠٠ م', lang) },
                                    { days: t('Friday', 'الجمعة', lang), hours: t('1:00 PM – 12:00 AM', '١:٠٠ م – ١٢:٠٠ م', lang) },
                                ].map(row => (
                                    <div key={row.days}>
                                        <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: 'rgba(237,224,204,0.28)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{row.days}</div>
                                        <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, color: 'rgba(237,224,204,0.6)', fontWeight: 500 }}>{row.hours}</div>
                                    </div>
                                ))}
                                <div className="ff-open-pill">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 7px rgba(74,222,128,0.7)' }} />
                                    <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: '#4ade80', fontWeight: 600 }}>{t('Open Now', 'مفتوح الآن', lang)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div>
                            <div className="ff-ft">{t('Contact', 'تواصل معنا', lang)}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {(settings?.pickupLocation || settings?.address) && (
                                    <div className="ff-contact-row">
                                        <div className="ff-contact-icon">📍</div>
                                        <span className="ff-contact-text">
                                            {settings?.pickupLocation}{settings?.address ? `, ${settings.address}` : ''}
                                        </span>
                                    </div>
                                )}
                                {settings?.pickupPhone && (
                                    <a href={`tel:${settings.pickupPhone}`} className="ff-contact-row" style={{ textDecoration: 'none' }}>
                                        <div className="ff-contact-icon">📞</div>
                                        <span className="ff-contact-text">{settings.pickupPhone}</span>
                                    </a>
                                )}
                                {settings?.whatsapp && (
                                    <a href={`https://wa.me/${(settings.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ff-contact-row" style={{ textDecoration: 'none' }}>
                                        <div className="ff-contact-icon">💬</div>
                                        <span className="ff-contact-text">WhatsApp</span>
                                    </a>
                                )}
                                {settings?.email && (
                                    <a href={`mailto:${settings.email}`} className="ff-contact-row" style={{ textDecoration: 'none' }}>
                                        <div className="ff-contact-icon">✉️</div>
                                        <span className="ff-contact-text">{settings.email}</span>
                                    </a>
                                )}
                                {!settings?.pickupLocation && !settings?.pickupPhone && !settings?.email && (
                                    <div style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: 'rgba(237,224,204,0.2)', lineHeight: 1.7 }}>
                                        {t('Contact details coming soon.', 'تفاصيل التواصل قريباً.', lang)}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Bottom bar ── */}
                <div style={{ borderTop: '1px solid rgba(192,125,64,0.07)', background: 'rgba(0,0,0,0.25)' }}>
                    <div className="ff-footer-wrap">
                        <div className="ff-footer-bottom">
                            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: 'rgba(237,224,204,0.18)', letterSpacing: '0.05em' }}>
                                {footerText}
                            </span>
                            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                                {[
                                    [t('Menu', 'القائمة', lang), '/menu-order'],
                                    [t('Track Order', 'تتبع الطلب', lang), '/track/search'],
                                ].map(([label, href]) => (
                                    <Link key={label} to={href}
                                        style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, color: 'rgba(237,224,204,0.18)', textDecoration: 'none', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#c07d40')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,224,204,0.18)')}>
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </footer>
        </div>
    )
}