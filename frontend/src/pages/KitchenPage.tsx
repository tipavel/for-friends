import { useEffect, useMemo, useRef, useState } from 'react'
import { api, type Order, type OrderStatus } from '../services/api'

// ── Kitchen access: only chef, kitchen, admin roles ──────────────────────────
const KITCHEN_ROLES = ['chef', 'kitchen', 'admin', 'chief']

const activeStatuses: OrderStatus[] = ['new', 'preparing', 'ready']

export default function KitchenPage() {
    const [authed, setAuthed] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loginShake, setLoginShake] = useState(false)
    const [loginAttempts, setLoginAttempts] = useState(0)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [highlightedIds, setHighlightedIds] = useState<string[]>([])
    const [tvMode, setTvMode] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const knownOrderIdsRef = useRef<Set<string>>(new Set())
    const pageRef = useRef<HTMLDivElement | null>(null)

    // Check session on mount
    useEffect(() => {
        const role = sessionStorage.getItem('ff-kitchen-role')
        if (role && KITCHEN_ROLES.includes(role)) setAuthed(true)
        else setLoading(false)
    }, [])

    async function login() {
        try {
            const res = await api.login({ username, password })
            const role = res.user.role
            if (!KITCHEN_ROLES.includes(role)) {
                const n = loginAttempts + 1; setLoginAttempts(n)
                setLoginShake(true); setTimeout(() => setLoginShake(false), 600)
                setLoginError(`Access denied. The "${role}" role does not have kitchen access.\nAllowed roles: chef, kitchen, admin.`)
                return
            }
            sessionStorage.setItem('ff-kitchen-role', role)
            sessionStorage.setItem('ff-kitchen-name', res.user.name || username)
            setAuthed(true); setLoginError(''); setLoginAttempts(0)
        } catch {
            const n = loginAttempts + 1; setLoginAttempts(n)
            setLoginShake(true); setTimeout(() => setLoginShake(false), 600)
            setLoginError(n >= 3 ? `❌ ${n} failed attempts. Please check your credentials.` : 'Incorrect username or password.')
        }
    }

    async function loadOrders(showLoader = false) {
        try {
            if (showLoader) setLoading(true)
            const data = await api.getOrders()
            const sorted = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
            const incomingActive = sorted.filter(o => activeStatuses.includes(o.status))
            const incomingIds = new Set(incomingActive.map(o => o.id))
            if (knownOrderIdsRef.current.size > 0) {
                const newIds = [...incomingIds].filter(id => !knownOrderIdsRef.current.has(id))
                if (newIds.length > 0) {
                    setHighlightedIds(prev => [...new Set([...prev, ...newIds])])
                    if (soundEnabled) playNewOrderSound()
                    setTimeout(() => setHighlightedIds(prev => prev.filter(id => !newIds.includes(id))), 10000)
                }
            }
            knownOrderIdsRef.current = incomingIds
            setOrders(sorted); setLastUpdated(new Date()); setError('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders')
        } finally { if (showLoader) setLoading(false) }
    }

    useEffect(() => {
        if (!authed) return
        loadOrders(true)
        const interval = setInterval(() => loadOrders(false), 4000)
        return () => clearInterval(interval)
    }, [authed, soundEnabled])

    useEffect(() => {
        const handler = () => setIsFullscreen(Boolean(document.fullscreenElement))
        document.addEventListener('fullscreenchange', handler)
        return () => document.removeEventListener('fullscreenchange', handler)
    }, [])

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) { await pageRef.current?.requestFullscreen(); setIsFullscreen(true) }
            else { await document.exitFullscreen(); setIsFullscreen(false) }
        } catch { }
    }

    async function moveOrder(id: string, current: OrderStatus) {
        const next: Record<OrderStatus, OrderStatus> = { new: 'preparing', preparing: 'ready', ready: 'done', done: 'done' }
        if (current === 'done') return
        try { await api.updateOrderStatus(id, next[current]); await loadOrders(false) }
        catch { alert('Failed to update order') }
    }

    const visibleOrders = useMemo(() => orders.filter(o => activeStatuses.includes(o.status)), [orders])
    const newOrders = visibleOrders.filter(o => o.status === 'new')
    const preparingOrders = visibleOrders.filter(o => o.status === 'preparing')
    const readyOrders = visibleOrders.filter(o => o.status === 'ready')

    // ── LOGIN ────────────────────────────────────────────────────────────
    if (!authed) return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#0c0704,#1a0f0a)', fontFamily: "'DM Sans',sans-serif" }}>
            <div style={{ width: '100%', maxWidth: 420, animation: loginShake ? 'shake 0.5s ease' : 'none' }}>
                <div style={{ borderRadius: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,125,64,0.22)', padding: '40px 36px', backdropFilter: 'blur(20px)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🍳</div>
                        <h1 style={{ color: '#f5e0c0', fontFamily: "'Cormorant Garamond',serif", fontSize: 28, margin: '0 0 6px', fontWeight: 900 }}>Kitchen Screen</h1>
                        <p style={{ color: 'rgba(245,220,180,0.4)', fontSize: 13, margin: 0 }}>Chef & Kitchen Staff Only</p>
                    </div>

                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 14, background: 'rgba(192,125,64,0.08)', border: '1px solid rgba(192,125,64,0.2)', color: 'rgba(245,220,180,0.6)', fontSize: 12, textAlign: 'center' }}>
                        🔒 Access restricted to: <strong style={{ color: '#c07d40' }}>chef · kitchen · admin</strong>
                    </div>

                    {loginAttempts >= 3 && <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 13, textAlign: 'center' }}>Multiple failed attempts detected.</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={dkIn} />
                        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={dkIn} onKeyDown={e => e.key === 'Enter' && login()} />
                        {loginError && <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, whiteSpace: 'pre-line' }}>⚠️ {loginError}</div>}
                        <button onClick={login} style={{ padding: '14px', borderRadius: 999, background: 'linear-gradient(135deg,#c07d40,#a8632e)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 15, boxShadow: '0 4px 20px rgba(192,125,64,0.4)', fontFamily: 'inherit' }}>Sign In →</button>
                    </div>
                    {loginAttempts > 0 && loginAttempts < 3 && <p style={{ textAlign: 'center', marginTop: 12, color: 'rgba(245,220,180,0.3)', fontSize: 12 }}>{loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}</p>}
                </div>
            </div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;700;800;900&display=swap');*{box-sizing:border-box}@keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-8px)}60%{transform:translateX(8px)}75%{transform:translateX(-4px)}90%{transform:translateX(4px)}}`}</style>
        </div>
    )

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#120a07', color: 'white' }}>
            <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48 }}>☕</div><div style={{ marginTop: 16, fontSize: 22, fontWeight: 800 }}>Loading kitchen screen...</div></div>
        </div>
    )

    const staffName = sessionStorage.getItem('ff-kitchen-name')
    const staffRole = sessionStorage.getItem('ff-kitchen-role')

    return (
        <div ref={pageRef} style={{ minHeight: '100vh', background: '#120a07', color: 'white', fontFamily: "'DM Sans',sans-serif", cursor: tvMode ? 'none' : 'auto' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(26,15,10,0.95)', backdropFilter: 'blur(20px)', padding: tvMode ? '12px 20px' : '14px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, color: '#f5ede0', fontSize: tvMode ? 44 : 34, margin: 0 }}>🍳 Kitchen Screen</h1>
                            {staffName && !tvMode && <div style={{ padding: '3px 12px', borderRadius: 999, background: 'rgba(192,125,64,0.15)', border: '1px solid rgba(192,125,64,0.25)', color: '#c07d40', fontSize: 12, fontWeight: 700 }}>{staffRole === 'chief' ? 'chef' : staffRole} · {staffName}</div>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 14 }}>
                            <StatusBadge label="New" value={newOrders.length} color="orange" tvMode={tvMode} />
                            <StatusBadge label="Preparing" value={preparingOrders.length} color="red" tvMode={tvMode} />
                            <StatusBadge label="Ready" value={readyOrders.length} color="green" tvMode={tvMode} />
                            <button onClick={() => setSoundEnabled(p => !p)} style={{ borderRadius: 999, padding: tvMode ? '8px 16px' : '7px 14px', fontWeight: 700, background: soundEnabled ? '#16a34a' : 'rgba(255,255,255,0.08)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: tvMode ? 15 : 13 }}>{soundEnabled ? '🔔 Sound On' : '🔕 Sound Off'}</button>
                            <button onClick={() => setTvMode(p => !p)} style={{ borderRadius: 999, padding: tvMode ? '8px 16px' : '7px 14px', fontWeight: 700, background: '#2c2018', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: tvMode ? 15 : 13 }}>{tvMode ? 'Exit TV' : 'TV Mode'}</button>
                            <button onClick={toggleFullscreen} style={{ borderRadius: 999, padding: tvMode ? '8px 16px' : '7px 14px', fontWeight: 700, background: '#c07d40', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: tvMode ? 15 : 13 }}>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</button>
                            <button onClick={() => { sessionStorage.removeItem('ff-kitchen-role'); sessionStorage.removeItem('ff-kitchen-name'); setAuthed(false) }} style={{ borderRadius: 999, padding: '7px 14px', fontWeight: 700, background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.25)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Logout</button>
                        </div>
                    </div>
                    {!tvMode && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.4)' }}>{lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Waiting...'}</div>
                            {error && <div style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13 }}>{error}</div>}
                        </div>
                    )}
                </div>
            </header>

            <main style={{ padding: tvMode ? '12px' : '20px 24px' }}>
                {visibleOrders.length === 0 ? (
                    <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ borderRadius: 32, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '48px 64px', textAlign: 'center' }}>
                            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                            <div style={{ fontSize: tvMode ? 32 : 26, fontWeight: 800, color: '#f5ede0', marginBottom: 8 }}>All clear! No active orders.</div>
                            <div style={{ color: 'rgba(245,237,224,0.4)', fontSize: 15 }}>New orders appear here automatically.</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: tvMode ? 12 : 20 }}>
                        <KitchenColumn title="New Orders" emoji="🆕" orders={newOrders} tone="orange" actionLabel="Start Preparing" highlightedIds={highlightedIds} onMove={moveOrder} tvMode={tvMode} />
                        <KitchenColumn title="Preparing" emoji="🔥" orders={preparingOrders} tone="red" actionLabel="Mark Ready" highlightedIds={highlightedIds} onMove={moveOrder} tvMode={tvMode} />
                        <KitchenColumn title="Ready for Pickup" emoji="✅" orders={readyOrders} tone="green" actionLabel="Complete" highlightedIds={highlightedIds} onMove={moveOrder} tvMode={tvMode} />
                    </div>
                )}
            </main>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>
        </div>
    )
}

