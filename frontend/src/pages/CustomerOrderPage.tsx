import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/4f_logu.png'
import { api, getImageUrl, parseItemSizes, type AppSetting, type Category, type CreateOrderRequest, type MenuItem, type Offer, type OrderItem, type PaymentMethod, type PromoValidateResult } from '../services/api'

type Lang = 'en' | 'ar'
const t = (en: string, ar: string, lang: Lang) => lang === 'ar' ? ar : en
const pickupOptions = ['ASAP', 'In 10 min', 'In 15 min', 'In 20 min', 'In 30 min']
const MOYASAR_PK = 'pk_test_r69giaREyvuD9uEYfExK42oiucTGJnGkM9BpNS6Q'

const CAT_ICONS: Record<string, string> = { hot: '☕', cold: '🧊', tea: '🫖', food: '🍽️', all: '✦' }
const ITEM_BG: Record<string, { bg: string; accent: string }> = {
    hot: { bg: 'radial-gradient(ellipse at 30% 20%, #3a1500 0%, #1a0900 60%, #0d0600 100%)', accent: '#c07d40' },
    cold: { bg: 'radial-gradient(ellipse at 30% 20%, #001830 0%, #00101f 60%, #000a14 100%)', accent: '#4fa3d0' },
    tea: { bg: 'radial-gradient(ellipse at 30% 20%, #0a2210 0%, #051508 60%, #020e04 100%)', accent: '#5ea86a' },
    food: { bg: 'radial-gradient(ellipse at 30% 20%, #251000 0%, #160900 60%, #0a0500 100%)', accent: '#d4943a' },
}

type SizeOption = { label: string; labelAr?: string; price: number }

function buildTokenHtml(orderId: string, customerName: string, pickup: string) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Token ${orderId}</title><style>body{font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#faf6f0}.card{width:340px;border:2px dashed #c07d40;border-radius:24px;background:white;padding:32px;text-align:center}.id{font-size:48px;font-weight:800;color:#1a0f0a}.meta{color:#7a6458;margin-top:10px}.badge{display:inline-block;margin-top:18px;padding:8px 14px;border-radius:999px;background:#fff3e0;color:#c07d40;font-weight:700}</style></head><body><div class="card"><div style="font-size:42px">🎟️</div><h1>Pickup Token</h1><div class="id">#${orderId}</div><div class="meta">${customerName || 'Customer'}<br/>${pickup}</div><div class="badge">Show this token at pickup</div></div></body></html>`
}
function downloadToken(orderId: string, customerName: string, pickup: string) {
    const blob = new Blob([buildTokenHtml(orderId, customerName, pickup)], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `token-${orderId}.html`; a.click()
    URL.revokeObjectURL(url)
}

type Review = { itemId: number; stars: number; text: string; date: string; orderId: string }
function getReviews(): Review[] { try { return JSON.parse(localStorage.getItem('ff-reviews') || '[]') } catch { return [] } }
function saveReview(r: Review) {
    const all = getReviews().filter(x => !(x.itemId === r.itemId && x.orderId === r.orderId))
    localStorage.setItem('ff-reviews', JSON.stringify([r, ...all]))
}
function hasOrdered(itemId: number): boolean {
    try {
        const orders = JSON.parse(localStorage.getItem('recent-orders') || '[]')
        return orders.some((o: any) => o.items?.some((i: any) => i.id === itemId))
    } catch { return false }
}

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
    return (
        <span style={{ display: 'inline-flex', gap: 1 }}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ fontSize: size, color: s <= rating ? '#d4943a' : 'rgba(212,148,58,0.15)', lineHeight: 1 }}>★</span>
            ))}
        </span>
    )
}

