import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type Order } from '../services/api'

type Review = { id: string; name: string; rating: number; text: string; item?: string; date: string }

function generateReceiptHtml(order: Order): string {
    const rows = order.items.map(i => `<tr><td>${i.emoji || ''} ${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">SAR ${(i.price * i.qty).toFixed(2)}</td></tr>`).join('')
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt #${order.id}</title>
  <style>body{font-family:'Segoe UI',sans-serif;max-width:480px;margin:40px auto;color:#1a0f0a;background:#faf6f0;padding:0 20px}.header{text-align:center;padding:28px 0 20px;border-bottom:2px dashed #c07d40}.brand{font-size:24px;font-weight:900}.subtitle{color:#9a7a5a;font-size:13px;margin-top:4px}.order-no{font-size:36px;font-weight:900;color:#c07d40;text-align:center;margin:20px 0 4px}.meta{color:#9a7a5a;font-size:13px;text-align:center;margin-bottom:20px}table{width:100%;border-collapse:collapse;margin:16px 0}th{background:#1a0f0a;color:white;padding:10px 12px;font-size:12px;text-align:left}th:nth-child(2){text-align:center}th:nth-child(3){text-align:right}td{padding:10px 12px;border-bottom:1px solid #ead7be;font-size:14px}.totals{margin:16px 0;background:white;border-radius:14px;border:1px solid #ead7be;padding:16px}.tr{display:flex;justify-content:space-between;padding:5px 0;font-size:14px;color:#7a6458}.tf{display:flex;justify-content:space-between;padding:12px 0 0;border-top:2px solid #ead7be;font-size:20px;font-weight:900;color:#c07d40}.status-badge{display:inline-block;padding:6px 18px;border-radius:999px;background:#dcfce7;color:#15803d;font-weight:700;font-size:13px;border:1px solid #86efac}.footer{text-align:center;margin-top:28px;padding:20px 0;border-top:1px dashed #c07d40;color:#9a7a5a;font-size:12px}@media print{body{background:white}button{display:none}}</style>
  </head><body>
  <div class="header"><div style="font-size:32px">☕</div><div class="brand">For Friends Café</div><div class="subtitle">Official Receipt</div></div>
  <div class="order-no">#${order.id}</div>
  <div class="meta">${order.name ? order.name + ' · ' : ''}${new Date(order.time).toLocaleString()}<br>Pickup: ${order.pickup} · ${order.paymentMethod}</div>
  <span class="status-badge" style="display:block;text-align:center;margin:0 auto 16px;width:fit-content">${order.status.toUpperCase()}</span>
  <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="totals">
    <div class="tr"><span>Subtotal</span><span>SAR ${order.subtotal.toFixed(2)}</span></div>
    ${order.discount > 0 ? `<div class="tr" style="color:#16a34a"><span>Discount${order.promoCode ? ` (${order.promoCode})` : ''}</span><span>−SAR ${order.discount.toFixed(2)}</span></div>` : ''}
    <div class="tr"><span>Tax</span><span>SAR ${order.tax.toFixed(2)}</span></div>
    <div class="tf"><span>Total</span><span>SAR ${order.total.toFixed(2)}</span></div>
  </div>
  ${order.notes ? `<div style="background:#fff8e1;border:1px solid #fbbf24;border-radius:12px;padding:12px 16px;font-size:13px;margin-bottom:16px">📝 ${order.notes}</div>` : ''}
  <div class="footer">For Friends Café · Thank you for your visit!</div>
  <div style="text-align:center;margin-top:16px"><button onclick="window.print()" style="padding:12px 28px;border-radius:999px;background:#1a0f0a;color:white;border:none;font-size:15px;font-weight:700;cursor:pointer">🖨 Print Receipt</button></div>
  </body></html>`
}

function downloadReceipt(order: Order) {
    const blob = new Blob([generateReceiptHtml(order)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `receipt-${order.id}.html`; a.click()
    URL.revokeObjectURL(url)
}

function downloadToken(order: Order) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Token ${order.id}</title><style>body{font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#faf6f0}.card{width:340px;border:2px dashed #c07d40;border-radius:24px;background:white;padding:32px;text-align:center}.id{font-size:48px;font-weight:800;color:#1a0f0a}.meta{color:#7a6458;margin-top:10px}.badge{display:inline-block;margin-top:18px;padding:8px 14px;border-radius:999px;background:#fff3e0;color:#c07d40;font-weight:700}</style></head><body><div class="card"><div style="font-size:42px">🎟️</div><h1>Pickup Token</h1><div class="id">#${order.id}</div><div class="meta">${order.name}<br/>${order.pickup}</div><div class="badge">Show this at pickup</div></div></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `token-${order.id}.html`; a.click()
    URL.revokeObjectURL(url)
}

const STATUS_CONFIG = {
    new: { step: 1, label: 'Order Received', icon: '🆕', color: '#3b82f6', desc: "We've got your order and it's being sent to the kitchen." },
    preparing: { step: 2, label: 'Preparing', icon: '🔥', color: '#f59e0b', desc: 'Your drinks and food are being crafted with care right now.' },
    ready: { step: 3, label: 'Ready for Pickup', icon: '✅', color: '#10b981', desc: 'Your order is ready! Head to the pickup counter.' },
    done: { step: 4, label: 'Completed', icon: '🎉', color: '#c07d40', desc: 'Thank you for choosing For Friends. See you next time!' },
}

export default function TrackOrderPage() {
    const { orderId } = useParams()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showReview, setShowReview] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewHover, setReviewHover] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [reviewSubmitted, setReviewSubmitted] = useState(false)

    async function loadOrder(showLoader = false) {
        try {
            if (showLoader) setLoading(true)
            const found = orderId ? await api.getOrder(orderId) : null
            if (!found) { setError(''); setOrder(null); return }
            setOrder(found); setError('')
        } catch (err) {
            const status = (err as any)?.status
            if (status === 404 || !orderId) {
                setError(''); setOrder(null)
            } else {
                setError(err instanceof Error ? err.message : 'Failed to load order')
            }
        }
        finally { if (showLoader) setLoading(false) }
    }

    useEffect(() => {
        loadOrder(true)
        const interval = setInterval(() => loadOrder(false), 4000)
        return () => clearInterval(interval)
    }, [orderId])

    const statusCfg = useMemo(() => order ? STATUS_CONFIG[order.status] : null, [order])

    function submitReview() {
        if (!reviewText.trim()) return
        const firstItem = order?.items?.[0]
        const newReview: Review = {
            id: Date.now().toString(),
            name: order?.name || 'Guest',
            rating: reviewRating,
            text: reviewText.trim(),
            date: new Date().toLocaleDateString(),
            item: firstItem ? `${firstItem.emoji || ''} ${firstItem.name}` : undefined
        }
        const existing = JSON.parse(localStorage.getItem('ff-reviews') || '[]')
        localStorage.setItem('ff-reviews', JSON.stringify([newReview, ...existing]))
        setReviewSubmitted(true)
        setTimeout(() => setShowReview(false), 2500)
    }

    if (loading) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#080502' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64, animation: 'spin 3s linear infinite', display: 'inline-block' }}>☕</div>
                <h2 style={{ marginTop: 20, fontFamily: "'Cormorant Garamond',serif", color: '#f5e0c0', fontSize: 28 }}>Loading your order...</h2>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
        </div>
    )

    if (error || !order) return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#080502', padding: 24 }}>
            <div style={{ maxWidth: 460, width: '100%', borderRadius: 28, background: '#14100c', border: '1px solid rgba(192,125,64,0.2)', padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: '#f5e0c0', margin: '0 0 10px' }}>Order not found</h2>
                <p style={{ color: 'rgba(245,220,180,0.4)', marginBottom: 24 }}>{error || "We couldn't find this order. Please check your order number."}</p>
                <Link to="/" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 999, background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', textDecoration: 'none', fontWeight: 800 }}>Back to Home</Link>
            </div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>
        </div>
    )

    const currentStep = statusCfg?.step || 1

    return (
        <div style={{ minHeight: '100vh', background: '#080502', fontFamily: "'DM Sans',sans-serif", color: '#f5e0c0' }}>
            <header style={{ background: 'rgba(10,6,3,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid rgba(192,125,64,0.12)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(12px,3vw,32px)' }}>
                    <Link to="/" style={{ color: '#f5e0c0', textDecoration: 'none', fontWeight: 900, fontSize: 'clamp(15px,2.5vw,18px)', fontFamily: "'Cormorant Garamond',serif" }}>☕ For Friends</Link>
                    <Link to="/menu-order" style={{ padding: '9px clamp(14px,2vw,20px)', borderRadius: 999, background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 13, boxShadow: '0 3px 14px rgba(192,125,64,0.3)' }}>Order More →</Link>
                </div>
            </header>

            {/* Hero */}
            <div style={{ background: 'linear-gradient(to bottom,#0d0905,#080502)', padding: 'clamp(24px,4vw,40px) clamp(12px,3vw,32px)', borderBottom: '1px solid rgba(192,125,64,0.1)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: `${statusCfg?.color}18`, border: `1px solid ${statusCfg?.color}33`, color: statusCfg?.color, fontSize: 11, fontWeight: 700, marginBottom: 12, letterSpacing: '0.1em' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg?.color, display: 'inline-block', animation: order.status !== 'done' ? 'pulse 2s infinite' : 'none' }} />LIVE TRACKING
                        </div>
                        <h1 style={{ fontSize: 'clamp(24px,5vw,48px)', fontFamily: "'Cormorant Garamond',serif", color: '#f5e0c0', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{statusCfg?.icon} {statusCfg?.label}</h1>
                        <p style={{ color: 'rgba(245,220,180,0.45)', fontSize: 'clamp(13px,1.5vw,15px)', margin: 0 }}>{statusCfg?.desc}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(245,220,180,0.3)', marginBottom: 4 }}>ORDER NO.</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(30px,6vw,40px)', fontWeight: 900, color: '#c07d40' }}>#{order.id}</div>
                        {order.name && <div style={{ fontSize: 13, color: 'rgba(245,220,180,0.45)', marginTop: 2 }}>{order.name}</div>}
                    </div>
                </div>
            </div>

            <main style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px,2vw,28px) clamp(12px,3vw,32px) clamp(40px,6vw,60px)' }}>
                <div className="ff-track-grid">
                    <section>
                        {/* Status tracker */}
                        <div style={{ borderRadius: 24, background: '#14100c', border: '1px solid rgba(192,125,64,0.15)', padding: 'clamp(18px,3vw,28px)', marginBottom: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, margin: '0 0 24px', fontWeight: 900, color: '#f5e0c0' }}>Order Status</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {Object.entries(STATUS_CONFIG).map(([key, cfg], idx) => {
                                    const isActive = currentStep >= cfg.step
                                    const isCurrent = order.status === key
                                    const isLast = idx === Object.keys(STATUS_CONFIG).length - 1
                                    return (
                                        <div key={key} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: isActive ? `${cfg.color}22` : 'rgba(255,255,255,0.04)', border: `2px solid ${isActive ? cfg.color : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, position: 'relative', flexShrink: 0, transition: 'all 0.4s ease' }}>
                                                    {cfg.icon}
                                                    {isCurrent && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px solid ${cfg.color}`, animation: 'ping 1.5s ease infinite', opacity: 0.5 }} />}
                                                </div>
                                                {!isLast && <div style={{ width: 2, flex: 1, background: isActive && currentStep > cfg.step ? `linear-gradient(to bottom, ${cfg.color}, rgba(255,255,255,0.06))` : 'rgba(255,255,255,0.06)', margin: '6px 0', minHeight: 28 }} />}
                                            </div>
                                            <div style={{ paddingBottom: isLast ? 0 : 28, paddingTop: 8, flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isCurrent ? 6 : 0 }}>
                                                    <span style={{ fontWeight: 800, fontSize: 15, color: isActive ? '#f5e0c0' : 'rgba(245,220,180,0.25)' }}>{cfg.label}</span>
                                                    {isCurrent && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 999, background: `${cfg.color}22`, color: cfg.color, fontWeight: 800, letterSpacing: '0.08em', border: `1px solid ${cfg.color}44` }}>NOW</span>}
                                                    {isActive && !isCurrent && <span style={{ color: '#4ade80', fontSize: 16 }}>✓</span>}
                                                </div>
                                                {isCurrent && <p style={{ fontSize: 13, color: 'rgba(245,220,180,0.45)', margin: 0, lineHeight: 1.6 }}>{cfg.desc}</p>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Order items */}
                        <div style={{ borderRadius: 24, background: '#14100c', border: '1px solid rgba(192,125,64,0.15)', padding: 'clamp(16px,3vw,24px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, margin: '0 0 18px', fontWeight: 900, color: '#f5e0c0' }}>Your Items</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,125,64,0.08)', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji || '☕'}</span>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: '#f5e0c0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                            <span style={{ background: 'rgba(192,125,64,0.15)', color: '#c07d40', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>×{item.qty}</span>
                                        </div>
                                        <span style={{ color: '#c07d40', fontWeight: 800, fontSize: 14, flexShrink: 0, fontFamily: "'Cormorant Garamond',serif" }}>SAR {(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <aside>
                        {/* Summary card */}
                        <div style={{ borderRadius: 24, background: '#14100c', border: '1px solid rgba(192,125,64,0.15)', padding: 'clamp(16px,3vw,24px)', marginBottom: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, margin: '0 0 18px', fontWeight: 900, color: '#f5e0c0' }}>Summary</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { label: 'Pickup', value: order.pickup },
                                    { label: 'Payment', value: order.paymentMethod },
                                    { label: 'Time', value: new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                                ].map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, gap: 8 }}>
                                        <span style={{ color: 'rgba(245,220,180,0.4)', fontWeight: 600 }}>{row.label}</span>
                                        <span style={{ fontWeight: 700, color: '#f5e0c0', textAlign: 'right' }}>{row.value}</span>
                                    </div>
                                ))}
                                {order.notes && <div style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(245,220,180,0.05)', border: '1px solid rgba(245,220,180,0.1)', fontSize: 13, color: 'rgba(245,220,180,0.55)' }}>📝 {order.notes}</div>}
                                <div style={{ borderTop: '1px solid rgba(192,125,64,0.12)', paddingTop: 12, marginTop: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(245,220,180,0.35)', marginBottom: 4 }}><span>Subtotal</span><span>SAR {order.subtotal.toFixed(2)}</span></div>
                                    {order.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4ade80', marginBottom: 4 }}><span>Discount</span><span>−SAR {order.discount.toFixed(2)}</span></div>}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(245,220,180,0.35)', marginBottom: 8 }}><span>Tax</span><span>SAR {order.tax.toFixed(2)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 22, fontFamily: "'Cormorant Garamond',serif" }}>
                                        <span style={{ color: '#f5e0c0' }}>Total</span>
                                        <span style={{ color: '#c07d40' }}>SAR {order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <button onClick={() => downloadReceipt(order)} style={{ width: '100%', padding: '12px', borderRadius: 999, border: '1px solid rgba(192,125,64,0.25)', background: 'rgba(192,125,64,0.08)', color: '#c07d40', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>🧾 Download Receipt</button>
                            <button onClick={() => downloadToken(order)} style={{ width: '100%', padding: '12px', borderRadius: 999, border: '1px solid rgba(245,220,180,0.1)', background: 'transparent', color: 'rgba(245,220,180,0.45)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>🎟 Download Token</button>

                            {(order.status === 'ready' || order.status === 'done') && !showReview && (
                                <button onClick={() => setShowReview(true)} style={{ width: '100%', padding: '12px', borderRadius: 999, background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(192,125,64,0.35)' }}>★ Leave a Review</button>
                            )}
                        </div>

                        {showReview && (
                            <div style={{ marginTop: 14, borderRadius: 22, background: '#14100c', border: '1px solid rgba(192,125,64,0.18)', padding: 20 }}>
                                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, margin: '0 0 14px', color: '#f5e0c0', fontWeight: 800 }}>Your Review</h3>
                                {reviewSubmitted ? (
                                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#4ade80', fontWeight: 700, fontSize: 16 }}>🎉 Thank you for your review!</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', gap: 4 }}>{[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => setReviewRating(s)} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s', transform: (reviewHover || reviewRating) >= s ? 'scale(1.18)' : 'scale(1)', padding: '0 2px' }}><span style={{ color: (reviewHover || reviewRating) >= s ? '#f5a623' : 'rgba(245,220,180,0.15)' }}>★</span></button>)}</div>
                                        <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Tell us about your experience..." rows={3} style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(192,125,64,0.2)', padding: '10px 12px', fontSize: 13, fontFamily: "'DM Sans',sans-serif", background: 'rgba(255,255,255,0.04)', color: '#f5e0c0', outline: 'none', resize: 'vertical' }} />
                                        <button onClick={submitReview} disabled={!reviewText.trim()} style={{ padding: '12px', borderRadius: 999, background: reviewText.trim() ? 'linear-gradient(135deg,#c07d40,#8b4f1c)' : 'rgba(255,255,255,0.05)', border: 'none', color: reviewText.trim() ? 'white' : 'rgba(245,220,180,0.25)', fontWeight: 800, cursor: reviewText.trim() ? 'pointer' : 'default', fontFamily: 'inherit', boxShadow: reviewText.trim() ? '0 4px 18px rgba(192,125,64,0.35)' : 'none' }}>Submit Review</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
        @keyframes ping{0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.5);opacity:0}}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#080502}::-webkit-scrollbar-thumb{background:rgba(192,125,64,0.25);border-radius:99px}

        .ff-track-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .ff-track-grid { grid-template-columns: 1fr; }
        }

        @supports (padding: env(safe-area-inset-bottom)) {
          main { padding-bottom: max(env(safe-area-inset-bottom), 40px) !important; }
        }
      `}</style>
        </div>
    )
}