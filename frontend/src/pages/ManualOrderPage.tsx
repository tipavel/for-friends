import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/4f_logu.png'
import { api, getImageUrl, parseItemSizes, type AppSetting, type Category, type CustomerProfile, type MenuItem, type PromoValidateResult } from '../services/api'

type CartItem = { id: number; name: string; price: number; emoji: string; qty: number }

const CAT_ICONS: Record<string, string> = { hot: '☕', cold: '🧊', tea: '🫖', food: '🍽️', all: '✦' }
const CAT_GRAD: Record<string, string> = {
    hot: 'linear-gradient(140deg,#3d1a05,#5c2a0e)',
    cold: 'linear-gradient(140deg,#071e30,#0e3050)',
    tea: 'linear-gradient(140deg,#0e2210,#1a3b1c)',
    food: 'linear-gradient(140deg,#2a1805,#3d2410)',
}
const pickupOptions = ['ASAP', 'In 10 min', 'In 15 min', 'In 20 min', 'In 30 min']
const inp: React.CSSProperties = { width: '100%', borderRadius: 10, border: '1px solid rgba(192,125,64,0.22)', padding: '10px 14px', fontSize: 14, fontFamily: 'inherit', background: 'rgba(255,255,255,0.04)', color: '#f5e0c0', outline: 'none' }
const qBtn: React.CSSProperties = { width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(192,125,64,0.25)', background: 'rgba(192,125,64,0.08)', cursor: 'pointer', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c07d40', fontFamily: 'inherit', flexShrink: 0 }

