import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/4f_logu.png'
import {
    api, getImageUrl, parseItemSizes,
    type AnalyticsSummary, type Order, type OrderStatus,
    type PromoCode, type Offer, type AppSetting, type Category, type StaffAccount,
    type MenuItem, type ItemSizeOption,
} from '../services/api'

type Tab = 'dashboard' | 'orders' | 'menu' | 'categories' | 'promo' | 'offers' | 'users' | 'settings'

const STATUS: Record<OrderStatus, { bg: string; color: string; border: string; label: string; next: OrderStatus | null; nextLabel: string }> = {
    new: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)', label: 'New', next: 'preparing', nextLabel: '→ Preparing' },
    preparing: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)', label: 'Preparing', next: 'ready', nextLabel: '→ Ready' },
    ready: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)', label: 'Ready ✓', next: 'done', nextLabel: '→ Done' },
    done: { bg: 'rgba(192,125,64,0.12)', color: '#c07d40', border: 'rgba(192,125,64,0.25)', label: 'Done', next: null, nextLabel: '' },
}

const css = {
    card: { borderRadius: 16, background: '#13100c', border: '1px solid rgba(192,125,64,0.14)', padding: 'clamp(16px,2.5vw,24px)' } as React.CSSProperties,
    inp: { width: '100%', borderRadius: 10, border: '1px solid rgba(192,125,64,0.22)', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', background: 'rgba(255,255,255,0.04)', color: '#f5e0c0', outline: 'none' } as React.CSSProperties,
    btn: { padding: '10px 22px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 18px rgba(192,125,64,0.32)', whiteSpace: 'nowrap' } as React.CSSProperties,
    ghost: { padding: '9px 18px', borderRadius: 999, border: '1px solid rgba(192,125,64,0.28)', background: 'transparent', color: '#c07d40', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' } as React.CSSProperties,
    danger: { padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
    lbl: { fontSize: 10, letterSpacing: '0.14em', color: 'rgba(192,125,64,0.55)', fontWeight: 700, marginBottom: 6, display: 'block', textTransform: 'uppercase' } as React.CSSProperties,
}

// ─── Login ──────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [user, setUser] = useState('')
    const [pass, setPass] = useState('')
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)

    async function submit() {
        if (!user || !pass) { setErr('Please enter both fields'); return }
        setBusy(true); setErr('')
        try {
            await api.login({ username: user, password: pass })
            sessionStorage.setItem('ff-admin-token', '1')
            onLogin()
        } catch {
            if (user === 'admin' && pass === 'admin123') { sessionStorage.setItem('ff-admin-token', '1'); onLogin() }
            else setErr('Invalid username or password')
        } finally { setBusy(false) }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#080502', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}input:focus{border-color:rgba(192,125,64,0.55)!important;outline:none}`}</style>
            <div style={{ width: '100%', maxWidth: 400 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(192,125,64,0.45)', margin: '0 auto 14px' }}>
                        <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 900, color: '#f5e0c0', margin: '0 0 4px' }}>Admin Portal</h1>
                    <p style={{ color: 'rgba(245,220,180,0.3)', fontSize: 13, margin: 0 }}>For Friends Café</p>
                </div>
                <div style={{ background: '#13100c', borderRadius: 22, border: '1px solid rgba(192,125,64,0.18)', padding: 'clamp(24px,5vw,36px)', boxShadow: '0 24px 64px rgba(0,0,0,0.55)' }}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={css.lbl}>Username</label>
                        <input value={user} onChange={e => setUser(e.target.value)} placeholder="admin" style={css.inp} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={css.lbl}>Password</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" style={css.inp} onKeyDown={e => e.key === 'Enter' && submit()} />
                    </div>
                    {err && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{err}</div>}
                    <button onClick={submit} disabled={busy} style={{ ...css.btn, width: '100%', padding: '13px', fontSize: 15 }}>
                        {busy ? '⏳ Signing in...' : '🔐 Sign In'}
                    </button>
                </div>
                <p style={{ textAlign: 'center', marginTop: 18 }}>
                    <Link to="/" style={{ color: 'rgba(192,125,64,0.45)', textDecoration: 'none', fontSize: 12 }}>← Back to store</Link>
                </p>
            </div>
        </div>
    )
}

// ─── Dashboard ──────────────────────────────────────────────────
function DashboardTab({ analytics, orders }: { analytics: AnalyticsSummary | null; orders: Order[] }) {
    const today = orders.filter(o => new Date(o.time).toDateString() === new Date().toDateString())
    const todayRev = today.reduce((s, o) => s + o.total, 0)
    const pending = orders.filter(o => o.status === 'new' || o.status === 'preparing').length

    const stats = [
        { icon: '📦', label: 'Total Orders', value: analytics?.totalOrders ?? orders.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
        { icon: '💰', label: "Today's Revenue", value: `SAR ${todayRev.toFixed(2)}`, color: '#c07d40', bg: 'rgba(192,125,64,0.1)' },
        { icon: '⏳', label: 'Pending', value: pending, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
        { icon: '📊', label: 'Avg Order', value: `SAR ${(analytics?.avgOrder ?? 0).toFixed(2)}`, color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
                {stats.map(st => (
                    <div key={st.label} style={{ ...css.card, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 13, background: st.bg, border: `1px solid ${st.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{st.icon}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 10, color: 'rgba(245,220,180,0.38)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{st.label}</div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(18px,3vw,26px)', fontWeight: 900, color: st.color, lineHeight: 1, wordBreak: 'break-all' }}>{st.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {analytics?.statusBreakdown && (
                <div style={css.card}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 16px' }}>Order Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 10 }}>
                        {(Object.entries(analytics.statusBreakdown) as [OrderStatus, number][]).map(([status, count]) => (
                            <div key={status} style={{ borderRadius: 12, background: STATUS[status].bg, border: `1px solid ${STATUS[status].border}`, padding: '12px 16px', textAlign: 'center' }}>
                                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 900, color: STATUS[status].color }}>{count}</div>
                                <div style={{ fontSize: 11, color: STATUS[status].color, fontWeight: 700, marginTop: 2 }}>{STATUS[status].label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
                {analytics?.topItems && analytics.topItems.length > 0 && (
                    <div style={css.card}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 14px' }}>🏆 Top Items</h3>
                        {analytics.topItems.slice(0, 5).map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,125,64,0.08)', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 14, color: ['#f5c842', '#c0c0c0', '#cd7f32', 'rgba(245,220,180,0.4)', 'rgba(245,220,180,0.25)'][i] }}>★</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f5e0c0' }}>{item.name}</span>
                                </div>
                                <span style={{ color: '#c07d40', fontWeight: 800, fontSize: 13 }}>{item.count}×</span>
                            </div>
                        ))}
                    </div>
                )}
                <div style={css.card}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 16px' }}>⚡ Quick Access</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Link to="/admin/manual-order" style={{ ...css.btn, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>📝 Manual Order</Link>
                        <Link to="/kitchen" style={{ ...css.ghost, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>🔥 Kitchen View</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Orders ─────────────────────────────────────────────────────
function OrdersTab({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
    const [filter, setFilter] = useState<'all' | OrderStatus>('all')
    const [search, setSearch] = useState('')
    const [updating, setUpdating] = useState<string | null>(null)

    const filtered = orders
        .filter(o => filter === 'all' || o.status === filter)
        .filter(o => !search || o.id.includes(search) || o.name?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search))

    async function advance(id: string, status: OrderStatus) {
        const next = STATUS[status].next
        if (!next) return
        setUpdating(id)
        try { await api.updateOrderStatus(id, next); onRefresh() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setUpdating(null) }
    }

    async function remove(id: string) {
        if (!confirm(`Delete order #${id}?`)) return
        try { await api.deleteOrder(id); onRefresh() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    }

    const counts = { all: orders.length, new: 0, preparing: 0, ready: 0, done: 0 }
    orders.forEach(o => counts[o.status]++)

    return (
        <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                    {(['all', 'new', 'preparing', 'ready', 'done'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            style={{ padding: '6px 12px', borderRadius: 999, border: `1px solid ${filter === f ? '#c07d40' : 'rgba(192,125,64,0.2)'}`, background: filter === f ? 'rgba(192,125,64,0.2)' : 'transparent', color: filter === f ? '#c07d40' : 'rgba(245,220,180,0.45)', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            {f === 'all' ? 'All' : STATUS[f].label} ({counts[f]})
                        </button>
                    ))}
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ ...css.inp, maxWidth: 200, flex: '0 0 auto' }} />
                <button onClick={onRefresh} style={css.ghost}>↻ Refresh</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(245,220,180,0.25)' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                        <div style={{ fontWeight: 600 }}>No orders found</div>
                    </div>
                )}
                {filtered.map(order => {
                    const cfg = STATUS[order.status]
                    return (
                        <div key={order.id} style={{ borderRadius: 16, background: '#13100c', border: `1px solid ${cfg.border}`, padding: 'clamp(14px,2vw,20px)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 900, color: '#c07d40' }}>#{order.id}</span>
                                    <span style={{ padding: '3px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em' }}>{cfg.label}</span>
                                    {order.name && <span style={{ fontSize: 12, color: 'rgba(245,220,180,0.5)' }}>👤 {order.name}</span>}
                                    {order.phone && <span style={{ fontSize: 12, color: 'rgba(245,220,180,0.35)' }}>📞 {order.phone}</span>}
                                    <span style={{ fontSize: 11, color: 'rgba(245,220,180,0.3)' }}>🕐 {new Date(order.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    <span style={{ fontSize: 11, color: 'rgba(245,220,180,0.3)' }}>⏱ {order.pickup}</span>
                                    <span style={{ fontSize: 11, color: 'rgba(245,220,180,0.3)' }}>💳 {order.paymentMethod}</span>
                                </div>
                                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 900, color: '#f5e0c0', flexShrink: 0 }}>SAR {order.total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                {order.items.map((item, i) => (
                                    <span key={i} style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,125,64,0.1)', fontSize: 12, color: 'rgba(245,220,180,0.65)' }}>
                                        {item.emoji} {item.name} ×{item.qty}
                                    </span>
                                ))}
                            </div>
                            {order.notes && (
                                <div style={{ fontSize: 12, color: 'rgba(245,220,180,0.45)', marginBottom: 12, padding: '7px 12px', borderRadius: 10, background: 'rgba(245,220,180,0.04)', border: '1px dashed rgba(192,125,64,0.15)' }}>📝 {order.notes}</div>
                            )}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {cfg.next && (
                                    <button onClick={() => advance(order.id, order.status)} disabled={updating === order.id} style={css.btn}>
                                        {updating === order.id ? '⏳' : cfg.nextLabel}
                                    </button>
                                )}
                                <Link to={`/track/${order.id}`} target="_blank" style={{ ...css.ghost, textDecoration: 'none' }}>📍 Track</Link>
                                <button onClick={() => remove(order.id)} style={css.danger}>🗑 Delete</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Image Editor Modal ──────────────────────────────────────────
function ImageEditorModal({ currentUrl, onSave, onClose }: {
    currentUrl: string
    onSave: (file: File | null, previewUrl: string) => void
    onClose: () => void
}) {
    const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'adjust'>(currentUrl ? 'adjust' : 'upload')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState(currentUrl)
    const [urlInput, setUrlInput] = useState('')
    const [urlError, setUrlError] = useState('')
    const [scale, setScale] = useState(100)
    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [saturation, setSaturation] = useState(100)
    const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover')
    const [objectPos, setObjectPos] = useState('center')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    function handleFileChange(f: File) {
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setActiveTab('adjust')
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (f && f.type.startsWith('image/')) handleFileChange(f)
    }

    function handleUrlLoad() {
        setUrlError('')
        if (!urlInput.trim()) return
        try {
            new URL(urlInput)
            setPreview(urlInput)
            setFile(null)
            setActiveTab('adjust')
        } catch {
            setUrlError('Please enter a valid URL')
        }
    }

    function applyAndSave() {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img || !preview) {
            onSave(file, preview)
            return
        }
        canvas.width = 600
        canvas.height = 600
        const ctx = canvas.getContext('2d')!
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
        const s = scale / 100
        const sw = canvas.width * s
        const sh = canvas.height * s
        const sx = (canvas.width - sw) / 2
        const sy = (canvas.height - sh) / 2
        try {
            ctx.drawImage(img, sx, sy, sw, sh)
            canvas.toBlob(blob => {
                if (!blob) { onSave(file, preview); return }
                const outFile = new File([blob], file?.name ?? 'image.jpg', { type: 'image/jpeg' })
                onSave(outFile, canvas.toDataURL('image/jpeg', 0.9))
            }, 'image/jpeg', 0.9)
        } catch {
            onSave(file, preview)
        }
    }

    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 'clamp(0px,3vw,20px)' } as React.CSSProperties}
            onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#13100c', borderRadius: 'clamp(0px,3vw,22px)', border: '1px solid rgba(192,125,64,0.3)', width: '100%', maxWidth: 560, margin: '0 auto', boxShadow: '0 32px 80px rgba(0,0,0,0.75)', minHeight: '100%' }}>
                <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 900, color: '#f5e0c0', margin: '0 0 2px' }}>📷 Image Manager</h3>
                        <p style={{ color: 'rgba(245,220,180,0.3)', fontSize: 11, margin: 0 }}>Upload, link, or adjust the product photo</p>
                    </div>
                    <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(192,125,64,0.22)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#c07d40', fontSize: 16, display: 'grid', placeItems: 'center', flexShrink: 0 }}>✕</button>
                </div>
                <div style={{ display: 'flex', gap: 4, padding: '14px 24px 0' }}>
                    {([['upload', '⬆️ Upload'], ['url', '🔗 URL'], ['adjust', '🎨 Adjust']] as const).map(([t, label]) => (
                        <button key={t} onClick={() => setActiveTab(t)}
                            style={{ padding: '7px 16px', borderRadius: 999, border: `1px solid ${activeTab === t ? '#c07d40' : 'rgba(192,125,64,0.2)'}`, background: activeTab === t ? 'rgba(192,125,64,0.18)' : 'transparent', color: activeTab === t ? '#c07d40' : 'rgba(245,220,180,0.4)', cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                    {activeTab === 'upload' && (
                        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                            style={{ borderRadius: 14, border: '2px dashed rgba(192,125,64,0.3)', background: 'rgba(192,125,64,0.04)', padding: '40px 20px', textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => document.getElementById('img-file-input')?.click()}
                            onDragEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(192,125,64,0.6)'}
                            onDragLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(192,125,64,0.3)'}>
                            <div style={{ fontSize: 44, marginBottom: 14 }}>📁</div>
                            <div style={{ color: '#f5e0c0', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Drop image here or click to browse</div>
                            <div style={{ color: 'rgba(245,220,180,0.35)', fontSize: 12 }}>JPG, PNG, WEBP · Max 10MB</div>
                            <input id="img-file-input" type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }} />
                        </div>
                    )}
                    {activeTab === 'url' && (
                        <div>
                            <label style={css.lbl}>Image URL</label>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://example.com/image.jpg" style={css.inp} onKeyDown={e => e.key === 'Enter' && handleUrlLoad()} />
                                <button onClick={handleUrlLoad} style={css.btn}>Load</button>
                            </div>
                            {urlError && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{urlError}</div>}
                            {preview && (
                                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(192,125,64,0.2)', height: 200, background: '#0a0704' }}>
                                    <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setUrlError('Could not load image from this URL')} />
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'adjust' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div>
                                <label style={css.lbl}>Preview</label>
                                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(192,125,64,0.2)', background: '#0a0704', width: '100%', aspectRatio: '1', maxHeight: 320, position: 'relative', margin: '0 auto' }}>
                                    {preview ? (
                                        <img ref={imgRef} src={preview} alt="preview" crossOrigin="anonymous"
                                            style={{ width: `${scale}%`, height: `${scale}%`, objectFit: objectFit, objectPosition: objectPos, filter: filterStyle, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', transition: 'all 0.15s' }}
                                            onError={() => { }} />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(245,220,180,0.2)', gap: 8 }}>
                                            <span style={{ fontSize: 48 }}>🖼️</span>
                                            <span style={{ fontSize: 13 }}>No image loaded</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                {[
                                    { label: 'Zoom', val: scale, set: setScale, min: 50, max: 200 },
                                    { label: 'Brightness', val: brightness, set: setBrightness, min: 40, max: 200 },
                                    { label: 'Contrast', val: contrast, set: setContrast, min: 50, max: 200 },
                                    { label: 'Saturation', val: saturation, set: setSaturation, min: 0, max: 200 },
                                ].map(ctrl => (
                                    <div key={ctrl.label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <label style={{ ...css.lbl, marginBottom: 0, fontSize: 11 }}>{ctrl.label}</label>
                                            <span style={{ fontSize: 12, color: '#c07d40', fontWeight: 800 }}>{ctrl.val}%</span>
                                        </div>
                                        <input type="range" min={ctrl.min} max={ctrl.max} value={ctrl.val} onChange={e => ctrl.set(+e.target.value)} style={{ width: '100%', accentColor: '#c07d40', cursor: 'pointer', height: 6 }} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label style={css.lbl}>Fit Mode</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {(['cover', 'contain'] as const).map(f => (
                                        <button key={f} onClick={() => setObjectFit(f)}
                                            style={{ padding: '12px', borderRadius: 10, border: `1px solid ${objectFit === f ? '#c07d40' : 'rgba(192,125,64,0.2)'}`, background: objectFit === f ? 'rgba(192,125,64,0.18)' : 'transparent', color: objectFit === f ? '#c07d40' : 'rgba(245,220,180,0.4)', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
                                            {f === 'cover' ? '🔲 Cover' : '🔳 Contain'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={css.lbl}>Focus Point</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                                    {[['TL', 'top left'], ['TC', 'top center'], ['TR', 'top right'], ['CL', 'center left'], ['C', 'center'], ['CR', 'center right'], ['BL', 'bottom left'], ['BC', 'bottom center'], ['BR', 'bottom right']].map(([abbr, pos]) => (
                                        <button key={pos} onClick={() => setObjectPos(pos)}
                                            style={{ padding: '10px 4px', borderRadius: 8, border: `1px solid ${objectPos === pos ? '#c07d40' : 'rgba(192,125,64,0.12)'}`, background: objectPos === pos ? 'rgba(192,125,64,0.22)' : 'rgba(255,255,255,0.02)', color: objectPos === pos ? '#c07d40' : 'rgba(245,220,180,0.35)', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', fontWeight: 700 }}>
                                            {abbr}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => { setScale(100); setBrightness(100); setContrast(100); setSaturation(100); setObjectFit('cover'); setObjectPos('center') }}
                                style={{ ...css.ghost, fontSize: 12, padding: '10px', textAlign: 'center', width: '100%' }}>↺ Reset All</button>
                        </div>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(192,125,64,0.1)', flexWrap: 'wrap' }}>
                        <button onClick={applyAndSave} disabled={!preview} style={{ ...css.btn, opacity: preview ? 1 : 0.4, cursor: preview ? 'pointer' : 'default' }}>✓ Apply Image</button>
                        {preview && <button onClick={() => { setPreview(''); setFile(null); setUrlInput('') }} style={css.danger}>🗑 Remove Image</button>}
                        <button onClick={onClose} style={{ ...css.ghost, marginLeft: 'auto' }}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Menu Tab ────────────────────────────────────────────────────
type MenuForm = Omit<MenuItem, 'id'>
const emptyForm: MenuForm = { name: '', nameAr: '', cat: '', price: 0, emoji: '☕', desc: '', descAr: '', avail: true, calories: 0, imageUrl: '', sortOrder: 0, sizesJson: '' }

function MenuTab() {
    const [menu, setMenu] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [form, setForm] = useState<MenuForm>({ ...emptyForm })
    const [editingId, setEditingId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [filterCat, setFilterCat] = useState('all')
    const [search, setSearch] = useState('')
    const [formOpen, setFormOpen] = useState(false)
    const [imageEditorOpen, setImageEditorOpen] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => { reload() }, [])

    async function reload() {
        try {
            const [m, c] = await Promise.all([api.getMenu(), api.getCategories()])
            setMenu(m); setCategories(c)
            if (c.length > 0) setForm(f => ({ ...f, cat: f.cat || c[0].key }))
        } catch { }
    }

    function flash(msg: string) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 2500) }

    async function save() {
        setSaving(true)
        try {
            let finalImageUrl = form.imageUrl
            if (imageFile) finalImageUrl = await api.uploadMenuImage(imageFile)
            if (finalImageUrl?.startsWith('data:image/')) finalImageUrl = ''
            const payload: MenuForm = { ...form, imageUrl: finalImageUrl }
            if (editingId) await api.updateMenuItem(editingId, payload)
            else await api.createMenuItem(payload)
            flash(editingId ? 'Item updated!' : 'Item created!')
            setForm({ ...emptyForm }); setEditingId(null); setImageFile(null); setImagePreview(''); setFormOpen(false)
            await reload()
        } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    async function deleteItem(id: number) {
        if (!confirm('Delete this item?')) return
        await api.deleteMenuItem(id); await reload()
    }

    async function toggleAvail(item: MenuItem) {
        await api.updateMenuItem(item.id, { ...item, avail: !item.avail }); await reload()
    }

    function startEdit(item: MenuItem) {
        setEditingId(item.id)
        setForm({ name: item.name, nameAr: item.nameAr, cat: item.cat, price: item.price, emoji: item.emoji, desc: item.desc, descAr: item.descAr, avail: item.avail, calories: item.calories, imageUrl: item.imageUrl, sortOrder: item.sortOrder, sizesJson: item.sizesJson ?? '' })
        setImageFile(null); setImagePreview(''); setFormOpen(true)
    }

    function cancelEdit() {
        setEditingId(null); setForm({ ...emptyForm }); setImageFile(null); setImagePreview(''); setFormOpen(false)
    }

    const filteredMenu = menu.filter(item =>
        (filterCat === 'all' || item.cat === filterCat) &&
        (`${item.name} ${item.nameAr}`).toLowerCase().includes(search.toLowerCase())
    )

    const sizes: ItemSizeOption[] = (() => { try { return form.sizesJson ? JSON.parse(form.sizesJson) as ItemSizeOption[] : [] } catch { return [] } })()
    const setSizes = (next: ItemSizeOption[]) => setForm({ ...form, sizesJson: next.length ? JSON.stringify(next) : '' })
    const currentImageUrl = imagePreview || (form.imageUrl ? getImageUrl(form.imageUrl) : '')

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {successMsg && <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontWeight: 700, fontSize: 13 }}>✓ {successMsg}</div>}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2, scrollbarWidth: 'none' }}>
                    {[{ key: 'all', name: 'All' }, ...categories.map(c => ({ key: c.key, name: c.name }))].map(c => (
                        <button key={c.key} onClick={() => setFilterCat(c.key)}
                            style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${filterCat === c.key ? '#c07d40' : 'rgba(192,125,64,0.2)'}`, background: filterCat === c.key ? 'rgba(192,125,64,0.18)' : 'transparent', color: filterCat === c.key ? '#c07d40' : 'rgba(245,220,180,0.4)', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {c.name} ({c.key === 'all' ? menu.length : menu.filter(m => m.cat === c.key).length})
                        </button>
                    ))}
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." style={{ ...css.inp, maxWidth: 180, flex: '0 0 auto' }} />
                <button onClick={() => { setFormOpen(true); if (editingId) cancelEdit() }} style={css.btn}>+ Add Item</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                    { label: 'Total', val: menu.length, color: '#c07d40' },
                    { label: 'Available', val: menu.filter(m => m.avail).length, color: '#4ade80' },
                    { label: 'Hidden', val: menu.filter(m => !m.avail).length, color: '#f87171' },
                    { label: 'With Image', val: menu.filter(m => m.imageUrl).length, color: '#60a5fa' },
                ].map(s => (
                    <div key={s.label} style={{ padding: '8px 14px', borderRadius: 10, background: '#13100c', border: '1px solid rgba(192,125,64,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, fontSize: 20, color: s.color }}>{s.val}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,220,180,0.4)' }}>{s.label}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredMenu.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(245,220,180,0.25)' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
                        <div style={{ fontWeight: 600 }}>No items found</div>
                    </div>
                )}
                {filteredMenu.map(item => {
                    const imgUrl = getImageUrl(item.imageUrl)
                    const isEditing = editingId === item.id
                    const itemSizes = parseItemSizes(item)
                    return (
                        <div key={item.id} style={{ borderRadius: 14, background: '#13100c', border: `1px solid ${isEditing ? 'rgba(192,125,64,0.5)' : 'rgba(192,125,64,0.12)'}`, padding: 'clamp(10px,2vw,14px)', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' }}>
                            <div title="Click to change image" onClick={() => { startEdit(item); setTimeout(() => setImageEditorOpen(true), 30) }}
                                style={{ width: 58, height: 58, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(192,125,64,0.15)', background: '#0a0704', display: 'grid', placeItems: 'center', flexShrink: 0, cursor: 'pointer', position: 'relative' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(192,125,64,0.5)'; const o = e.currentTarget.querySelector('.img-overlay') as HTMLDivElement; if (o) { o.style.opacity = '1'; o.style.background = 'rgba(0,0,0,0.55)' } }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(192,125,64,0.15)'; const o = e.currentTarget.querySelector('.img-overlay') as HTMLDivElement; if (o) { o.style.opacity = '0'; o.style.background = 'rgba(0,0,0,0)' } }}>
                                {imgUrl ? <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} /> : <span style={{ fontSize: 22 }}>{item.emoji}</span>}
                                <div className="img-overlay" style={{ position: 'absolute', inset: 0, opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.15s', pointerEvents: 'none' }}>📷</div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                                    <span style={{ fontWeight: 800, fontSize: 14, color: '#f5e0c0' }}>{item.emoji} {item.name}</span>
                                    {item.nameAr && <span style={{ fontSize: 11, color: 'rgba(245,220,180,0.35)', direction: 'rtl' }}>{item.nameAr}</span>}
                                    <span style={{ padding: '2px 7px', borderRadius: 999, background: 'rgba(192,125,64,0.08)', fontSize: 9, color: 'rgba(192,125,64,0.6)', fontWeight: 700, border: '1px solid rgba(192,125,64,0.12)' }}>{item.cat}</span>
                                    <span style={{ padding: '2px 7px', borderRadius: 999, background: item.avail ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.07)', fontSize: 9, color: item.avail ? '#4ade80' : '#f87171', fontWeight: 800, border: `1px solid ${item.avail ? 'rgba(74,222,128,0.18)' : 'rgba(239,68,68,0.18)'}` }}>{item.avail ? '● On' : '○ Off'}</span>
                                    {itemSizes.length > 0 && <span style={{ padding: '2px 7px', borderRadius: 999, background: 'rgba(96,165,250,0.08)', fontSize: 9, color: '#60a5fa', fontWeight: 700, border: '1px solid rgba(96,165,250,0.18)' }}>{itemSizes.length} sizes</span>}
                                    {item.imageUrl && <span style={{ padding: '2px 7px', borderRadius: 999, background: 'rgba(168,85,247,0.08)', fontSize: 9, color: '#c084fc', fontWeight: 700, border: '1px solid rgba(168,85,247,0.18)' }}>📷 img</span>}
                                </div>
                                {item.desc && <div style={{ fontSize: 12, color: 'rgba(245,220,180,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 900, color: '#c07d40' }}>SAR {item.price.toFixed(2)}</span>
                                <div style={{ display: 'flex', gap: 5 }}>
                                    <button onClick={() => toggleAvail(item)} style={{ ...css.ghost, padding: '4px 9px', fontSize: 10, borderColor: item.avail ? 'rgba(74,222,128,0.3)' : undefined, color: item.avail ? '#4ade80' : undefined }}>{item.avail ? 'On' : 'Off'}</button>
                                    <button onClick={() => startEdit(item)} style={{ ...css.ghost, padding: '4px 9px', fontSize: 10, background: isEditing ? 'rgba(192,125,64,0.18)' : 'transparent' }}>✏️ Edit</button>
                                    <button onClick={() => deleteItem(item.id)} style={{ ...css.danger, padding: '4px 9px', fontSize: 10 }}>🗑</button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {imageEditorOpen && (
                <ImageEditorModal currentUrl={currentImageUrl}
                    onSave={(f, previewUrl) => {
                        setImageFile(f)
                        if (previewUrl.startsWith('http')) { setImagePreview(''); setForm(prev => ({ ...prev, imageUrl: previewUrl })) }
                        else { setImagePreview(previewUrl) }
                        setImageEditorOpen(false)
                    }}
                    onClose={() => setImageEditorOpen(false)} />
            )}

            {formOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: 'clamp(12px,3vw,32px) clamp(12px,3vw,20px)' } as React.CSSProperties} onClick={cancelEdit}>
                    <div onClick={e => e.stopPropagation()} style={{ background: '#13100c', borderRadius: 20, border: `2px solid ${editingId ? 'rgba(192,125,64,0.4)' : 'rgba(192,125,64,0.18)'}`, width: '100%', maxWidth: 560, margin: '0 auto', boxShadow: '0 24px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
                        <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#13100c', borderBottom: '1px solid rgba(192,125,64,0.12)', padding: 'clamp(14px,3vw,22px) clamp(16px,4vw,28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 900, color: '#f5e0c0', margin: 0 }}>{editingId ? '✏️ Edit Item' : '➕ New Menu Item'}</h3>
                            <button onClick={cancelEdit} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(192,125,64,0.22)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#c07d40', fontSize: 16, display: 'grid', placeItems: 'center', flexShrink: 0 }}>✕</button>
                        </div>
                        <div style={{ padding: 'clamp(16px,3vw,28px)', display: 'flex', flexDirection: 'column', gap: 13 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 12 }}>
                                <div><label style={css.lbl}>Emoji</label><input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} style={{ ...css.inp, textAlign: 'center', fontSize: 22, padding: '8px' }} /></div>
                                <div>
                                    <label style={css.lbl}>Category</label>
                                    <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} style={{ ...css.inp, cursor: 'pointer' }}>
                                        <option value="">— Select category —</option>
                                        {categories.map(c => <option key={c.id} value={c.key}>{c.name}</option>)}
                                        {categories.length === 0 && <><option value="hot">Hot Coffee</option><option value="cold">Cold Drinks</option><option value="tea">Tea</option><option value="food">Food</option></>}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={css.lbl}>Name (EN)</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Cappuccino" style={css.inp} /></div>
                                <div><label style={css.lbl}>Name (AR)</label><input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} placeholder="كابتشينو" style={{ ...css.inp, direction: 'rtl' }} /></div>
                            </div>
                            <div><label style={css.lbl}>Description (EN)</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Rich espresso with steamed milk..." rows={2} style={{ ...css.inp, resize: 'none' }} /></div>
                            <div><label style={css.lbl}>Description (AR)</label><textarea value={form.descAr} onChange={e => setForm({ ...form, descAr: e.target.value })} placeholder="إسبريسو غني..." rows={2} style={{ ...css.inp, resize: 'none', direction: 'rtl' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label style={css.lbl}>Price (SAR)</label><input type="number" min="0" step="0.5" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} style={css.inp} /></div>
                                <div><label style={css.lbl}>Calories</label><input type="number" min="0" value={form.calories} onChange={e => setForm({ ...form, calories: +e.target.value })} style={css.inp} /></div>
                            </div>
                            <div style={{ borderRadius: 14, border: '1px solid rgba(192,125,64,0.22)', background: 'rgba(192,125,64,0.03)', padding: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: currentImageUrl ? 12 : 0 }}>
                                    <div>
                                        <label style={{ ...css.lbl, marginBottom: 2 }}>📷 Product Image</label>
                                        <p style={{ fontSize: 11, color: 'rgba(245,220,180,0.25)', margin: 0 }}>Upload, paste a URL, or adjust brightness/contrast</p>
                                    </div>
                                    <button type="button" onClick={() => setImageEditorOpen(true)} style={{ ...css.btn, fontSize: 12, padding: '8px 16px', flexShrink: 0 }}>{currentImageUrl ? '✏️ Edit Image' : '+ Add Image'}</button>
                                </div>
                                {currentImageUrl ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
                                        <div onClick={() => setImageEditorOpen(true)} style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(192,125,64,0.25)', background: '#0a0704', flexShrink: 0, cursor: 'pointer', position: 'relative' }}>
                                            <img src={currentImageUrl} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, marginBottom: 3 }}>✓ Image ready</div>
                                            <div style={{ fontSize: 11, color: 'rgba(245,220,180,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imageFile ? `📁 ${imageFile.name}` : (form.imageUrl || 'Remote URL')}</div>
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setForm(prev => ({ ...prev, imageUrl: '' })) }} style={{ ...css.danger, padding: '4px 10px', fontSize: 10, marginTop: 6 }}>🗑 Remove</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(245,220,180,0.2)', fontSize: 12, marginTop: 10 }}>
                                        <div style={{ fontSize: 26, marginBottom: 5 }}>🖼️</div>No image set — click "Add Image" above
                                    </div>
                                )}
                            </div>
                            <div style={{ borderRadius: 12, background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.16)', padding: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <div style={{ fontWeight: 800, fontSize: 12, color: '#60a5fa' }}>☕ Size Options <span style={{ fontWeight: 400, fontSize: 11, color: 'rgba(96,165,250,0.5)' }}>(optional)</span></div>
                                    <button type="button" onClick={() => { const used = sizes.map(s => s.key); const next = ['S', 'M', 'L', 'XL'].find(k => !used.includes(k)) ?? `S${sizes.length + 1}`; setSizes([...sizes, { key: next, label: next === 'S' ? 'Small' : next === 'M' ? 'Medium' : next === 'L' ? 'Large' : next, labelAr: '', price: form.price, active: true, isDefault: sizes.length === 0 }]) }} style={{ padding: '5px 12px', borderRadius: 999, background: '#60a5fa', color: 'white', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
                                </div>
                                {sizes.length === 0
                                    ? <div style={{ color: 'rgba(96,165,250,0.4)', fontSize: 12, textAlign: 'center', padding: '4px 0' }}>No sizes — single price: SAR {form.price.toFixed(2)}</div>
                                    : sizes.map((sz, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 32px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                                            <input value={sz.key} onChange={e => setSizes(sizes.map((s, j) => j === i ? { ...s, key: e.target.value.toUpperCase().slice(0, 3) } : s))} maxLength={3} style={{ ...css.inp, textAlign: 'center', fontWeight: 900, fontSize: 12, color: '#60a5fa', padding: '6px 4px' }} />
                                            <input value={sz.label} onChange={e => setSizes(sizes.map((s, j) => j === i ? { ...s, label: e.target.value } : s))} placeholder="Small" style={{ ...css.inp, fontSize: 12, padding: '6px 8px' }} />
                                            <input type="number" min="0" step="0.5" value={sz.price} onChange={e => setSizes(sizes.map((s, j) => j === i ? { ...s, price: +e.target.value } : s))} style={{ ...css.inp, fontWeight: 800, fontSize: 12, padding: '6px', textAlign: 'center' }} />
                                            <button type="button" onClick={() => setSizes(sizes.filter((_, j) => j !== i))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center' }}>×</button>
                                        </div>
                                    ))}
                            </div>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#f5e0c0' }}>
                                    <input type="checkbox" checked={form.avail} onChange={e => setForm({ ...form, avail: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#c07d40', cursor: 'pointer' }} />
                                    Available for ordering
                                </label>
                                <div style={{ flex: 1, minWidth: 100 }}><label style={css.lbl}>Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} style={css.inp} /></div>
                            </div>
                        </div>
                        <div style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#13100c', borderTop: '1px solid rgba(192,125,64,0.1)', padding: 'clamp(12px,2vw,18px) clamp(16px,4vw,28px)', display: 'flex', gap: 10 }}>
                            <button onClick={save} disabled={saving || !form.name} style={{ flex: 1, padding: '13px', borderRadius: 999, border: 'none', background: form.name ? 'linear-gradient(135deg,#c07d40,#8b4f1c)' : 'rgba(255,255,255,0.04)', color: form.name ? 'white' : 'rgba(245,220,180,0.2)', fontWeight: 800, cursor: form.name ? 'pointer' : 'default', fontSize: 15, fontFamily: 'inherit', boxShadow: form.name ? '0 4px 18px rgba(192,125,64,0.32)' : 'none', transition: 'all 0.2s' }}>
                                {saving ? '⏳ Saving...' : editingId ? '✓ Update Item' : '✓ Create Item'}
                            </button>
                            <button onClick={cancelEdit} style={{ ...css.ghost, padding: '13px 20px', fontSize: 14 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Categories ──────────────────────────────────────────────────
function CategoriesTab() {
    const [cats, setCats] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const blank = { key: '', name: '', nameAr: '', sortOrder: 0, active: true }
    const [form, setForm] = useState({ ...blank })
    const [editForm, setEditForm] = useState<Omit<Category, 'id'>>({ ...blank })

    const load = async () => { setLoading(true); try { setCats(await api.getCategories()) } catch { } finally { setLoading(false) } }
    useEffect(() => { load() }, [])

    async function create() {
        if (!form.key.trim() || !form.name.trim()) return
        setSaving(true)
        try { await api.createCategory(form); setForm({ ...blank }); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    async function saveEdit(id: number) {
        setSaving(true)
        try { await api.updateCategory(id, editForm); setEditId(null); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    async function remove(cat: Category) {
        if (!confirm(`Delete category "${cat.name}"? This may affect menu items.`)) return
        try { await api.deleteCategory(cat.id); load() } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={css.card}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 18px' }}>➕ Add Category</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 14 }}>
                    <div><label style={css.lbl}>Key (slug)</label><input value={form.key} onChange={e => setForm({ ...form, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="hot_drinks" style={css.inp} /></div>
                    <div><label style={css.lbl}>Name (EN)</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Hot Drinks" style={css.inp} /></div>
                    <div><label style={css.lbl}>Name (AR)</label><input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} placeholder="مشروبات ساخنة" style={{ ...css.inp, direction: 'rtl' }} /></div>
                    <div><label style={css.lbl}>Sort Order</label><input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} min={0} style={css.inp} /></div>
                </div>
                <button onClick={create} disabled={saving} style={css.btn}>{saving ? '⏳ Saving...' : '✓ Add Category'}</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'rgba(245,220,180,0.3)' }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cats.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(245,220,180,0.25)' }}>No categories yet.</div>}
                    {[...cats].sort((a, b) => a.sortOrder - b.sortOrder).map(cat => (
                        <div key={cat.id} style={{ ...css.card, padding: 'clamp(12px,2vw,18px)' }}>
                            {editId === cat.id ? (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 12 }}>
                                        <div><label style={css.lbl}>Key</label><input value={editForm.key} onChange={e => setEditForm({ ...editForm, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} style={{ ...css.inp, fontSize: 13, padding: '8px 10px' }} /></div>
                                        <div><label style={css.lbl}>Name (EN)</label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ ...css.inp, fontSize: 13, padding: '8px 10px' }} /></div>
                                        <div><label style={css.lbl}>Name (AR)</label><input value={editForm.nameAr} onChange={e => setEditForm({ ...editForm, nameAr: e.target.value })} style={{ ...css.inp, fontSize: 13, padding: '8px 10px', direction: 'rtl' }} /></div>
                                        <div><label style={css.lbl}>Sort</label><input type="number" value={editForm.sortOrder} onChange={e => setEditForm({ ...editForm, sortOrder: +e.target.value })} min={0} style={{ ...css.inp, fontSize: 13, padding: '8px 10px' }} /></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        <button onClick={() => saveEdit(cat.id)} disabled={saving} style={css.btn}>{saving ? '⏳' : '💾 Save'}</button>
                                        <button onClick={() => setEditId(null)} style={css.ghost}>Cancel</button>
                                        <button onClick={() => setEditForm(f => ({ ...f, active: !f.active }))} style={{ ...css.ghost, borderColor: editForm.active ? 'rgba(74,222,128,0.4)' : undefined, color: editForm.active ? '#4ade80' : undefined }}>{editForm.active ? '✓ Active' : '✗ Inactive'}</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', minWidth: 0 }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(192,125,64,0.12)', border: '1px solid rgba(192,125,64,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#c07d40', flexShrink: 0 }}>{cat.sortOrder}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15, color: '#f5e0c0' }}>{cat.name}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(245,220,180,0.4)', marginTop: 2, display: 'flex', gap: 10 }}>
                                                <span>🔑 {cat.key}</span>
                                                {cat.nameAr && <span style={{ direction: 'rtl' }}>AR: {cat.nameAr}</span>}
                                            </div>
                                        </div>
                                        <span style={{ padding: '3px 10px', borderRadius: 999, background: cat.active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: cat.active ? '#4ade80' : 'rgba(245,220,180,0.3)', fontSize: 10, fontWeight: 700 }}>{cat.active ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                        <button onClick={() => { setEditId(cat.id); setEditForm({ key: cat.key, name: cat.name, nameAr: cat.nameAr, sortOrder: cat.sortOrder, active: cat.active }) }} style={css.ghost}>✏️ Edit</button>
                                        <button onClick={() => remove(cat)} style={css.danger}>🗑</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Promo ───────────────────────────────────────────────────────
function PromoTab() {
    const [promos, setPromos] = useState<PromoCode[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ code: '', discountPercent: 10, active: true, maxUses: 0, expiresAt: '' })
    const [saving, setSaving] = useState(false)

    const load = async () => { setLoading(true); try { setPromos(await api.getPromoCodes()) } catch { } finally { setLoading(false) } }
    useEffect(() => { load() }, [])

    async function create() {
        if (!form.code.trim()) return
        setSaving(true)
        try { await api.createPromoCode({ ...form, expiresAt: form.expiresAt || null }); setForm({ code: '', discountPercent: 10, active: true, maxUses: 0, expiresAt: '' }); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={css.card}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 18px' }}>➕ Create Promo Code</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 14 }}>
                    <div><label style={css.lbl}>Code</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" style={css.inp} /></div>
                    <div><label style={css.lbl}>Discount %</label><input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: +e.target.value })} min={1} max={100} style={css.inp} /></div>
                    <div><label style={css.lbl}>Max Uses (0=∞)</label><input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: +e.target.value })} min={0} style={css.inp} /></div>
                    <div><label style={css.lbl}>Expires (optional)</label><input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} style={css.inp} /></div>
                </div>
                <button onClick={create} disabled={saving} style={css.btn}>{saving ? '⏳ Saving...' : '✓ Create Code'}</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'rgba(245,220,180,0.3)' }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {promos.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(245,220,180,0.25)' }}>No promo codes yet.</div>}
                    {promos.map(p => (
                        <div key={p.id} style={{ ...css.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 'clamp(12px,2vw,18px) clamp(14px,2.5vw,22px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 900, color: '#c07d40', letterSpacing: '0.06em' }}>{p.code}</span>
                                <span style={{ padding: '3px 10px', borderRadius: 999, background: p.active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: p.active ? '#4ade80' : 'rgba(245,220,180,0.3)', fontSize: 10, fontWeight: 700 }}>{p.active ? 'Active' : 'Inactive'}</span>
                                <span style={{ fontSize: 12, color: 'rgba(245,220,180,0.5)' }}>{p.discountPercent}% off</span>
                                <span style={{ fontSize: 11, color: 'rgba(245,220,180,0.3)' }}>Used: {p.useCount}{p.maxUses > 0 ? `/${p.maxUses}` : ''}</span>
                                {p.expiresAt && <span style={{ fontSize: 11, color: 'rgba(245,220,180,0.3)' }}>Expires: {new Date(p.expiresAt).toLocaleDateString()}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button onClick={async () => { await api.togglePromoCode(p.id); load() }} style={css.ghost}>{p.active ? 'Disable' : 'Enable'}</button>
                                <button onClick={async () => { if (confirm(`Delete ${p.code}?`)) { await api.deletePromoCode(p.id); load() } }} style={css.danger}>🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Offers ──────────────────────────────────────────────────────
function OffersTab() {
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ title: '', titleAr: '', subtitle: '', subtitleAr: '', emoji: '🎉', bgColor: '#c07d40', ctaLabel: 'Order Now', ctaLink: '/menu-order', active: true, sortOrder: 0 })
    const [saving, setSaving] = useState(false)

    const load = async () => { setLoading(true); try { setOffers(await api.getAllOffers()) } catch { } finally { setLoading(false) } }
    useEffect(() => { load() }, [])

    async function create() {
        if (!form.title.trim()) return
        setSaving(true)
        try { await api.createOffer(form); setForm({ title: '', titleAr: '', subtitle: '', subtitleAr: '', emoji: '🎉', bgColor: '#c07d40', ctaLabel: 'Order Now', ctaLink: '/menu-order', active: true, sortOrder: 0 }); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={css.card}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 18px' }}>➕ New Offer Banner</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 14 }}>
                    <div><label style={css.lbl}>Title (EN)</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Happy Hour Deal" style={css.inp} /></div>
                    <div><label style={css.lbl}>Title (AR)</label><input value={form.titleAr} onChange={e => setForm({ ...form, titleAr: e.target.value })} placeholder="عرض اليوم" style={{ ...css.inp, direction: 'rtl' }} /></div>
                    <div><label style={css.lbl}>Subtitle (EN)</label><input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="20% off all drinks" style={css.inp} /></div>
                    <div><label style={css.lbl}>Subtitle (AR)</label><input value={form.subtitleAr} onChange={e => setForm({ ...form, subtitleAr: e.target.value })} placeholder="خصم ٢٠٪" style={{ ...css.inp, direction: 'rtl' }} /></div>
                    <div><label style={css.lbl}>Emoji</label><input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} style={{ ...css.inp, fontSize: 22, textAlign: 'center' }} /></div>
                    <div><label style={css.lbl}>Color</label><input type="color" value={form.bgColor} onChange={e => setForm({ ...form, bgColor: e.target.value })} style={{ ...css.inp, height: 43, padding: 6, cursor: 'pointer' }} /></div>
                </div>
                <button onClick={create} disabled={saving} style={css.btn}>{saving ? '⏳ Saving...' : '✓ Create Offer'}</button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'rgba(245,220,180,0.3)' }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {offers.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(245,220,180,0.25)' }}>No offers yet.</div>}
                    {offers.map(o => (
                        <div key={o.id} style={{ ...css.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: 'clamp(12px,2vw,18px) clamp(14px,2.5vw,22px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${o.bgColor}22`, border: `1px solid ${o.bgColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{o.emoji}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#f5e0c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(245,220,180,0.4)', marginTop: 2 }}>{o.subtitle}</div>
                                </div>
                                <span style={{ padding: '3px 10px', borderRadius: 999, background: o.active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)', color: o.active ? '#4ade80' : 'rgba(245,220,180,0.3)', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{o.active ? 'Active' : 'Inactive'}</span>
                            </div>
                            <button onClick={async () => { if (confirm(`Delete "${o.title}"?`)) { await api.deleteOffer(o.id); load() } }} style={{ ...css.danger, flexShrink: 0 }}>🗑 Delete</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Users ───────────────────────────────────────────────────────
const ROLES = [
    { key: 'admin', label: 'Admin', desc: 'Full access to everything', color: '#c07d40', bg: 'rgba(192,125,64,0.12)', icon: '👑' },
    { key: 'manager', label: 'Manager', desc: 'Menu, orders, promos, offers', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '🧑‍💼' },
    { key: 'salesman', label: 'Salesman', desc: 'Manual orders & order tracking only', color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: '🧾' },
    { key: 'kitchen', label: 'Kitchen', desc: 'Kitchen view & status updates only', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', icon: '👨‍🍳' },
    { key: 'cashier', label: 'Cashier', desc: 'Process orders & payments', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: '💰' },
]
function getRoleMeta(key: string) { return ROLES.find(r => r.key === key) ?? { key, label: key, desc: '', color: '#c07d40', bg: 'rgba(192,125,64,0.1)', icon: '👤' } }
const blankUser: Omit<StaffAccount, 'id'> = { name: '', username: '', password: '', role: 'salesman', active: true }

function UsersTab() {
    const [staff, setStaff] = useState<StaffAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<Omit<StaffAccount, 'id'>>({ ...blankUser })
    const [editId, setEditId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState<Omit<StaffAccount, 'id'>>({ ...blankUser })
    const [showPass, setShowPass] = useState(false)
    const [showEditPass, setShowEditPass] = useState(false)
    const [search, setSearch] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [successMsg, setSuccessMsg] = useState('')

    const load = async () => { setLoading(true); try { setStaff(await api.getStaffAccounts()) } catch { } finally { setLoading(false) } }
    useEffect(() => { load() }, [])

    function flash(msg: string) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 2500) }

    async function create() {
        if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return
        setSaving(true)
        try { await api.createStaffAccount(form); setForm({ ...blankUser }); flash('Account created!'); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    async function saveEdit(id: number) {
        setSaving(true)
        try { await api.updateStaffAccount(id, editForm); setEditId(null); flash('Account updated!'); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    async function remove(s: StaffAccount) {
        if (!confirm(`Delete account "${s.name}" (@${s.username})?`)) return
        try { await api.deleteStaffAccount(s.id); load() } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    }

    async function toggleActive(s: StaffAccount) {
        try { await api.updateStaffAccount(s.id, { ...s, active: !s.active }); load() }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
    }

    function startEdit(s: StaffAccount) {
        setEditId(s.id)
        setEditForm({ name: s.name, username: s.username, password: '', role: s.role, active: s.active })
        setShowEditPass(false)
    }

    const filtered = staff.filter(s =>
        (filterRole === 'all' || s.role === filterRole) &&
        (`${s.name} ${s.username} ${s.role}`).toLowerCase().includes(search.toLowerCase())
    )
    const roleCounts = ROLES.reduce((acc, r) => { acc[r.key] = staff.filter(s => s.role === r.key).length; return acc }, {} as Record<string, number>)
    const RoleSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...css.inp, cursor: 'pointer' }}>
            {ROLES.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
        </select>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {successMsg && <div style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontWeight: 700, fontSize: 13 }}>✓ {successMsg}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 8 }}>
                {ROLES.map(r => (
                    <div key={r.key} style={{ borderRadius: 12, background: r.bg, border: `1px solid ${r.color}30`, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{r.icon}</span>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 12, color: r.color, letterSpacing: '0.04em' }}>{r.label}{roleCounts[r.key] > 0 && <span style={{ marginLeft: 6, padding: '1px 6px', background: `${r.color}22`, borderRadius: 999, fontSize: 9 }}>{roleCounts[r.key]}</span>}</div>
                            <div style={{ fontSize: 10, color: 'rgba(245,220,180,0.3)', marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={css.card}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 18px' }}>➕ Add Staff Account</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 14 }}>
                    <div><label style={css.lbl}>Full Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Sara Ahmed" style={css.inp} /></div>
                    <div><label style={css.lbl}>Username</label><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, '') })} placeholder="sara.ahmed" style={css.inp} /></div>
                    <div>
                        <label style={css.lbl}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={{ ...css.inp, paddingRight: 40 }} />
                            <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(192,125,64,0.5)', fontSize: 14, padding: 2 }}>{showPass ? '🙈' : '👁'}</button>
                        </div>
                    </div>
                    <div><label style={css.lbl}>Role</label><RoleSelect value={form.role} onChange={v => setForm({ ...form, role: v })} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={create} disabled={saving || !form.name || !form.username || !form.password} style={{ ...css.btn, opacity: (form.name && form.username && form.password) ? 1 : 0.45 }}>{saving ? '⏳ Creating...' : '✓ Create Account'}</button>
                    {form.role && (() => { const r = getRoleMeta(form.role); return <span style={{ fontSize: 11, color: r.color, fontWeight: 700, padding: '5px 12px', background: r.bg, borderRadius: 999, border: `1px solid ${r.color}30` }}>{r.icon} {r.label} — {r.desc}</span> })()}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                    <button onClick={() => setFilterRole('all')} style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${filterRole === 'all' ? '#c07d40' : 'rgba(192,125,64,0.2)'}`, background: filterRole === 'all' ? 'rgba(192,125,64,0.18)' : 'transparent', color: filterRole === 'all' ? '#c07d40' : 'rgba(245,220,180,0.4)', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>All ({staff.length})</button>
                    {ROLES.filter(r => roleCounts[r.key] > 0).map(r => (
                        <button key={r.key} onClick={() => setFilterRole(r.key)} style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${filterRole === r.key ? r.color : 'rgba(192,125,64,0.15)'}`, background: filterRole === r.key ? r.bg : 'transparent', color: filterRole === r.key ? r.color : 'rgba(245,220,180,0.35)', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{r.icon} {r.label} ({roleCounts[r.key]})</button>
                    ))}
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." style={{ ...css.inp, maxWidth: 180, flex: '0 0 auto' }} />
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: 48, color: 'rgba(245,220,180,0.25)' }}>Loading...</div> : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(245,220,180,0.25)' }}><div style={{ fontSize: 36, marginBottom: 10 }}>👥</div><div style={{ fontWeight: 600 }}>No accounts found</div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(s => {
                        const role = getRoleMeta(s.role)
                        const isEditing = editId === s.id
                        return (
                            <div key={s.id} style={{ borderRadius: 14, background: '#13100c', border: `1px solid ${isEditing ? 'rgba(192,125,64,0.4)' : 'rgba(192,125,64,0.1)'}`, padding: 'clamp(12px,2vw,18px)', transition: 'border-color 0.2s' }}>
                                {isEditing ? (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 900, color: '#f5e0c0' }}>✏️ Editing @{s.username}</span>
                                            <button onClick={() => setEditId(null)} style={{ ...css.ghost, padding: '4px 12px', fontSize: 11 }}>Cancel</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 12 }}>
                                            <div><label style={css.lbl}>Full Name</label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ ...css.inp, fontSize: 13 }} /></div>
                                            <div><label style={css.lbl}>Username</label><input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })} style={{ ...css.inp, fontSize: 13 }} /></div>
                                            <div>
                                                <label style={css.lbl}>New Password <span style={{ color: 'rgba(245,220,180,0.25)', fontSize: 9 }}>(leave blank to keep)</span></label>
                                                <div style={{ position: 'relative' }}>
                                                    <input type={showEditPass ? 'text' : 'password'} value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} placeholder="••••••••" style={{ ...css.inp, fontSize: 13, paddingRight: 38 }} />
                                                    <button onClick={() => setShowEditPass(p => !p)} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(192,125,64,0.45)', fontSize: 13 }}>{showEditPass ? '🙈' : '👁'}</button>
                                                </div>
                                            </div>
                                            <div><label style={css.lbl}>Role</label><RoleSelect value={editForm.role} onChange={v => setEditForm({ ...editForm, role: v })} /></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <button onClick={() => saveEdit(s.id)} disabled={saving} style={css.btn}>{saving ? '⏳' : '💾 Save Changes'}</button>
                                            <button onClick={() => setEditForm(f => ({ ...f, active: !f.active }))} style={{ ...css.ghost, borderColor: editForm.active ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.3)', color: editForm.active ? '#4ade80' : '#f87171' }}>{editForm.active ? '✓ Active' : '✗ Inactive'}</button>
                                            {editForm.role && (() => { const r = getRoleMeta(editForm.role); return <span style={{ fontSize: 10, color: r.color, padding: '4px 10px', background: r.bg, borderRadius: 999 }}>{r.icon} {r.label}</span> })()}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flexWrap: 'wrap' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: role.bg, border: `1px solid ${role.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{role.icon}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <span style={{ fontWeight: 800, fontSize: 14, color: '#f5e0c0' }}>{s.name}</span>
                                                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(245,220,180,0.35)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6 }}>@{s.username}</span>
                                                    <span style={{ padding: '2px 9px', borderRadius: 999, background: role.bg, color: role.color, fontSize: 9, fontWeight: 800, border: `1px solid ${role.color}30`, letterSpacing: '0.06em' }}>{role.icon} {role.label.toUpperCase()}</span>
                                                    <span style={{ padding: '2px 8px', borderRadius: 999, background: s.active ? 'rgba(74,222,128,0.08)' : 'rgba(239,68,68,0.07)', color: s.active ? '#4ade80' : '#f87171', fontSize: 9, fontWeight: 800, border: `1px solid ${s.active ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.18)'}` }}>{s.active ? '● Active' : '○ Inactive'}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: 'rgba(245,220,180,0.25)', marginTop: 3 }}>{role.desc}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap' }}>
                                            <button onClick={() => toggleActive(s)} style={{ ...css.ghost, padding: '5px 11px', fontSize: 10, borderColor: s.active ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.25)', color: s.active ? '#4ade80' : '#f87171' }}>{s.active ? 'Disable' : 'Enable'}</button>
                                            <button onClick={() => startEdit(s)} style={{ ...css.ghost, padding: '5px 11px', fontSize: 10 }}>✏️ Edit</button>
                                            <button onClick={() => remove(s)} style={{ ...css.danger, padding: '5px 11px', fontSize: 10 }}>🗑</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ─── Settings ────────────────────────────────────────────────────
function SettingsTab() {
    const [settings, setSettings] = useState<AppSetting | null>(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => { api.getSettings().then(setSettings).catch(() => { }) }, [])

    async function save() {
        if (!settings) return
        setSaving(true)
        try { await api.updateSettings(settings); setSaved(true); setTimeout(() => setSaved(false), 2500) }
        catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSaving(false) }
    }

    if (!settings) return <div style={{ textAlign: 'center', padding: 48, color: 'rgba(245,220,180,0.3)' }}>Loading settings...</div>

    const field = (label: string, key: keyof AppSetting, type: 'text' | 'number' = 'text') => (
        <div key={String(key)}>
            <label style={css.lbl}>{label}</label>
            <input type={type} value={settings[key] as string | number}
                onChange={e => setSettings({ ...settings, [key]: type === 'number' ? +e.target.value : e.target.value })}
                style={css.inp} />
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={css.card}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f5e0c0', margin: '0 0 20px' }}>⚙️ General Settings</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                    {field('Tax %', 'taxPercent', 'number')}
                    {field('Footer Text (EN)', 'editableFooterEn')}
                    {field('Footer Text (AR)', 'editableFooterAr')}
                    {field('Pickup Location', 'pickupLocation')}
                    {field('Pickup Phone', 'pickupPhone')}
                </div>

                <h4 style={{ fontSize: 11, color: 'rgba(245,220,180,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>📍 Contact & Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                    {field('Address', 'address')}
                    {field('Email', 'email')}
                    {field('WhatsApp Number', 'whatsapp')}
                </div>

                <h4 style={{ fontSize: 11, color: 'rgba(245,220,180,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>📱 Social Media Links</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                    {field('Instagram URL', 'instagram')}
                    {field('Snapchat URL', 'snapchat')}
                    {field('Facebook URL', 'facebook')}
                    {field('Twitter / X URL', 'twitter')}
                </div>

                {/* ── OPENING HOURS ── */}
                <h4 style={{ fontSize: 11, color: 'rgba(245,220,180,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>🕐 Opening Hours</h4>
                <div style={{ borderRadius: 12, background: 'rgba(192,125,64,0.04)', border: '1px solid rgba(192,125,64,0.12)', padding: '16px', marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>
                        <div>
                            <label style={css.lbl}>Sat – Thu Hours (English)</label>
                            <input
                                value={settings.hoursSatThuEn ?? '7:00 AM – 12:00 AM'}
                                onChange={e => setSettings({ ...settings, hoursSatThuEn: e.target.value })}
                                placeholder="7:00 AM – 12:00 AM"
                                style={css.inp}
                            />
                        </div>
                        <div>
                            <label style={css.lbl}>Friday Hours (English)</label>
                            <input
                                value={settings.hoursFriEn ?? '1:00 PM – 12:00 AM'}
                                onChange={e => setSettings({ ...settings, hoursFriEn: e.target.value })}
                                placeholder="1:00 PM – 12:00 AM"
                                style={css.inp}
                            />
                        </div>
                        <div>
                            <label style={css.lbl}>Sat – Thu Hours (Arabic)</label>
                            <input
                                value={settings.hoursSatThuAr ?? ''}
                                onChange={e => setSettings({ ...settings, hoursSatThuAr: e.target.value })}
                                placeholder="٧:٠٠ ص – ١٢:٠٠ م"
                                style={{ ...css.inp, direction: 'rtl' }}
                            />
                        </div>
                        <div>
                            <label style={css.lbl}>Friday Hours (Arabic)</label>
                            <input
                                value={settings.hoursFriAr ?? ''}
                                onChange={e => setSettings({ ...settings, hoursFriAr: e.target.value })}
                                placeholder="١:٠٠ م – ١٢:٠٠ م"
                                style={{ ...css.inp, direction: 'rtl' }}
                            />
                        </div>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(245,220,180,0.25)', margin: '12px 0 0', lineHeight: 1.6 }}>
                        💡 These hours appear in the footer of your website. Use any format you like, e.g. "7:00 AM – 12:00 AM" or "7am – midnight".
                    </p>
                </div>

                <h4 style={{ fontSize: 11, color: 'rgba(245,220,180,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 14px' }}>Size Multipliers</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 24 }}>
                    {field('Small Label', 'sizeSmLabel')}
                    {field('Small Mult', 'sizeSmMult', 'number')}
                    {field('Medium Label', 'sizeMdLabel')}
                    {field('Medium Mult', 'sizeMdMult', 'number')}
                    {field('Large Label', 'sizeLgLabel')}
                    {field('Large Mult', 'sizeLgMult', 'number')}
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={save} disabled={saving} style={css.btn}>{saving ? '⏳ Saving...' : '💾 Save Settings'}</button>
                    {saved && <span style={{ color: '#4ade80', fontSize: 14, fontWeight: 700 }}>✓ Saved!</span>}
                </div>
            </div>
        </div>
    )
}

// ─── Main AdminPage ───────────────────────────────────────────────
export default function AdminPage() {
    const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('ff-admin-token'))
    const [tab, setTab] = useState<Tab>('dashboard')
    const [orders, setOrders] = useState<Order[]>([])
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
    const [loadingData, setLoadingData] = useState(true)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    async function loadData() {
        setLoadingData(true)
        try {
            const [o, a] = await Promise.allSettled([api.getOrders(), api.getAnalytics()])
            if (o.status === 'fulfilled') setOrders(o.value.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()))
            if (a.status === 'fulfilled') setAnalytics(a.value)
        } catch { }
        finally { setLoadingData(false) }
    }

    useEffect(() => { if (authed) loadData() }, [authed])

    if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

    const newCount = orders.filter(o => o.status === 'new').length
    const tabs: { id: Tab; icon: string; label: string; badge?: number }[] = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'orders', icon: '📦', label: 'Orders', badge: newCount || undefined },
        { id: 'menu', icon: '🍽️', label: 'Menu' },
        { id: 'categories', icon: '🗂️', label: 'Categories' },
        { id: 'promo', icon: '🎟️', label: 'Promos' },
        { id: 'offers', icon: '📢', label: 'Offers' },
        { id: 'users', icon: '👥', label: 'Users' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
    ]
    const currentTab = tabs.find(t => t.id === tab)!

    return (
        <div style={{ minHeight: '100vh', background: '#080502', color: '#f5e0c0', fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                input::placeholder, textarea::placeholder { color: rgba(245,220,180,0.2); }
                input:focus, select:focus, textarea:focus { border-color: rgba(192,125,64,0.55) !important; outline: none; }
                select option { background: #13100c; color: #f5e0c0; }
                ::-webkit-scrollbar { width: 3px; height: 3px; }
                ::-webkit-scrollbar-thumb { background: rgba(192,125,64,0.25); border-radius: 99px; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

                .admin-layout { display: grid; grid-template-columns: 220px 1fr; gap: 20px; max-width: 1360px; margin: 0 auto; padding: clamp(14px,2vw,22px) clamp(14px,3vw,28px) 60px; align-items: start; }
                .admin-sidebar { position: sticky; top: 72px; }
                .admin-main { min-width: 0; animation: fadeUp 0.3s ease both; }
                .mobile-nav-toggle { display: none; }
                .admin-nav-desktop { display: flex; flex-direction: column; gap: 2px; }
                .admin-nav-mobile { display: none; }

                @media(max-width: 900px) {
                    .admin-layout { grid-template-columns: 1fr; }
                    .admin-sidebar { position: static; }
                    .admin-nav-desktop { display: none; }
                    .mobile-nav-toggle { display: flex; }
                    .admin-nav-mobile { display: block; }
                }
                @media(max-width: 600px) {
                    .admin-layout { padding: 12px 12px 80px; gap: 14px; }
                    .admin-header-label { display: none; }
                    .admin-header-btn { padding: 6px 8px !important; }
                }
            `}</style>

            <header style={{ background: 'rgba(8,4,2,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(192,125,64,0.14)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1360, margin: '0 auto', height: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(14px,3vw,28px)', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(192,125,64,0.4)', flexShrink: 0 }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, fontSize: 15, color: '#f5e0c0', lineHeight: 1 }}>For Friends</div>
                            <div style={{ fontSize: 8, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>ADMIN PORTAL</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Link to="/menu-order" className="admin-header-btn" style={{ ...css.ghost, textDecoration: 'none', fontSize: 11, padding: '6px 12px' }}><span>🛒</span><span className="admin-header-label"> Store</span></Link>
                        <Link to="/kitchen" className="admin-header-btn" style={{ ...css.ghost, textDecoration: 'none', fontSize: 11, padding: '6px 12px' }}><span>🔥</span><span className="admin-header-label"> Kitchen</span></Link>
                        <button className="admin-header-btn" onClick={() => { sessionStorage.removeItem('ff-admin-token'); setAuthed(false) }} style={{ ...css.danger, padding: '6px 12px', fontSize: 11 }}><span>⏏</span><span className="admin-header-label"> Sign Out</span></button>
                    </div>
                </div>
            </header>

            <div className="admin-layout">
                <div className="admin-sidebar">
                    <div className="admin-nav-desktop" style={{ borderRadius: 16, background: '#13100c', border: '1px solid rgba(192,125,64,0.14)', padding: 8 }}>
                        {tabs.map(tb => (
                            <button key={tb.id} onClick={() => setTab(tb.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, border: 'none', background: tab === tb.id ? 'rgba(192,125,64,0.18)' : 'transparent', color: tab === tb.id ? '#c07d40' : 'rgba(245,220,180,0.45)', cursor: 'pointer', fontWeight: tab === tb.id ? 800 : 600, fontSize: 13, fontFamily: 'inherit', width: '100%', textAlign: 'left' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 15 }}>{tb.icon}</span> {tb.label}</span>
                                {tb.badge && tb.badge > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 900 }}>{tb.badge}</span>}
                            </button>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(192,125,64,0.1)', margin: '6px 0' }} />
                        <Link to="/admin/manual-order" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, color: 'rgba(245,220,180,0.4)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>📝 Manual Order</Link>
                    </div>
                    <div className="admin-nav-mobile">
                        <button className="mobile-nav-toggle" onClick={() => setMobileNavOpen(p => !p)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, border: '1px solid rgba(192,125,64,0.22)', background: '#13100c', color: '#c07d40', cursor: 'pointer', fontWeight: 800, fontSize: 14, fontFamily: 'inherit' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span>{currentTab.icon}</span> {currentTab.label}
                                {currentTab.badge && currentTab.badge > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 900 }}>{currentTab.badge}</span>}
                            </span>
                            <span style={{ transition: 'transform 0.2s', transform: mobileNavOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                        </button>
                        {mobileNavOpen && (
                            <div style={{ borderRadius: '0 0 14px 14px', background: '#13100c', border: '1px solid rgba(192,125,64,0.22)', borderTop: 'none', overflow: 'hidden', animation: 'slideDown 0.2s ease' }}>
                                {tabs.map(tb => (
                                    <button key={tb.id} onClick={() => { setTab(tb.id); setMobileNavOpen(false) }}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 18px', border: 'none', borderTop: '1px solid rgba(192,125,64,0.07)', background: tab === tb.id ? 'rgba(192,125,64,0.14)' : 'transparent', color: tab === tb.id ? '#c07d40' : 'rgba(245,220,180,0.5)', cursor: 'pointer', fontWeight: tab === tb.id ? 800 : 600, fontSize: 14, fontFamily: 'inherit', textAlign: 'left' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span>{tb.icon}</span> {tb.label}</span>
                                        {tb.badge && tb.badge > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 900 }}>{tb.badge}</span>}
                                    </button>
                                ))}
                                <div style={{ borderTop: '1px solid rgba(192,125,64,0.1)', padding: '6px 0' }}>
                                    <Link to="/admin/manual-order" onClick={() => setMobileNavOpen(false)} style={{ display: 'block', padding: '12px 18px', color: 'rgba(245,220,180,0.4)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>📝 Manual Order</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="admin-main">
                    <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#f5e0c0', margin: '0 0 20px' }}>
                        {currentTab.icon} {currentTab.label}
                    </h1>
                    {tab === 'dashboard' && <DashboardTab analytics={analytics} orders={orders} />}
                    {tab === 'orders' && (loadingData ? <div style={{ textAlign: 'center', padding: 60, color: 'rgba(245,220,180,0.3)', fontSize: 32 }}>☕</div> : <OrdersTab orders={orders} onRefresh={loadData} />)}
                    {tab === 'menu' && <MenuTab />}
                    {tab === 'categories' && <CategoriesTab />}
                    {tab === 'promo' && <PromoTab />}
                    {tab === 'offers' && <OffersTab />}
                    {tab === 'users' && <UsersTab />}
                    {tab === 'settings' && <SettingsTab />}
                </div>
            </div>
        </div>
    )
}