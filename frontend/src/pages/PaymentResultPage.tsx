import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, type CreateOrderRequest, type Order } from '../services/api'

type RecentOrder = {
    id: string; createdAt: string; name: string; pickup: string
    paymentMethod: 'pickup' | 'creditcard' | 'stcpay'; total: number
    items: { id: number; name: string; price: number; emoji: string; qty: number }[]
}

export default function PaymentResultPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [order, setOrder] = useState<Order | null>(null)

    const search = useMemo(() => new URLSearchParams(window.location.search), [])
    const paymentId = search.get('id') ?? ''
    const status = search.get('status') ?? ''
    const message = search.get('message') ?? ''

    useEffect(() => {
        async function verify() {
            try {
                if (!paymentId) throw new Error('Missing payment ID in callback URL.')
                const pendingRaw = sessionStorage.getItem('pendingCheckout')
                if (!pendingRaw) throw new Error('Pending checkout data was not found.')
                const pendingOrder = JSON.parse(pendingRaw) as CreateOrderRequest
                const createdOrder = await api.verifyPaymentAndCreateOrder({ paymentId, order: pendingOrder })
                setOrder(createdOrder)
                const existingRecent = localStorage.getItem('recent-orders')
                const parsedRecent: RecentOrder[] = existingRecent ? JSON.parse(existingRecent) : []
                const recentEntry: RecentOrder = {
                    id: createdOrder.id, createdAt: new Date().toISOString(), name: createdOrder.name,
                    pickup: createdOrder.pickup, paymentMethod: createdOrder.paymentMethod,
                    total: createdOrder.total, items: createdOrder.items
                }
                localStorage.setItem('recent-orders', JSON.stringify([recentEntry, ...parsedRecent].slice(0, 5)))
                sessionStorage.removeItem('pendingCheckout')
                sessionStorage.removeItem('checkoutPriceMap')
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Payment verification failed')
            } finally { setLoading(false) }
        }
        if (status && status !== 'paid') { setError(message || `Payment status: ${status}`); setLoading(false); return }
        verify()
    }, [message, paymentId, status])

    const commonStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .pr-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; }
        .pr-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media(max-width:900px){ .pr-grid { grid-template-columns: 1fr; } }
        @media(max-width:600px){ .pr-info-grid { grid-template-columns: 1fr; } }
    `

    return (
        <div style={{ minHeight: '100vh', background: '#faf6f0', fontFamily: "'DM Sans', sans-serif" }}>
            <style>{commonStyles}</style>

            {/* Dark header */}
            <div style={{ background: '#1a0f0a', padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,40px)', borderBottom: '1px solid rgba(192,125,64,0.2)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%,rgba(192,125,64,0.15),transparent 55%)', pointerEvents: 'none' }} />
                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                    <Link to="/" style={{ color: '#f5e0c0', textDecoration: 'none', fontWeight: 900, fontSize: 'clamp(15px,2vw,19px)', fontFamily: "'Cormorant Garamond',serif" }}>☕ For Friends Café</Link>
                    {loading ? (
                        <div style={{ marginTop: 28 }}>
                            <Pill text="PROCESSING" color="#c07d40" bg="rgba(192,125,64,0.2)" border="rgba(192,125,64,0.35)" />
                            <h1 style={heroH1}>Verifying your payment...</h1>
                            <p style={heroP}>Please wait while we confirm your payment and create your order.</p>
                        </div>
                    ) : error ? (
                        <div style={{ marginTop: 28 }}>
                            <Pill text="PAYMENT FAILED" color="#f87171" bg="rgba(239,68,68,0.15)" border="rgba(239,68,68,0.3)" />
                            <h1 style={heroH1}>We couldn't complete your order</h1>
                            <p style={heroP}>Your payment did not go through successfully.</p>
                        </div>
                    ) : (
                        <div style={{ marginTop: 28 }}>
                            <Pill text="PAYMENT SUCCESSFUL" color="#4ade80" bg="rgba(34,197,94,0.15)" border="rgba(34,197,94,0.3)" />
                            <h1 style={heroH1}>Your order is confirmed! 🎉</h1>
                            <p style={heroP}>Your payment was successful and your order is now in the kitchen queue.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(14px,3vw,32px) 60px' }}>
                {loading && (
                    <div style={card}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#faf6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>⏳</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: '#1a0f0a', margin: '0 0 10px', textAlign: 'center' }}>Processing...</h2>
                        <p style={{ color: '#7a6458', textAlign: 'center', marginBottom: 28 }}>We are verifying your payment and preparing your order confirmation.</p>
                        <div style={{ height: 6, borderRadius: 999, background: '#f1e6d8', overflow: 'hidden', maxWidth: 320, margin: '0 auto' }}>
                            <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg,#c07d40,#e8a84c)', borderRadius: 999, animation: 'pulse 1.5s ease infinite' }} />
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div style={{ ...card, border: '1px solid #fecaca' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 20px' }}>😕</div>
                        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,4vw,34px)', fontWeight: 900, color: '#991b1b', margin: '0 0 16px', textAlign: 'center' }}>Payment failed</h2>
                        <div style={{ borderRadius: 14, background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', color: '#991b1b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{error}</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Link to="/menu-order" style={{ padding: '12px 24px', borderRadius: 999, background: '#1a0f0a', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 14 }}>Try again →</Link>
                            <Link to="/" style={{ padding: '12px 24px', borderRadius: 999, border: '1px solid #e2d5c3', background: 'white', color: '#1a0f0a', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Back home</Link>
                        </div>
                    </div>
                )}

                {!loading && !error && order && (
                    <div className="pr-grid">
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#7a6458', textTransform: 'uppercase', marginBottom: 6 }}>Order number</div>
                                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,7vw,56px)', fontWeight: 900, color: '#c07d40', lineHeight: 1 }}>#{order.id}</div>
                                </div>
                                <div style={{ borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 18px', flexShrink: 0 }}>
                                    <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#15803d', textTransform: 'uppercase', marginBottom: 4 }}>Payment</div>
                                    <div style={{ fontWeight: 800, color: '#15803d', fontSize: 16 }}>✓ Paid</div>
                                </div>
                            </div>
                            <div className="pr-info-grid" style={{ marginBottom: 24 }}>
                                {[
                                    { label: 'Customer', value: order.name || 'Guest' },
                                    { label: 'Pickup', value: order.pickup },
                                    { label: 'Payment', value: order.paymentMethod },
                                    { label: 'Status', value: order.status },
                                ].map(r => (
                                    <div key={r.label} style={{ borderRadius: 14, background: '#faf6f0', border: '1px solid #e2d5c3', padding: '12px 16px' }}>
                                        <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#7a6458', textTransform: 'uppercase', marginBottom: 4 }}>{r.label}</div>
                                        <div style={{ fontWeight: 700, color: '#1a0f0a', textTransform: 'capitalize', fontSize: 15 }}>{r.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderRadius: 18, background: '#fff8f1', border: '1px solid #e2d5c3', padding: '16px 20px', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1a0f0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>✅</div>
                                    <div>
                                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 900, color: '#1a0f0a', marginBottom: 2 }}>Order placed successfully</div>
                                        <div style={{ fontSize: 13, color: '#7a6458', lineHeight: 1.5 }}>Your order is now in the system and will move through the kitchen shortly.</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button onClick={() => order && navigate(`/track/${order.id}`)}
                                    style={{ padding: '12px 24px', borderRadius: 999, background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 18px rgba(192,125,64,0.4)' }}>
                                    📍 Track Order
                                </button>
                                <Link to="/menu-order" style={{ padding: '12px 22px', borderRadius: 999, border: '1px solid #e2d5c3', background: 'white', color: '#1a0f0a', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>Order More →</Link>
                                <Link to="/" style={{ padding: '12px 22px', borderRadius: 999, border: '1px solid #e2d5c3', background: 'white', color: '#7a6458', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>Back home</Link>
                            </div>
                        </div>

                        <div style={card}>
                            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(20px,3vw,26px)', fontWeight: 900, color: '#1a0f0a', margin: '0 0 18px' }}>Order Summary</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                {order.items.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, background: '#faf6f0', border: '1px solid #e2d5c3', padding: '12px 16px', gap: 10 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: '#1a0f0a', fontSize: 14 }}>{item.emoji} {item.name}</div>
                                            <div style={{ fontSize: 12, color: '#7a6458', marginTop: 2 }}>×{item.qty} · SAR {item.price.toFixed(2)} each</div>
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#1a0f0a', fontSize: 15, flexShrink: 0 }}>SAR {(item.price * item.qty).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderRadius: 18, background: '#1a0f0a', padding: '18px 20px', color: '#f5ede0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'rgba(245,237,224,0.6)', fontSize: 14 }}><span>Subtotal</span><span>SAR {order.subtotal.toFixed(2)}</span></div>
                                {order.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#4ade80', fontSize: 14 }}><span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span><span>−SAR {order.discount.toFixed(2)}</span></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'rgba(245,237,224,0.6)', fontSize: 14 }}><span>Tax</span><span>SAR {order.tax.toFixed(2)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 900, fontSize: 22, fontFamily: "'Cormorant Garamond',serif" }}>
                                    <span>Total</span><span style={{ color: '#c07d40' }}>SAR {order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function Pill({ text, color, bg, border }: { text: string; color: string; bg: string; border: string }) {
    return (
        <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: 999, background: bg, border: `1px solid ${border}`, color, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', marginBottom: 14 }}>{text}</div>
    )
}

const heroH1: React.CSSProperties = { fontSize: 'clamp(26px,5vw,46px)', fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, color: '#f5e0c0', margin: '8px 0 10px', lineHeight: 1.1 }
const heroP: React.CSSProperties = { color: 'rgba(245,220,180,0.55)', fontSize: 'clamp(13px,1.5vw,16px)', margin: 0 }
const card: React.CSSProperties = { borderRadius: 24, background: 'white', border: '1px solid #e2d5c3', padding: 'clamp(20px,3vw,32px)', boxShadow: '0 8px 40px rgba(26,15,10,0.07)' }