function KitchenColumn({ title, emoji, orders, tone, actionLabel, highlightedIds, onMove, tvMode }: { title: string; emoji: string; orders: Order[]; tone: 'orange' | 'red' | 'green'; actionLabel: string; highlightedIds: string[]; onMove: (id: string, s: OrderStatus) => void; tvMode: boolean }) {
    const toneStyle = { orange: 'rgba(251,146,60,0.1)', red: 'rgba(239,68,68,0.1)', green: 'rgba(34,197,94,0.1)' }
    const toneBorder = { orange: 'rgba(251,146,60,0.25)', red: 'rgba(239,68,68,0.25)', green: 'rgba(34,197,94,0.25)' }
    return (
        <section style={{ borderRadius: 28, border: `1px solid ${toneBorder[tone]}`, background: toneStyle[tone], padding: tvMode ? 12 : 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.18)', borderRadius: 18, padding: tvMode ? '12px 16px' : '10px 16px', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, color: '#f5ede0', fontSize: tvMode ? 30 : 22, margin: 0 }}>{emoji} {title}</h2>
                <span style={{ borderRadius: 999, background: 'rgba(255,255,255,0.1)', padding: tvMode ? '4px 14px' : '3px 12px', fontWeight: 800, fontSize: tvMode ? 16 : 14 }}>{orders.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tvMode ? 12 : 14 }}>
                {orders.length === 0 ? <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: '32px 16px', textAlign: 'center', color: 'rgba(245,237,224,0.35)' }}>No orders here</div> :
                    orders.map(order => <KitchenCard key={order.id} order={order} actionLabel={actionLabel} isHighlighted={highlightedIds.includes(order.id)} onMove={onMove} tvMode={tvMode} />)
                }
            </div>
        </section>
    )
}

