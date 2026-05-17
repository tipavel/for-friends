import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/4f_logu.png'

export default function TrackSearchPage() {
    const navigate = useNavigate()
    const [token, setToken] = useState('')
    const [error, setError] = useState('')

    function handleSearch() {
        const clean = token.trim().replace(/^#/, '')
        if (!clean) { setError('Please enter your order token'); return }
        navigate(`/track/${clean}`)
    }

    // Check recent orders from localStorage
    const recentOrders: { id: string; name: string; total: number; createdAt: string }[] = (() => {
        try { return JSON.parse(localStorage.getItem('recent-orders') || '[]').slice(0, 3) } catch { return [] }
    })()

    return (
        <div style={{ minHeight: '100vh', background: '#070503', color: '#ede0cc', fontFamily: "'Jost', sans-serif", display: 'flex', flexDirection: 'column' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; }
                input:focus { outline: none; border-color: rgba(192,125,64,0.55) !important; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
            `}</style>

            {/* Nav */}
            <nav style={{ borderBottom: '1px solid rgba(192,125,64,0.08)', padding: '0 clamp(16px,4vw,48px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(192,125,64,0.35)' }}>
                        <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ fontFamily: "'Cormorant', serif", fontSize: 16, color: '#ede0cc', letterSpacing: '0.04em' }}>For Friends</div>
                </Link>
                <Link to="/menu-order" style={{ padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(192,125,64,0.2)', background: 'transparent', color: '#c07d40', textDecoration: 'none', fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Menu
                </Link>
            </nav>

            {/* Main */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,24px)' }}>
                <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 0.6s ease both' }}>

                    {/* Icon */}
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(192,125,64,0.08)', border: '1px solid rgba(192,125,64,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 28px' }}>
                        🎟️
                    </div>

                    <h1 style={{ fontFamily: "'Cormorant', serif", fontWeight: 300, fontSize: 'clamp(36px,7vw,52px)', color: '#ede0cc', textAlign: 'center', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        Track Your Order
                    </h1>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 14, color: 'rgba(237,224,204,0.35)', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.7 }}>
                        Enter your order token or ID to see the live status of your order.
                    </p>

                    {/* Input */}
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                        <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Cormorant', serif", fontSize: 20, color: 'rgba(192,125,64,0.4)', pointerEvents: 'none' }}>#</span>
                        <input
                            value={token}
                            onChange={e => { setToken(e.target.value); setError('') }}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter order token..."
                            autoFocus
                            style={{
                                width: '100%', padding: '16px 18px 16px 38px',
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(192,125,64,0.2)',
                                borderRadius: 10,
                                color: '#ede0cc', fontSize: 16,
                                fontFamily: "'Jost', sans-serif", fontWeight: 400,
                                letterSpacing: '0.05em',
                                transition: 'border-color 0.2s',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: 'rgba(248,113,113,0.8)', fontSize: 12, marginBottom: 12, fontWeight: 500, letterSpacing: '0.03em' }}>
                            ✕ {error}
                        </div>
                    )}

                    <button onClick={handleSearch} style={{
                        width: '100%', padding: '15px',
                        background: 'linear-gradient(135deg, #c07d40, #8b4f1c)',
                        color: 'white', border: 'none', borderRadius: 10,
                        fontFamily: "'Jost', sans-serif", fontWeight: 700,
                        fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase',
                        cursor: 'pointer', boxShadow: '0 6px 28px rgba(192,125,64,0.4)',
                        transition: 'opacity 0.2s, transform 0.2s',
                        marginBottom: 28,
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}>
                        Track Order →
                    </button>

                    {/* Recent orders */}
                    {recentOrders.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                <div style={{ flex: 1, height: 1, background: 'rgba(192,125,64,0.1)' }} />
                                <span style={{ fontSize: 10, color: 'rgba(192,125,64,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Recent Orders</span>
                                <div style={{ flex: 1, height: 1, background: 'rgba(192,125,64,0.1)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {recentOrders.map(o => (
                                    <button key={o.id} onClick={() => navigate(`/track/${o.id}`)} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.025)',
                                        border: '1px solid rgba(192,125,64,0.1)',
                                        borderRadius: 10, cursor: 'pointer',
                                        transition: 'border-color 0.2s, background 0.2s',
                                        width: '100%', textAlign: 'left', fontFamily: 'inherit',
                                    }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(192,125,64,0.35)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(192,125,64,0.05)' }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(192,125,64,0.1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.025)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 18 }}>🧾</span>
                                            <div>
                                                <div style={{ fontFamily: "'Cormorant', serif", fontSize: 17, fontWeight: 600, color: '#c07d40' }}>#{o.id}</div>
                                                {o.name && <div style={{ fontSize: 11, color: 'rgba(237,224,204,0.3)', marginTop: 1 }}>{o.name}</div>}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(237,224,204,0.6)' }}>SAR {o.total?.toFixed(2)}</div>
                                            <div style={{ fontSize: 10, color: 'rgba(237,224,204,0.2)', marginTop: 2 }}>
                                                {new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Back link */}
                    <div style={{ textAlign: 'center', marginTop: 36 }}>
                        <Link to="/" style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(237,224,204,0.25)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#c07d40')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,224,204,0.25)')}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}