export default function ManualOrderPage() {
    const navigate = useNavigate()
    const [menu, setMenu] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [customers, setCustomers] = useState<CustomerProfile[]>([])
    const [settings, setSettings] = useState<AppSetting | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCat, setSelectedCat] = useState('all')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [notes, setNotes] = useState('')
    const [pickup, setPickup] = useState('ASAP')
    const [cart, setCart] = useState<CartItem[]>([])
    const [promoInput, setPromoInput] = useState('')
    const [promoResult, setPromoResult] = useState<PromoValidateResult | null>(null)
    const [promoError, setPromoError] = useState('')
    const [promoLoading, setPromoLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState('')
    const [custSearch, setCustSearch] = useState('')
    const [showSugg, setShowSugg] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900)

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth <= 900)
        window.addEventListener('resize', fn)
        return () => window.removeEventListener('resize', fn)
    }, [])

    // close panel on outside tap
    useEffect(() => {
        if (!cartOpen) return
        const fn = (e: MouseEvent) => {
            const panel = document.getElementById('mo-panel')
            if (panel && !panel.contains(e.target as Node)) setCartOpen(false)
        }
        setTimeout(() => document.addEventListener('mousedown', fn), 10)
        return () => document.removeEventListener('mousedown', fn)
    }, [cartOpen])

    const suggestions = useMemo(() =>
        custSearch.length > 1
            ? customers.filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch)).slice(0, 5)
            : [], [customers, custSearch])

    useEffect(() => {
        Promise.all([api.getMenu(), api.getCategories(), api.getCustomers(), api.getSettings()])
            .then(([m, c, u, s]) => { setMenu(m.filter(x => x.avail)); setCategories(c.filter(x => x.active)); setCustomers(u); setSettings(s) })
            .catch(() => { }).finally(() => setLoading(false))
    }, [])

    const filteredMenu = useMemo(() =>
        menu.filter(i => (selectedCat === 'all' || i.cat === selectedCat) && `${i.name} ${i.nameAr}`.toLowerCase().includes(search.toLowerCase()))
        , [menu, selectedCat, search])

    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
    const discount = promoResult ? Math.round(subtotal * promoResult.discountPercent) / 100 : 0
    const taxRate = settings?.taxPercent ?? 15
    const tax = Math.round((subtotal - discount) * (taxRate / 100) * 100) / 100
    const total = subtotal - discount + tax
    const totalQty = cart.reduce((s, i) => s + i.qty, 0)

    function addItem(item: MenuItem) {
        const sizes = parseItemSizes(item)
        const price = sizes.length > 0 ? sizes[0].price : item.price
        setCart(c => { const ex = c.find(x => x.id === item.id); return ex ? c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { id: item.id, name: item.name, price, emoji: item.emoji, qty: 1 }] })
    }
    function changeQty(id: number, d: number) { setCart(c => c.map(x => x.id === id ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0)) }

    async function applyPromo() {
        if (!promoInput.trim()) return
        setPromoLoading(true); setPromoError('')
        try { setPromoResult(await api.validatePromo(promoInput.trim(), subtotal)) }
        catch { setPromoError('Invalid or expired code'); setPromoResult(null) }
        finally { setPromoLoading(false) }
    }

    async function placeOrder() {
        if (cart.length === 0) return
        setSubmitting(true)
        try {
            const created = await api.createOrder({ name: name.trim(), phone: phone.trim(), notes: notes.trim(), pickup, paymentMethod: 'pickup', promoCode: promoResult?.code || '', items: cart.map(i => ({ id: i.id, qty: i.qty })) })
            setSuccess(`✓ Order #${created.id} placed!`)
            setCart([]); setPromoInput(''); setPromoResult(null); setNotes(''); setPickup('ASAP'); setCartOpen(false)
            setTimeout(() => { setSuccess(''); navigate(`/track/${created.id}`) }, 1800)
        } catch (e) { alert(e instanceof Error ? e.message : 'Failed') }
        finally { setSubmitting(false) }
    }

    const allCats = [{ key: 'all', name: 'All' }, ...categories.map(c => ({ key: c.key, name: c.name }))]

    const OrderPanel = () => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Sticky panel header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#13100c', borderBottom: '1px solid rgba(192,125,64,0.1)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: isMobile ? '22px 22px 0 0' : undefined }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 900, color: '#f5e0c0', margin: 0 }}>📝 New Order</h2>
                {isMobile && (
                    <button onClick={() => setCartOpen(false)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(192,125,64,0.22)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', color: '#c07d40', fontSize: 15, display: 'grid', placeItems: 'center' }}>✕</button>
                )}
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: isMobile ? 'auto' : undefined }}>
                {/* Customer */}
                <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.14em', color: 'rgba(192,125,64,0.55)', fontWeight: 700, marginBottom: 7, textTransform: 'uppercase' }}>Customer</div>
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                        <input value={custSearch || name}
                            onChange={e => { const v = e.target.value; setCustSearch(v); setName(v); setShowSugg(true) }}
                            onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                            placeholder="Customer name" style={inp} />
                        {showSugg && suggestions.length > 0 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#1a120a', borderRadius: '0 0 12px 12px', border: '1px solid rgba(192,125,64,0.25)', borderTop: 'none', overflow: 'hidden' }}>
                                {suggestions.map(c => (
                                    <div key={c.id} onClick={() => { setName(c.name); setPhone(c.phone); setCustSearch(c.name); setShowSugg(false) }}
                                        style={{ padding: '9px 13px', cursor: 'pointer', borderBottom: '1px solid rgba(192,125,64,0.08)', fontSize: 13 }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(192,125,64,0.08)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        <div style={{ fontWeight: 700, color: '#f5e0c0' }}>{c.name}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(245,220,180,0.4)' }}>{c.phone} · {c.totalOrders} orders</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" style={{ ...inp, marginBottom: 8 }} />
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Kitchen notes..." rows={2} style={{ ...inp, resize: 'none' }} />
                </div>

                {/* Pickup */}
                <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.14em', color: 'rgba(192,125,64,0.55)', fontWeight: 700, marginBottom: 7, textTransform: 'uppercase' }}>Pickup Time</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {pickupOptions.map(opt => (
                            <button key={opt} onClick={() => setPickup(opt)}
                                style={{ padding: '6px 11px', borderRadius: 999, border: `1.5px solid ${pickup === opt ? '#c07d40' : 'rgba(192,125,64,0.18)'}`, background: pickup === opt ? 'rgba(192,125,64,0.18)' : 'transparent', color: pickup === opt ? '#c07d40' : 'rgba(245,220,180,0.45)', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cart items */}
                <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.14em', color: 'rgba(192,125,64,0.55)', fontWeight: 700, marginBottom: 7, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Cart {totalQty > 0 && `(${totalQty})`}</span>
                        {cart.length > 0 && <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,0.5)', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', fontWeight: 700, letterSpacing: '0.1em', padding: 0 }}>Clear</button>}
                    </div>
                    {cart.length === 0
                        ? <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(245,220,180,0.18)', fontSize: 13 }}><div style={{ fontSize: 24, marginBottom: 5 }}>🛒</div>Click items to add</div>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {cart.map(item => (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,125,64,0.1)' }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji || '☕'}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 12, color: '#f5e0c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                        <div style={{ fontSize: 11, color: '#c07d40', fontWeight: 600 }}>SAR {(item.price * item.qty).toFixed(2)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                        <button onClick={() => changeQty(item.id, -1)} style={qBtn}>−</button>
                                        <span style={{ fontWeight: 900, minWidth: 18, textAlign: 'center', fontSize: 13, color: '#f5e0c0' }}>{item.qty}</span>
                                        <button onClick={() => changeQty(item.id, 1)} style={qBtn}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>

                {/* Promo */}
                <div>
                    <div style={{ display: 'flex', gap: 7 }}>
                        <input value={promoInput} onChange={e => { setPromoInput(e.target.value); setPromoError('') }} placeholder="Promo code" style={{ ...inp, flex: 1 }} />
                        <button onClick={applyPromo} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(192,125,64,0.25)', background: 'rgba(192,125,64,0.1)', color: '#c07d40', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                            {promoLoading ? '…' : 'Apply'}
                        </button>
                    </div>
                    {promoError && <div style={{ color: '#f87171', fontSize: 12, marginTop: 5 }}>✕ {promoError}</div>}
                    {promoResult && <div style={{ color: '#4ade80', fontSize: 12, marginTop: 5 }}>✓ {promoResult.message}</div>}
                </div>

                {/* Totals */}
                {cart.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(192,125,64,0.12)', paddingTop: 12 }}>
                        {[['Subtotal', `SAR ${subtotal.toFixed(2)}`, false], ...(discount > 0 ? [[`Discount (${promoResult?.code})`, `−SAR ${discount.toFixed(2)}`, true]] : []), [`Tax (${taxRate}%)`, `SAR ${tax.toFixed(2)}`, false]].map(([l, v, g]) => (
                            <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: g ? '#4ade80' : 'rgba(245,220,180,0.4)', marginBottom: 4 }}>
                                <span>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 20, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(192,125,64,0.12)', fontFamily: "'Cormorant Garamond',serif" }}>
                            <span style={{ color: '#f5e0c0' }}>Total</span>
                            <span style={{ color: '#c07d40' }}>SAR {total.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {success && <div style={{ padding: '11px 14px', borderRadius: 12, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>{success}</div>}
            </div>

            {/* Sticky place order footer */}
            <div style={{ position: 'sticky', bottom: 0, background: '#13100c', borderTop: '1px solid rgba(192,125,64,0.1)', padding: '12px 18px 16px' }}>
                <button onClick={placeOrder} disabled={cart.length === 0 || submitting}
                    style={{ width: '100%', padding: '14px', borderRadius: 999, border: 'none', background: cart.length === 0 || submitting ? 'rgba(192,125,64,0.08)' : 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: cart.length === 0 || submitting ? 'rgba(245,220,180,0.25)' : 'white', fontWeight: 800, cursor: cart.length === 0 || submitting ? 'default' : 'pointer', fontSize: 14, fontFamily: 'inherit', boxShadow: cart.length > 0 && !submitting ? '0 6px 28px rgba(192,125,64,0.4)' : 'none', transition: 'all 0.2s' }}>
                    {submitting ? '⏳ Placing...' : cart.length === 0 ? '🛒 Add items to order' : `☕ Place Order — SAR ${total.toFixed(2)}`}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: '#080502', color: '#f5e0c0', fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                html, body { margin: 0; background: #080502; }
                input::placeholder, textarea::placeholder { color: rgba(245,220,180,0.22); }
                input:focus, textarea:focus { border-color: rgba(192,125,64,0.55) !important; outline: none; }
                ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: rgba(192,125,64,0.25); border-radius: 99px; }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

                .mo-grid { display: grid; grid-template-columns: 1fr 340px; gap: 18px; align-items: start; }
                .mo-panel-wrap { position: sticky; top: 70px; border-radius: 18px; overflow: hidden; background: #13100c; border: 1px solid rgba(192,125,64,0.18); box-shadow: 0 8px 40px rgba(0,0,0,0.4); max-height: calc(100vh - 90px); display: flex; flex-direction: column; }
                .mo-menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                @media(min-width: 560px) { .mo-menu-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
                @media(min-width: 900px) { .mo-menu-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; } }
                .mo-card { border-radius: 14px; overflow: hidden; background: #14100c; border: 1.5px solid rgba(255,255,255,0.06); cursor: pointer; transition: border-color 0.2s, transform 0.18s, box-shadow 0.18s; }
                .mo-card:hover { border-color: rgba(192,125,64,0.45); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }
                .mo-card:active { transform: scale(0.97); }
                .cats-row { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
                .cats-row::-webkit-scrollbar { display: none; }
                .mo-fab { display: none; }

                @media(max-width: 900px) {
                    .mo-grid { grid-template-columns: 1fr; }
                    .mo-panel-wrap { position: fixed; left: 0; right: 0; bottom: 0; top: auto; border-radius: 22px 22px 0 0; max-height: 82vh; transform: translateY(100%); transition: transform 0.35s cubic-bezier(0.16,1,0.3,1); box-shadow: 0 -16px 60px rgba(0,0,0,0.7); z-index: 200; }
                    .mo-panel-wrap.open { transform: translateY(0); }
                    .mo-fab { display: flex; }
                }
            `}</style>

            {/* HEADER */}
            <header style={{ background: 'rgba(8,4,2,0.98)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(192,125,64,0.14)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', height: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(12px,3vw,24px)', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(192,125,64,0.4)', flexShrink: 0 }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, fontSize: 15, color: '#f5e0c0', lineHeight: 1 }}>Manual Order</div>
                            <div style={{ fontSize: 9, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Staff Portal</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* Mobile: show cart count in header */}
                        {isMobile && totalQty > 0 && (
                            <button onClick={() => setCartOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 999, border: 'none', background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 18px rgba(192,125,64,0.4)' }}>
                                <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{totalQty}</span>
                                SAR {total.toFixed(2)}
                            </button>
                        )}
                        <Link to="/admin" style={{ padding: '7px 13px', borderRadius: 999, border: '1px solid rgba(192,125,64,0.25)', background: 'transparent', color: '#c07d40', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>← Admin</Link>
                        <Link to="/kitchen" style={{ padding: '7px 13px', borderRadius: 999, border: '1px solid rgba(192,125,64,0.2)', background: 'transparent', color: 'rgba(245,220,180,0.5)', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>🔥</Link>
                    </div>
                </div>
            </header>

            {/* Overlay */}
            {isMobile && cartOpen && (
                <div onClick={() => setCartOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 199 }} />
            )}

            <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(12px,2vw,20px) clamp(12px,3vw,24px) clamp(100px,12vh,130px)', minHeight: 'calc(100vh - 58px)', background: '#080502' }}>
                <div className="mo-grid">
                    {/* ── MENU SIDE ── */}
                    <div>
                        {/* Search */}
                        <div style={{ position: 'relative', marginBottom: 10 }}>
                            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(245,220,180,0.25)', pointerEvents: 'none' }}>🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." style={{ ...inp, paddingLeft: 34 }} />
                        </div>

                        {/* Category chips */}
                        <div className="cats-row" style={{ marginBottom: 14 }}>
                            {allCats.map(cat => (
                                <button key={cat.key} onClick={() => setSelectedCat(cat.key)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${selectedCat === cat.key ? '#c07d40' : 'rgba(192,125,64,0.18)'}`, background: selectedCat === cat.key ? 'rgba(192,125,64,0.18)' : 'rgba(255,255,255,0.03)', color: selectedCat === cat.key ? '#c07d40' : 'rgba(245,220,180,0.5)', cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s' }}>
                                    <span>{CAT_ICONS[cat.key] || '✦'}</span> {cat.name}
                                    <span style={{ fontSize: 10, opacity: 0.5 }}>({cat.key === 'all' ? menu.length : menu.filter(m => m.cat === cat.key).length})</span>
                                </button>
                            ))}
                        </div>

                        {loading
                            ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(245,220,180,0.3)' }}><div style={{ fontSize: 32 }}>☕</div><div style={{ marginTop: 10 }}>Loading...</div></div>
                            : filteredMenu.length === 0
                                ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(245,220,180,0.25)' }}><div style={{ fontSize: 32 }}>🔍</div><div style={{ marginTop: 10, fontWeight: 600 }}>No items found</div></div>
                                : <div className="mo-menu-grid">
                                    {filteredMenu.map((item, idx) => {
                                        const imgUrl = getImageUrl(item.imageUrl)
                                        const inCart = cart.find(x => x.id === item.id)?.qty || 0
                                        const sizes = parseItemSizes(item)
                                        const displayPrice = sizes.length > 0 ? `from SAR ${Math.min(...sizes.map(s => s.price)).toFixed(0)}` : `SAR ${item.price.toFixed(0)}`
                                        return (
                                            <div key={item.id} className="mo-card" onClick={() => addItem(item)}
                                                style={{ animation: `fadeUp 0.25s ${Math.min(idx * 0.03, 0.3)}s ease both`, animationFillMode: 'both' }}>
                                                {/* Image zone */}
                                                <div style={{ aspectRatio: '4/3', background: CAT_GRAD[item.cat] || CAT_GRAD.hot, position: 'relative', overflow: 'hidden' }}>
                                                    {imgUrl
                                                        ? <img src={imgUrl} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 36, opacity: 0.18 }}>{CAT_ICONS[item.cat] || '☕'}</span></div>
                                                    }
                                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 35%, rgba(20,16,12,0.88) 100%)' }} />
                                                    {/* Price badge */}
                                                    <div style={{ position: 'absolute', top: 6, right: 6, padding: '3px 7px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(192,125,64,0.3)', fontSize: 10, fontWeight: 900, color: '#e8a84c' }}>{displayPrice}</div>
                                                    {/* Cart qty badge */}
                                                    {inCart > 0 && <div style={{ position: 'absolute', top: 6, left: 6, width: 22, height: 22, borderRadius: '50%', background: '#c07d40', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900, color: 'white', boxShadow: '0 2px 8px rgba(192,125,64,0.5)' }}>{inCart}</div>}
                                                </div>
                                                {/* Text zone */}
                                                <div style={{ padding: '8px 10px 11px' }}>
                                                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 800, color: '#f5e0c0', lineHeight: 1.2, marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.emoji} {item.name}</div>
                                                    <div style={{ width: '100%', borderRadius: 999, padding: '6px 0', background: inCart > 0 ? 'rgba(192,125,64,0.2)' : 'linear-gradient(135deg,#c07d40,#8b4f1c)', textAlign: 'center', color: inCart > 0 ? '#c07d40' : 'white', fontWeight: 800, fontSize: 11, transition: 'all 0.2s' }}>
                                                        {inCart > 0 ? `✓ Added (${inCart})` : '+ Add'}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                        }
                    </div>

                    {/* ── ORDER PANEL ── */}
                    <div id="mo-panel" className={`mo-panel-wrap${cartOpen ? ' open' : ''}`}>
                        {/* Mobile drag handle */}
                        <div style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)', margin: '10px auto 0', flexShrink: 0 }} />
                        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
                            <OrderPanel />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE FAB ── */}
            <div className="mo-fab" style={{
                position: 'fixed',
                bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
                left: '50%', transform: 'translateX(-50%)',
                zIndex: 150,
                alignItems: 'center', gap: 10,
                padding: totalQty > 0 ? '13px 24px' : '12px 20px',
                borderRadius: 999,
                background: totalQty > 0 ? 'linear-gradient(135deg,#c07d40,#8b4f1c)' : 'rgba(19,16,12,0.96)',
                color: totalQty > 0 ? 'white' : 'rgba(245,220,180,0.4)',
                border: totalQty > 0 ? 'none' : '1px solid rgba(192,125,64,0.2)',
                fontWeight: 800, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: totalQty > 0 ? '0 8px 40px rgba(192,125,64,0.55)' : '0 4px 20px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s',
                pointerEvents: 'auto',
            }} onClick={() => setCartOpen(p => !p)}>
                {totalQty > 0 ? (
                    <>
                        <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: '2px 9px', fontSize: 12 }}>{totalQty}</span>
                        🛒 View Order · SAR {total.toFixed(2)}
                    </>
                ) : (
                    <>🛒 Order Panel</>
                )}
            </div>
        </div>
    )
}