function KitchenCard({ order, actionLabel, isHighlighted, onMove, tvMode }: { order: Order; actionLabel: string; isHighlighted: boolean; onMove: (id: string, s: OrderStatus) => void; tvMode: boolean }) {
    const age = Math.max(0, Math.floor((Date.now() - new Date(order.time).getTime()) / 60000))
    const urgent = order.status === 'new' && age >= 5
    return (
        <article style={{ borderRadius: 20, border: `1px solid ${isHighlighted ? '#fbbf24' : urgent ? 'rgba(196,88,58,0.6)' : 'rgba(255,255,255,0.08)'}`, background: isHighlighted ? 'rgba(251,191,36,0.08)' : urgent ? '#2a120d' : '#1b120f', padding: tvMode ? 20 : 16, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', animation: isHighlighted ? 'pulse 1.5s ease infinite' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, color: '#c07d40', fontSize: tvMode ? 30 : 24 }}>#{order.id}</div>
                    <div style={{ fontWeight: 700, color: '#f5ede0', fontSize: tvMode ? 22 : 17, marginTop: 2 }}>{order.name || 'Walk-in'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'rgba(245,237,224,0.5)', fontSize: tvMode ? 14 : 12 }}>{new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ marginTop: 6, borderRadius: 999, padding: tvMode ? '4px 12px' : '3px 10px', background: isHighlighted ? '#fbbf24' : urgent ? '#c4583a' : 'rgba(255,255,255,0.08)', color: isHighlighted ? '#1a0f0a' : 'white', fontWeight: 800, fontSize: tvMode ? 13 : 11, display: 'inline-block' }}>{isHighlighted ? 'NEW!' : urgent ? `🔴 ${age}m` : `${age}m`}</div>
                </div>
            </div>
            <div style={{ borderRadius: 14, background: 'rgba(0,0,0,0.2)', padding: tvMode ? '14px 16px' : '10px 14px', marginBottom: order.notes ? 10 : 12 }}>
                {order.items.map(item => (
                    <div key={`${item.id}-${item.qty}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: tvMode ? 19 : 15 }}>
                        <span style={{ color: '#f5ede0' }}>{item.emoji} {item.name} <strong style={{ color: '#c07d40' }}>×{item.qty}</strong></span>
                        <span style={{ color: 'rgba(245,237,224,0.6)', fontSize: tvMode ? 14 : 12 }}>SAR {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            {order.notes && <div style={{ borderRadius: 12, border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.08)', color: '#fde68a', padding: tvMode ? '10px 14px' : '8px 12px', fontSize: tvMode ? 14 : 12, marginBottom: 12 }}>📝 {order.notes}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(245,237,224,0.5)', fontSize: tvMode ? 14 : 12, marginBottom: 12 }}>
                <span>Pickup: {order.pickup}</span>
                <span style={{ fontWeight: 800, color: '#c07d40' }}>SAR {order.total.toFixed(2)}</span>
            </div>
            <button onClick={() => onMove(order.id, order.status)} style={{ width: '100%', borderRadius: 16, background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', border: 'none', fontWeight: 800, fontSize: tvMode ? 22 : 16, padding: tvMode ? '18px' : '14px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(192,125,64,0.35)' }}>{actionLabel} →</button>
        </article>
    )
}

function StatusBadge({ label, value, color, tvMode }: { label: string; value: number; color: 'orange' | 'red' | 'green'; tvMode: boolean }) {
    const c = { orange: 'rgba(251,146,60,0.15)', red: 'rgba(239,68,68,0.15)', green: 'rgba(34,197,94,0.15)' }
    const t = { orange: '#fdba74', red: '#fca5a5', green: '#86efac' }
    return <div style={{ borderRadius: 999, background: c[color], border: `1px solid ${t[color]}44`, color: t[color], padding: tvMode ? '8px 16px' : '6px 12px', fontSize: tvMode ? 15 : 13, fontWeight: 700 }}>{label}: {value}</div>
}

function playNewOrderSound() {
    try {
        const AC = window.AudioContext || (window as any).webkitAudioContext
        if (!AC) return
        const ctx = new AC()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12); osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24)
        gain.gain.setValueAtTime(0.001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
        osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.45)
        osc.onended = () => ctx.close().catch(() => { })
    } catch { }
}

const dkIn: React.CSSProperties = { width: '100%', borderRadius: 13, border: '1px solid rgba(255,255,255,0.12)', padding: '13px 16px', fontSize: 15, fontFamily: "'DM Sans',sans-serif", background: 'rgba(255,255,255,0.07)', color: '#f5e0c0', outline: 'none' }