function ItemModal({ item, lang, onClose, onAdd }: {
    item: MenuItem; lang: Lang
    onClose: () => void
    onAdd: (item: MenuItem, size: SizeOption | null) => void
}) {
    const sizes = parseItemSizes(item)
    const [selected, setSelected] = useState<SizeOption | null>(sizes.length > 0 ? sizes[0] : null)
    const [tab, setTab] = useState<'order' | 'reviews'>('order')
    const [stars, setStars] = useState(5)
    const [hoverStar, setHoverStar] = useState(0)
    const [reviewText, setReviewText] = useState('')
    const [reviews, setReviews] = useState<Review[]>(() => getReviews().filter(r => r.itemId === item.id))
    const [submitted, setSubmitted] = useState(false)
    const imgUrl = getImageUrl(item.imageUrl)
    const canReview = hasOrdered(item.id)
    const avgStars = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : null
    const palette = ITEM_BG[item.cat] || ITEM_BG.hot

    function submitReview() {
        const orders = JSON.parse(localStorage.getItem('recent-orders') || '[]')
        const orderId = orders.find((o: any) => o.items?.some((i: any) => i.id === item.id))?.id || 'unknown'
        const r: Review = { itemId: item.id, stars, text: reviewText.trim(), date: new Date().toLocaleDateString(), orderId }
        saveReview(r)
        setReviews(getReviews().filter(r => r.itemId === item.id))
        setSubmitted(true)
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', padding: '16px' }}
            onClick={onClose}>
            <div style={{
                background: '#0d0a07',
                borderRadius: 12,
                width: '100%',
                maxWidth: 480,
                border: '1px solid rgba(192,125,64,0.2)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(192,125,64,0.06)',
                maxHeight: 'calc(100vh - 32px)',
                overflowY: 'auto',
                animation: 'popIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
                position: 'relative',
            }} onClick={e => e.stopPropagation()}>

                {/* Image Header */}
                <div style={{ height: 'clamp(180px, 35vw, 260px)', background: palette.bg, position: 'relative', overflow: 'hidden' }}>
                    {imgUrl && <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
                    {!imgUrl && (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.3, filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}>
                            {item.emoji}
                        </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(13,10,7,0.98) 100%)' }} />

                    {/* Close */}
                    <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 2, border: '1px solid rgba(237,224,204,0.15)', background: 'rgba(7,5,3,0.7)', color: 'rgba(237,224,204,0.6)', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center', backdropFilter: 'blur(8px)' }}>✕</button>

                    {/* Rating badge */}
                    {avgStars && (
                        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 12px', borderRadius: 2, background: 'rgba(7,5,3,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(192,125,64,0.25)', fontSize: 11, fontWeight: 600, color: palette.accent, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Jost', sans-serif", letterSpacing: '0.06em' }}>
                            ★ {avgStars} <span style={{ color: 'rgba(237,224,204,0.3)', fontWeight: 300 }}>({reviews.length})</span>
                        </div>
                    )}

                    {/* Title overlaid on image */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 20px' }}>
                        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(22px,5vw,28px)', fontWeight: 400, color: '#ede0cc', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                            {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                        </div>
                        {item.calories > 0 && (
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: 'rgba(237,224,204,0.3)', marginTop: 4, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                {item.calories} cal
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(192,125,64,0.1)', padding: '0 24px' }}>
                    {(['order', 'reviews'] as const).map(tb => {
                        const isReviewsTab = tb === 'reviews'
                        return (
                            <button
                                key={tb}
                                onClick={() => setTab(tb)}
                                style={{
                                    flex: 1, padding: '14px 0', border: 'none',
                                    background: 'transparent',
                                    color: tab === tb ? '#c07d40' : 'rgba(237,224,204,0.35)',
                                    fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 11,
                                    letterSpacing: '0.14em', textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    borderBottom: `2px solid ${tab === tb ? '#c07d40' : 'transparent'}`,
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                }}>
                                {tb === 'order'
                                    ? t('Order', 'الطلب', lang)
                                    : (
                                        <>
                                            {t('Reviews', 'التقييمات', lang)}
                                            {reviews.length > 0 ? ` (${reviews.length})` : ''}
                                        </>
                                    )
                                }
                            </button>
                        )
                    })}
                </div>

                <div style={{ padding: '20px 24px 28px' }}>
                    {/* ORDER TAB */}
                    {tab === 'order' && (
                        <div>
                            {(lang === 'ar' ? item.descAr : item.desc) && (
                                <p style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 16, color: 'rgba(237,224,204,0.45)', lineHeight: 1.7, margin: '0 0 20px', fontWeight: 400 }}>
                                    {lang === 'ar' ? item.descAr : item.desc}
                                </p>
                            )}

                            {sizes.length > 0 ? (
                                <>
                                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 700, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
                                        {t('Select Size', 'اختر الحجم', lang)}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                        {sizes.map((s, i) => (
                                            <button key={i} onClick={() => setSelected(s)}
                                                style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '13px 16px', borderRadius: 2,
                                                    border: `1px solid ${selected?.label === s.label ? 'rgba(192,125,64,0.5)' : 'rgba(237,224,204,0.07)'}`,
                                                    background: selected?.label === s.label ? 'rgba(192,125,64,0.08)' : 'rgba(255,255,255,0.02)',
                                                    color: selected?.label === s.label ? '#ede0cc' : 'rgba(237,224,204,0.4)',
                                                    cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 13,
                                                    transition: 'all 0.2s',
                                                }}>
                                                <span style={{ letterSpacing: '0.04em' }}>{lang === 'ar' && s.labelAr ? s.labelAr : s.label}</span>
                                                <span style={{ color: palette.accent, fontFamily: "'Cormorant', serif", fontSize: 17, fontWeight: 600 }}>SAR {s.price.toFixed(2)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div style={{ marginBottom: 20, padding: '13px 16px', borderRadius: 2, border: '1px solid rgba(237,224,204,0.07)', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                                    <span style={{ color: 'rgba(237,224,204,0.4)', fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: '0.08em' }}>{t('Price', 'السعر', lang)}</span>
                                    <span style={{ color: palette.accent, fontFamily: "'Cormorant', serif", fontSize: 20, fontWeight: 600 }}>SAR {item.price.toFixed(2)}</span>
                                </div>
                            )}

                            <button onClick={() => { onAdd(item, selected); onClose() }}
                                className="ff-modal-cta"
                                style={{
                                    width: '100%', padding: '14px', borderRadius: 2, border: 'none',
                                    background: 'linear-gradient(135deg, #c07d40, #8b4f1c)',
                                    color: 'white', fontFamily: "'Jost', sans-serif", fontWeight: 600,
                                    fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase',
                                    cursor: 'pointer', boxShadow: '0 6px 28px rgba(192,125,64,0.35)',
                                    transition: 'opacity 0.2s, transform 0.2s, box-shadow 0.2s',
                                }}>
                                {t('Add to Cart', 'أضف للسلة', lang)} — SAR {(selected?.price ?? item.price).toFixed(2)}
                            </button>
                        </div>
                    )}

                    {/* REVIEWS TAB — everyone can see reviews; only ordered customers can write */}
                    {tab === 'reviews' && (
                        <div>
                            {/* Write a review — only if customer has ordered this item */}
                            {canReview && !submitted && (
                                <div style={{ marginBottom: 24, padding: '18px', borderRadius: 2, border: '1px solid rgba(192,125,64,0.15)', background: 'rgba(192,125,64,0.03)' }}>
                                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 700, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12 }}>
                                        {t('Your Review', 'تقييمك', lang)}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s}
                                                onClick={() => setStars(s)}
                                                onMouseEnter={() => setHoverStar(s)}
                                                onMouseLeave={() => setHoverStar(0)}
                                                style={{ fontSize: 26, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: s <= (hoverStar || stars) ? '#d4943a' : 'rgba(212,148,58,0.15)', transition: 'color 0.15s, transform 0.15s', transform: s <= (hoverStar || stars) ? 'scale(1.15)' : 'scale(1)' }}>★</button>
                                        ))}
                                    </div>
                                    <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                                        placeholder={t('Tell us about this item...', 'شاركنا رأيك...', lang)}
                                        rows={3}
                                        style={{ width: '100%', borderRadius: 2, border: '1px solid rgba(192,125,64,0.15)', padding: '11px 14px', fontSize: 13, fontFamily: "'Jost', sans-serif", fontWeight: 300, background: 'rgba(255,255,255,0.03)', color: '#ede0cc', outline: 'none', resize: 'none', lineHeight: 1.65, boxSizing: 'border-box' }} />
                                    <button onClick={submitReview}
                                        style={{ marginTop: 12, width: '100%', padding: '12px', borderRadius: 2, border: 'none', background: reviewText.trim() ? 'linear-gradient(135deg,#c07d40,#8b4f1c)' : 'rgba(255,255,255,0.05)', color: reviewText.trim() ? 'white' : 'rgba(237,224,204,0.2)', fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: reviewText.trim() ? 'pointer' : 'default' }}>
                                        {t('Submit Review', 'إرسال التقييم', lang)}
                                    </button>
                                </div>
                            )}
                            {canReview && submitted && (
                                <div style={{ color: 'rgba(94,168,106,0.9)', fontSize: 13, marginBottom: 20, fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: '0.04em', padding: '12px 14px', border: '1px solid rgba(94,168,106,0.2)', borderRadius: 2, background: 'rgba(94,168,106,0.05)' }}>
                                    ✦ {t('Review submitted — thank you.', 'تم إرسال التقييم — شكراً لك.', lang)}
                                </div>
                            )}
                            {!canReview && (
                                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 2, border: '1px solid rgba(192,125,64,0.1)', background: 'rgba(192,125,64,0.04)', fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(237,224,204,0.35)', letterSpacing: '0.04em', textAlign: 'center' }}>
                                    ☕ {t('Order this item to leave a review', 'اطلب هذا الصنف لتتمكن من التقييم', lang)}
                                </div>
                            )}

                            {/* Reviews list — visible to everyone */}
                            {reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '28px 0', color: 'rgba(237,224,204,0.2)', fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 16 }}>
                                    {t('No reviews yet — be the first.', 'لا توجد تقييمات بعد.', lang)}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {reviews.map((r, i) => (
                                        <div key={i} style={{ padding: '14px 16px', borderRadius: 2, border: '1px solid rgba(192,125,64,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <StarRating rating={r.stars} size={12} />
                                                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: 'rgba(237,224,204,0.25)', letterSpacing: '0.06em' }}>{r.date}</span>
                                            </div>
                                            {r.text && <div style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 15, color: 'rgba(237,224,204,0.5)', lineHeight: 1.65 }}>"{r.text}"</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function CartDrawer({ cart, lang, total, subtotal, discount, tax, taxRate, promoInput, promoResult, promoError, promoLoading, name, phone, notes, pickup, paymentMethod, setPaymentMethod, submitting, onClose, setPromoInput, setPromoError, applyPromo, changeQty, setName, setPhone, setNotes, setPickup, placeOrder, clearCart }: any) {

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(16px)' }} onClick={onClose} />
            <div style={{
                position: 'relative', background: '#0a0705',
                borderRadius: '16px 16px 0 0',
                border: '1px solid rgba(192,125,64,0.18)', borderBottom: 'none',
                maxHeight: '92vh', overflowY: 'auto',
                animation: 'slideUp 0.32s cubic-bezier(0.16,1,0.3,1) both',
                boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
                width: '100%', maxWidth: 520,
            }}>
                <div style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(192,125,64,0.2)', margin: '14px auto 6px' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 20px 12px', borderBottom: '1px solid rgba(192,125,64,0.08)' }}>
                    <h2 style={{ margin: 0, fontFamily: "'Cormorant', serif", fontSize: 26, fontWeight: 400, color: '#ede0cc', letterSpacing: '-0.01em' }}>
                        {t('Your Cart', 'سلتك', lang)}
                    </h2>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 2, border: '1px solid rgba(237,224,204,0.1)', background: 'transparent', color: 'rgba(237,224,204,0.4)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>×</button>
                </div>

                <div style={{ padding: '12px 20px 40px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(237,224,204,0.2)' }}>
                            <div style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 22, marginBottom: 8 }}>Your cart is empty</div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 12, color: 'rgba(237,224,204,0.15)', letterSpacing: '0.06em' }}>{t('Add something beautiful', 'أضف شيئاً رائعاً', lang)}</div>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                                {cart.map((item: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 2, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(192,125,64,0.08)' }}>
                                        <span style={{ fontSize: 18, flexShrink: 0, opacity: 0.7 }}>{item.emoji || '☕'}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 13, color: '#ede0cc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' }}>{item.name}</div>
                                            <div style={{ fontFamily: "'Cormorant', serif", fontSize: 15, color: '#c07d40', fontWeight: 600, marginTop: 1 }}>SAR {(item.price * item.qty).toFixed(2)}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <button onClick={() => changeQty(item.name, -1)} style={qtyBtnStyle}>−</button>
                                            <span style={{ fontFamily: "'Cormorant', serif", fontWeight: 600, minWidth: 20, textAlign: 'center', fontSize: 16, color: '#ede0cc' }}>{item.qty}</span>
                                            <button onClick={() => changeQty(item.name, 1)} style={qtyBtnStyle}>+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                                <input value={promoInput} onChange={(e: any) => { setPromoInput(e.target.value); setPromoError('') }}
                                    placeholder={t('Promo code', 'كود الخصم', lang)}
                                    style={cartInputStyle} />
                                <button onClick={applyPromo} style={{ padding: '10px 16px', borderRadius: 2, border: '1px solid rgba(192,125,64,0.2)', background: 'transparent', color: '#c07d40', fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
                                    {promoLoading ? '…' : t('Apply', 'تطبيق', lang)}
                                </button>
                            </div>
                            {promoError && <div style={{ color: 'rgba(248,113,113,0.8)', fontSize: 11, fontFamily: "'Jost', sans-serif", marginBottom: 8, letterSpacing: '0.04em' }}>{promoError}</div>}
                            {promoResult && <div style={{ color: 'rgba(74,222,128,0.8)', fontSize: 11, fontFamily: "'Jost', sans-serif", marginBottom: 8, letterSpacing: '0.04em' }}>✦ {promoResult.message}</div>}

                            {/* Totals */}
                            <div style={{ borderTop: '1px solid rgba(192,125,64,0.08)', paddingTop: 14, marginBottom: 20 }}>
                                <TRow label={t('Subtotal', 'المجموع', lang)} value={`SAR ${subtotal.toFixed(2)}`} />
                                {discount > 0 && <TRow label={`Discount (${promoResult?.code})`} value={`−SAR ${discount.toFixed(2)}`} green />}
                                <TRow label={`Tax (${taxRate}%)`} value={`SAR ${tax.toFixed(2)}`} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 12, borderTop: '1px solid rgba(192,125,64,0.08)' }}>
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 13, color: 'rgba(237,224,204,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Total</span>
                                    <span style={{ fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 600, color: '#c07d40' }}>SAR {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Fields */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                                <input value={name} onChange={(e: any) => setName(e.target.value)} placeholder={t('Your name *', 'الاسم *', lang)} style={cartInputStyle} />
                                <input value={phone} onChange={(e: any) => setPhone(e.target.value)} placeholder={t('Phone number *', 'رقم الجوال *', lang)} style={cartInputStyle} />
                                <textarea value={notes} onChange={(e: any) => setNotes(e.target.value)} placeholder={t('Notes for kitchen', 'ملاحظات', lang)} rows={2} style={{ ...cartInputStyle, resize: 'none' }} />

                                <div>
                                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 700, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
                                        {t('Pickup Time', 'وقت الاستلام', lang)}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {pickupOptions.map((opt: string) => (
                                            <button key={opt} onClick={() => setPickup(opt)}
                                                style={{ padding: '7px 12px', borderRadius: 2, border: `1px solid ${pickup === opt ? 'rgba(192,125,64,0.5)' : 'rgba(192,125,64,0.12)'}`, background: pickup === opt ? 'rgba(192,125,64,0.1)' : 'transparent', color: pickup === opt ? '#c07d40' : 'rgba(237,224,204,0.35)', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 11, letterSpacing: '0.04em', transition: 'all 0.2s' }}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 700, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
                                        {t('Payment', 'الدفع', lang)}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {(['pickup', 'creditcard'] as PaymentMethod[]).map((method: PaymentMethod) => (
                                            <button key={method} onClick={() => setPaymentMethod(method)}
                                                style={{ flex: 1, padding: '11px 6px', borderRadius: 2, border: `1px solid ${paymentMethod === method ? 'rgba(192,125,64,0.45)' : 'rgba(192,125,64,0.1)'}`, background: paymentMethod === method ? 'rgba(192,125,64,0.08)' : 'transparent', color: paymentMethod === method ? '#c07d40' : 'rgba(237,224,204,0.35)', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '0.06em', transition: 'all 0.2s' }}>
                                                {method === 'pickup' ? '💵 Cash' : '💳 Card'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {paymentMethod !== 'pickup' && (
                                    <div style={{ marginTop: 8, padding: '12px 14px', borderRadius: 2, border: '1px solid rgba(192,125,64,0.15)', background: 'rgba(192,125,64,0.04)', fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(237,224,204,0.45)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 16 }}>{paymentMethod === 'stcpay' ? '📱' : '💳'}</span>
                                        <span>{paymentMethod === 'stcpay' ? 'Enter your STC Pay number on the next screen' : 'Mada · Visa · Mastercard accepted on next screen'}</span>
                                    </div>
                                )}
                            </div>

                            <button onClick={placeOrder} disabled={submitting || !name.trim() || !phone.trim()}
                                style={{ width: '100%', borderRadius: 2, padding: '15px', border: 'none', background: submitting || !name.trim() || !phone.trim() ? 'rgba(192,125,64,0.08)' : 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: submitting || !name.trim() || !phone.trim() ? 'rgba(237,224,204,0.2)' : 'white', fontFamily: "'Jost', sans-serif", fontWeight: 600, cursor: submitting || !name.trim() || !phone.trim() ? 'default' : 'pointer', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', boxShadow: submitting || !name.trim() || !phone.trim() ? 'none' : '0 6px 32px rgba(192,125,64,0.4)', marginBottom: 10, transition: 'opacity 0.2s' }}>
                                {submitting ? t('Processing…', 'جاري المعالجة…', lang) : paymentMethod === 'pickup' ? `${t('Place Order', 'اطلب الآن', lang)} — SAR ${total.toFixed(2)}` : `${t('Proceed to Payment', 'الدفع الآن', lang)} — SAR ${total.toFixed(2)}`}
                            </button>

                            <button onClick={clearCart}
                                style={{ width: '100%', padding: '10px', borderRadius: 2, border: '1px solid rgba(192,125,64,0.1)', background: 'transparent', color: 'rgba(237,224,204,0.25)', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                {t('Clear cart', 'مسح السلة', lang)}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function CustomerOrderPage() {
    const navigate = useNavigate()
    const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('ff-lang') as Lang) || 'en')
    const isRTL = lang === 'ar'
    const [categories, setCategories] = useState<Category[]>([])
    const [menu, setMenu] = useState<MenuItem[]>([])
    const [offers, setOffers] = useState<Offer[]>([])
    const [settings, setSettings] = useState<AppSetting | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [cart, setCart] = useState<OrderItem[]>(() => { try { return JSON.parse(localStorage.getItem('customer-cart') || '[]') } catch { return [] } })
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [notes, setNotes] = useState('')
    const [pickup, setPickup] = useState('ASAP')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pickup')
    const [promoInput, setPromoInput] = useState('')
    const [promoResult, setPromoResult] = useState<PromoValidateResult | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [promoLoading, setPromoLoading] = useState(false)
    const [promoError, setPromoError] = useState('')
    const [addedId, setAddedId] = useState<number | null>(null)
    const [modalItem, setModalItem] = useState<MenuItem | null>(null)
    const [cartOpen, setCartOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { localStorage.setItem('ff-lang', lang) }, [lang])
    useEffect(() => { localStorage.setItem('customer-cart', JSON.stringify(cart)) }, [cart])
    useEffect(() => { const saved = localStorage.getItem('customer-info'); if (saved) try { const p = JSON.parse(saved); setName(p.name || ''); setPhone(p.phone || '') } catch { } }, [])
    useEffect(() => { localStorage.setItem('customer-info', JSON.stringify({ name, phone })) }, [name, phone])

    useEffect(() => {
        const s = document.createElement('script'); s.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'; document.head.appendChild(s)
        const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'; document.head.appendChild(l)
    }, [])

    useEffect(() => {
        Promise.all([api.getMenu(), api.getActiveOffers(), api.getSettings(), api.getCategories()])
            .then(([m, o, s, c]) => { setMenu(m.filter((x: MenuItem) => x.avail)); setOffers(o); setSettings(s); setCategories(c.filter((x: Category) => x.active)) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const filteredMenu = useMemo(() => menu.filter(item =>
        (selectedCategory === 'all' || item.cat === selectedCategory) &&
        (`${item.name} ${item.nameAr} ${item.desc} ${item.descAr}`).toLowerCase().includes(search.toLowerCase())
    ), [menu, selectedCategory, search])

    const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])
    const discount = promoResult ? Math.round(subtotal * promoResult.discountPercent) / 100 : 0
    const taxRate = settings?.taxPercent ?? 15
    const tax = Math.round((subtotal - discount) * taxRate) / 100
    const total = subtotal - discount + tax
    const totalCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])
    const footerText = lang === 'ar' ? (settings?.editableFooterAr || '© 2026 فور فريندز كافيه') : (settings?.editableFooterEn || '© 2026 For Friends Café')

    function handleAddToCart(item: MenuItem, size: SizeOption | null) {
        const price = size ? size.price : item.price
        const sizeName = size ? ` (${size.label})` : ''
        const fullName = item.name + sizeName
        setCart(cur => {
            const ex = cur.find(x => x.name === fullName)
            return ex ? cur.map(x => x.name === fullName ? { ...x, qty: x.qty + 1 } : x) : [...cur, { id: item.id, name: fullName, price, emoji: item.emoji, qty: 1 }]
        })
        setAddedId(item.id); setTimeout(() => setAddedId(null), 900)
    }

    function changeQty(name: string, delta: number) { setCart(cur => cur.map(x => x.name === name ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0)) }
    function clearCart() { setCart([]); setPromoInput(''); setPromoResult(null); localStorage.removeItem('customer-cart') }

    async function applyPromo() {
        if (!promoInput.trim()) return
        setPromoLoading(true); setPromoError('')
        try { setPromoResult(await api.validatePromo(promoInput.trim(), subtotal)) }
        catch (e) { setPromoError(e instanceof Error ? e.message : 'Invalid code') }
        finally { setPromoLoading(false) }
    }

    async function placeOrder() {
        if (cart.length === 0) return
        if (!name.trim()) { alert(t('Please enter your name', 'يرجى إدخال اسمك', lang)); return }
        if (!phone.trim()) { alert(t('Please enter your phone number', 'يرجى إدخال رقم جوالك', lang)); return }

        // For card/STC: store pending checkout and redirect to dedicated payment page
        if (paymentMethod === 'creditcard' || paymentMethod === 'stcpay') {
            const pendingOrder: CreateOrderRequest & { total: number } = {
                name: name.trim(), phone: phone.trim(), notes: notes.trim(),
                pickup, paymentMethod, promoCode: promoResult?.code || '',
                items: cart.map(x => ({ id: x.id, qty: x.qty })),
                total,
            }
            sessionStorage.setItem('pendingCheckout', JSON.stringify(pendingOrder))
            // Also store price map for fallback
            const priceMap: Record<string, number> = {}
            cart.forEach(x => { priceMap[String(x.id)] = x.price })
            sessionStorage.setItem('checkoutPriceMap', JSON.stringify(priceMap))
            navigate(`/payment?method=${paymentMethod}`)
            return
        }

        // Cash/pickup flow — create order immediately
        setSubmitting(true)
        const body: CreateOrderRequest = {
            name: name.trim(), phone: phone.trim(), notes: notes.trim(),
            pickup, paymentMethod: 'pickup', promoCode: promoResult?.code || '',
            items: cart.map(x => ({ id: x.id, qty: x.qty })),
        }
        try {
            const created = await api.createOrder(body)
            const recent = [
                { id: created.id, createdAt: new Date().toISOString(), name: created.name, pickup: created.pickup, paymentMethod: created.paymentMethod, total: created.total, items: created.items },
                ...(JSON.parse(localStorage.getItem('recent-orders') || '[]'))
            ].slice(0, 5)
            localStorage.setItem('recent-orders', JSON.stringify(recent))
            downloadToken(created.id, created.name, created.pickup)
            clearCart(); setNotes(''); setPickup('ASAP'); setCartOpen(false)
            navigate(`/track/${created.id}`)
        } catch (e) { alert(e instanceof Error ? e.message : 'Failed to place order') }
        finally { setSubmitting(false) }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function handleMoyasarComplete(_payment: any) {
        // No longer used — payment is handled via redirect to /payment page
    }

    const allCategories = [
        { key: 'all', name: t('All', 'الكل', lang), nameAr: 'الكل' },
        ...categories.map(c => ({ key: c.key, name: c.name, nameAr: c.nameAr }))
    ]

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: '#070503', color: '#ede0cc', fontFamily: "'Gilda Display', 'Playfair Display', Georgia, serif", overflowX: 'hidden' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Gilda+Display&family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                body { margin: 0; }
                ::selection { background: rgba(192,125,64,0.3); color: #f5e0c0; }

                @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes slideUp  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
                @keyframes popIn    { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
                @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }

                ::-webkit-scrollbar { width: 2px; }
                ::-webkit-scrollbar-thumb { background: rgba(192,125,64,0.25); }

                input::placeholder, textarea::placeholder { color: rgba(237,224,204,0.2); font-family: 'Jost', sans-serif; font-weight: 300; }
                input:focus, textarea:focus { border-color: rgba(192,125,64,0.4) !important; outline: none; }
                button { touch-action: manipulation; }

                .ff-nav-link {
                    color: rgba(237,224,204,0.45);
                    text-decoration: none;
                    font-family: 'Jost', sans-serif;
                    font-weight: 500;
                    font-size: 11px;
                    letter-spacing: 0.14em;
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
                    padding: 10px 24px;
                    border-radius: 2px;
                    background: linear-gradient(135deg, #c07d40, #8b4f1c);
                    color: white;
                    text-decoration: none;
                    font-family: 'Jost', sans-serif;
                    font-weight: 600;
                    font-size: 11px;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.25s, transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 20px rgba(192,125,64,0.3);
                }
                .ff-pill-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(192,125,64,0.5); }

                .ff-cat-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 7px 16px;
                    border-radius: 2px;
                    border: 1px solid rgba(192,125,64,0.15);
                    background: transparent;
                    color: rgba(237,224,204,0.4);
                    cursor: pointer;
                    font-family: 'Jost', sans-serif; font-weight: 500; font-size: 11px;
                    letter-spacing: 0.1em; text-transform: uppercase;
                    white-space: nowrap; flex-shrink: 0;
                    transition: all 0.2s;
                }
                .ff-cat-btn.active {
                    border-color: rgba(192,125,64,0.5);
                    background: rgba(192,125,64,0.08);
                    color: #c07d40;
                }
                .ff-cat-btn:hover:not(.active) {
                    border-color: rgba(192,125,64,0.3);
                    color: rgba(237,224,204,0.7);
                }

                .ff-menu-card {
                    border-radius: 3px; overflow: hidden;
                    display: flex; flex-direction: column;
                    background: #0d0a07;
                    border: 1px solid rgba(237,224,204,0.05);
                    cursor: pointer;
                    transition: border-color 0.3s, transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s;
                    position: relative;
                }
                .ff-menu-card:hover {
                    border-color: rgba(192,125,64,0.22);
                    transform: translateY(-5px);
                    box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 24px rgba(192,125,64,0.07);
                }
                .ff-menu-card:active { transform: scale(0.98); opacity: 0.85; }
                .ff-menu-card-img { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
                .ff-menu-card:hover .ff-menu-card-img { transform: scale(1.06); }

                .ff-modal-cta:hover { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 10px 36px rgba(192,125,64,0.5) !important; }

                .ff-menu-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                @media (min-width: 600px) { .ff-menu-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
                @media (min-width: 1000px) { .ff-menu-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }

                .cats-row {
                    display: flex; gap: 6px; overflow-x: auto;
                    scrollbar-width: none; -webkit-overflow-scrolling: touch;
                    padding: 0 0 6px;
                }
                .cats-row::-webkit-scrollbar { display: none; }

                .hide-mobile { display: none; }
                @media (min-width: 640px) { .hide-mobile { display: flex; } }

                .shimmer-text {
                    background: linear-gradient(90deg, #c07d40 0%, #f5d49a 30%, #c07d40 50%, #8b4f1c 70%, #c07d40 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer 5s linear infinite;
                }
            `}</style>

            {modalItem && <ItemModal item={modalItem} lang={lang} onClose={() => setModalItem(null)} onAdd={handleAddToCart} />}
            {cartOpen && (
                <CartDrawer
                    cart={cart} lang={lang} total={total} subtotal={subtotal} discount={discount}
                    tax={tax} taxRate={taxRate} promoInput={promoInput} promoResult={promoResult}
                    promoError={promoError} promoLoading={promoLoading} name={name} phone={phone}
                    notes={notes} pickup={pickup} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                    submitting={submitting} onClose={() => setCartOpen(false)}
                    setPromoInput={setPromoInput} setPromoError={setPromoError} applyPromo={applyPromo}
                    changeQty={changeQty} setName={setName} setPhone={setPhone} setNotes={setNotes}
                    setPickup={setPickup} placeOrder={placeOrder} clearCart={clearCart}
                />
            )}

            {/* ═══ NAV ══════════════════════════════════════════════ */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                height: 64,
                background: 'rgba(7,5,3,0.97)',
                backdropFilter: 'blur(24px)',
                borderBottom: '1px solid rgba(192,125,64,0.1)',
            }}>
                <div style={{ maxWidth: 1320, margin: '0 auto', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(14px,4vw,48px)', gap: 16 }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(192,125,64,0.35)', flexShrink: 0 }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Gilda Display', serif", fontSize: 16, color: '#ede0cc', letterSpacing: '0.02em', lineHeight: 1 }}>For Friends</div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 8, color: 'rgba(192,125,64,0.5)', letterSpacing: '0.28em', lineHeight: 1.4, textTransform: 'uppercase' }}>Café · Menu</div>
                        </div>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <Link to="/track/search" className="ff-nav-link hide-mobile">{t('Track Order', 'تتبع طلبك', lang)}</Link>

                        <button
                            onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(237,224,204,0.35)', letterSpacing: '0.15em', padding: '5px 7px', transition: 'color 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#c07d40')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,224,204,0.35)')}>
                            {lang === 'en' ? 'عربي' : 'EN'}
                        </button>

                        {/* Cart button */}
                        <button onClick={() => setCartOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: totalCount > 0 ? '9px 16px' : '9px 18px',
                                borderRadius: 2,
                                background: totalCount > 0 ? 'linear-gradient(135deg, #c07d40, #8b4f1c)' : 'transparent',
                                border: `1px solid ${totalCount > 0 ? 'transparent' : 'rgba(192,125,64,0.2)'}`,
                                color: totalCount > 0 ? 'white' : 'rgba(237,224,204,0.45)',
                                cursor: 'pointer',
                                fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 11,
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                boxShadow: totalCount > 0 ? '0 4px 20px rgba(192,125,64,0.35)' : 'none',
                                transition: 'all 0.25s',
                            }}>
                            {totalCount > 0 ? (
                                <>
                                    <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 1, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{totalCount}</span>
                                    <span>SAR {total.toFixed(2)}</span>
                                </>
                            ) : (
                                <span>🛒 {t('Cart', 'السلة', lang)}</span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ═══ OFFER STRIP ══════════════════════════════════════ */}
            {offers.length > 0 && (
                <div style={{ background: 'rgba(192,125,64,0.06)', borderBottom: '1px solid rgba(192,125,64,0.1)', padding: '9px clamp(14px,4vw,48px)' }}>
                    <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontFamily: "'Jost', sans-serif", fontWeight: 500, letterSpacing: '0.05em' }}>
                        <span style={{ fontSize: 13 }}>{offers[0].emoji}</span>
                        <span style={{ color: '#c07d40', fontWeight: 600 }}>{lang === 'ar' && offers[0].titleAr ? offers[0].titleAr : offers[0].title}</span>
                        <span style={{ color: 'rgba(192,125,64,0.35)' }}>·</span>
                        <span style={{ color: 'rgba(237,224,204,0.35)' }}>{lang === 'ar' && offers[0].subtitleAr ? offers[0].subtitleAr : offers[0].subtitle}</span>
                    </div>
                </div>
            )}

            {/* ═══ MAIN CONTENT ════════════════════════════════════ */}
            <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(14px,4vw,48px) 120px' }}>

                {/* Page header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ animation: 'fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: '0.3em', color: 'rgba(192,125,64,0.5)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                            {t('Crafted to Order', 'محضّر عند الطلب', lang)}
                        </div>
                        <h1 style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(32px,6vw,52px)', fontWeight: 400, color: '#ede0cc', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {t('Our ', 'قائمتنا', lang)}<span className="shimmer-text">{t('Menu', '', lang)}</span>
                        </h1>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative', flexShrink: 0, animation: 'fadeUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both', animationFillMode: 'both' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(237,224,204,0.2)', pointerEvents: 'none' }}>✦</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={t('Search menu…', 'ابحث في القائمة…', lang)}
                            style={{ width: 220, borderRadius: 2, border: '1px solid rgba(192,125,64,0.15)', padding: '9px 12px 9px 28px', fontSize: 12, fontFamily: "'Jost', sans-serif", fontWeight: 400, letterSpacing: '0.04em', background: 'rgba(255,255,255,0.03)', color: '#ede0cc', outline: 'none', transition: 'border-color 0.2s' }} />
                    </div>
                </div>

                {/* Category filters */}
                <div className="cats-row" style={{ marginBottom: 28 }}>
                    {allCategories.map(cat => {
                        const isActive = selectedCategory === cat.key
                        return (
                            <button key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`ff-cat-btn${isActive ? ' active' : ''}`}>
                                <span style={{ fontSize: 13 }}>{CAT_ICONS[cat.key] || '✦'}</span>
                                {lang === 'ar' && cat.nameAr ? cat.nameAr : cat.name}
                            </button>
                        )
                    })}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'rgba(192,125,64,0.2)', marginBottom: 24 }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(192,125,64,0.15), transparent)' }} />
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(192,125,64,0.3)' }}>
                        {filteredMenu.length} {t('items', 'صنف', lang)}
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(192,125,64,0.15))' }} />
                </div>

                {/* Menu grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(237,224,204,0.2)' }}>
                        <div style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 22, marginBottom: 8 }}>
                            {t('Preparing the menu…', 'جاري تحضير القائمة…', lang)}
                        </div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 11, color: 'rgba(237,224,204,0.15)', letterSpacing: '0.15em' }}>
                            ☕
                        </div>
                    </div>
                ) : (
                    <div className="ff-menu-grid">
                        {filteredMenu.map((item, idx) => {
                            const justAdded = addedId === item.id
                            const imgUrl = getImageUrl(item.imageUrl)
                            const sizes = parseItemSizes(item)
                            const hasMultipleSizes = sizes.length > 1
                            const displayPrice = sizes.length > 0 ? `from SAR ${Math.min(...sizes.map(s => s.price)).toFixed(2)}` : `SAR ${item.price.toFixed(2)}`
                            const inCart = cart.filter(x => x.id === item.id).reduce((s, x) => s + x.qty, 0)
                            const palette = ITEM_BG[item.cat] || ITEM_BG.hot

                            return (
                                <div key={item.id} className="ff-menu-card"
                                    onClick={() => setModalItem(item)}
                                    style={{ animation: `fadeUp 0.5s ${idx * 0.04}s cubic-bezier(0.22,1,0.36,1) both`, animationFillMode: 'both' }}>

                                    {/* Image */}
                                    <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', flexShrink: 0, background: palette.bg }}>
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={item.name} loading="lazy" decoding="async"
                                                className="ff-menu-card-img"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                                        ) : (
                                            <div className="ff-menu-card-img" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(32px,6vw,48px)', opacity: 0.25, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))' }}>
                                                {item.emoji}
                                            </div>
                                        )}

                                        {/* Gradient overlay */}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 45%, rgba(13,10,7,0.95) 100%)' }} />

                                        {/* Price badge */}
                                        <div style={{ position: 'absolute', top: 8, right: isRTL ? 'auto' : 8, left: isRTL ? 8 : 'auto', padding: '4px 10px', borderRadius: 2, background: 'rgba(7,5,3,0.82)', backdropFilter: 'blur(12px)', border: '1px solid rgba(192,125,64,0.22)', fontFamily: "'Cormorant', serif", fontSize: 13, fontWeight: 600, color: palette.accent, letterSpacing: '0.02em' }}>
                                            {displayPrice}
                                        </div>

                                        {/* Cart badge */}
                                        {inCart > 0 && (
                                            <div style={{ position: 'absolute', top: 8, left: isRTL ? 'auto' : 8, right: isRTL ? 8 : 'auto', width: 20, height: 20, borderRadius: 2, background: '#c07d40', display: 'grid', placeItems: 'center', fontFamily: "'Jost', sans-serif", fontSize: 10, fontWeight: 700, color: 'white' }}>{inCart}</div>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div style={{ padding: '10px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ fontFamily: "'Cormorant', serif", fontSize: 'clamp(14px,2.5vw,17px)', fontWeight: 500, color: '#ede0cc', lineHeight: 1.2, letterSpacing: '0.01em' }}>
                                            {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                                        </div>

                                        <button onClick={e => { e.stopPropagation(); setModalItem(item) }}
                                            style={{
                                                width: '100%', borderRadius: 2, padding: '9px 0',
                                                background: justAdded
                                                    ? 'rgba(94,168,106,0.15)'
                                                    : 'rgba(192,125,64,0.08)',
                                                border: `1px solid ${justAdded ? 'rgba(94,168,106,0.35)' : 'rgba(192,125,64,0.18)'}` as any,
                                                color: justAdded ? 'rgba(94,168,106,0.9)' : '#c07d40',
                                                fontFamily: "'Jost', sans-serif", fontWeight: 600, cursor: 'pointer',
                                                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                                                transition: 'all 0.2s',
                                            }}>
                                            {justAdded ? '✦ Added' : hasMultipleSizes ? t('Choose Size', 'اختر الحجم', lang) : t('Add to Cart', 'أضف', lang)}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {!loading && filteredMenu.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 24, color: 'rgba(237,224,204,0.2)', marginBottom: 10 }}>
                            {t('Nothing found', 'لا توجد نتائج', lang)}
                        </div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 12, color: 'rgba(237,224,204,0.15)', letterSpacing: '0.1em' }}>
                            {t('Try a different search', 'جرّب بحثاً آخر', lang)}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ FLOATING CART BUTTON ════════════════════════════ */}
            {totalCount > 0 && !cartOpen && (
                <div style={{ position: 'fixed', bottom: 'calc(16px + env(safe-area-inset-bottom,0px))', left: 0, right: 0, zIndex: 400, display: 'flex', justifyContent: 'center', padding: '0 16px', pointerEvents: 'none' }}>
                    <button onClick={() => setCartOpen(true)}
                        style={{ pointerEvents: 'auto', width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 28px', borderRadius: 2, background: 'linear-gradient(135deg, #c07d40, #8b4f1c)', color: 'white', border: 'none', fontFamily: "'Jost', sans-serif", fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 40px rgba(192,125,64,0.55)', whiteSpace: 'nowrap', animation: 'fadeUp 0.3s ease both' }}>
                        <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 1, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{totalCount}</span>
                        {t('View Cart', 'السلة', lang)} · SAR {total.toFixed(2)}
                    </button>
                </div>
            )}

            {/* ═══ FOOTER ══════════════════════════════════════════ */}
            <footer style={{ borderTop: '1px solid rgba(237,224,204,0.04)', padding: '20px clamp(14px,4vw,48px) 28px', textAlign: 'center' }}>
                <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: 11, color: 'rgba(237,224,204,0.2)', letterSpacing: '0.06em' }}>{footerText}</span>
                    <Link to="/" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: 10, color: 'rgba(237,224,204,0.2)', textDecoration: 'none', letterSpacing: '0.14em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#c07d40')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(237,224,204,0.2)')}>
                        ← {t('Back Home', 'العودة للرئيسية', lang)}
                    </Link>
                </div>
            </footer>
        </div>
    )
}

function TRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Jost', sans-serif", fontSize: 12, color: green ? 'rgba(94,168,106,0.8)' : 'rgba(237,224,204,0.35)', marginBottom: 5, letterSpacing: '0.03em' }}>
            <span>{label}</span><span style={{ fontWeight: 600 }}>{value}</span>
        </div>
    )
}

const cartInputStyle: React.CSSProperties = {
    width: '100%', borderRadius: 6, border: '1px solid rgba(192,125,64,0.15)',
    padding: '8px 12px', fontSize: 12, fontFamily: "'Jost', sans-serif", fontWeight: 300,
    background: 'rgba(255,255,255,0.03)', color: '#ede0cc', outline: 'none', letterSpacing: '0.03em',
}
const qtyBtnStyle: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 2,
    border: '1px solid rgba(192,125,64,0.2)',
    background: 'transparent', cursor: 'pointer',
    fontFamily: "'Cormorant', serif", fontWeight: 600, fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#c07d40', transition: 'background 0.15s',
}