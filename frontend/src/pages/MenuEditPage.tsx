import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/4f_logu.png'
import { api, getImageUrl, parseItemSizes, type Category, type ItemSizeOption, type MenuItem } from '../services/api'

type MenuForm = Omit<MenuItem, 'id'>
const emptyForm: MenuForm = { name: '', nameAr: '', cat: 'hot', price: 0, emoji: '☕', desc: '', descAr: '', avail: true, calories: 0, imageUrl: '', sortOrder: 0, sizesJson: '' }

const CAT_ICONS: Record<string, string> = { hot: '☕', cold: '🧊', tea: '🫖', food: '🍽️' }

const inp = { width: '100%', borderRadius: 10, border: '1.5px solid #e8ddd0', padding: '10px 13px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: '#faf6f0', color: '#1a0f0a', outline: 'none' } as React.CSSProperties
const darkInp = { width: '100%', borderRadius: 10, border: '1px solid rgba(192,125,64,0.22)', padding: '10px 13px', fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: 'rgba(255,255,255,0.05)', color: '#f5e0c0', outline: 'none' } as React.CSSProperties
const lbl = { display: 'block', fontSize: 10, fontWeight: 700, color: '#9a7a5a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 } as React.CSSProperties

export default function MenuEditPage() {
    const [loggedIn, setLoggedIn] = useState(() => !!sessionStorage.getItem('ff-admin-token'))
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')

    const [menu, setMenu] = useState<MenuItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [form, setForm] = useState<MenuForm>(emptyForm)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [filterCat, setFilterCat] = useState('all')
    const [search, setSearch] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [menuImageFile, setMenuImageFile] = useState<File | null>(null)
    const [menuImagePreview, setMenuImagePreview] = useState('')
    const [formOpen, setFormOpen] = useState(false)

    useEffect(() => { if (loggedIn) reload() }, [loggedIn])

    async function reload() {
        const [m, c] = await Promise.all([api.getMenu(), api.getCategories()])
        setMenu(m); setCategories(c)
    }

    async function login() {
        try {
            await api.login({ username, password })
            sessionStorage.setItem('ff-admin-token', '1')
            setLoggedIn(true); setLoginError('')
        } catch (e) { setLoginError(e instanceof Error ? e.message : 'Login failed') }
    }

    async function save() {
        setSaving(true)
        try {
            let finalImageUrl = form.imageUrl
            if (menuImageFile) finalImageUrl = await api.uploadMenuImage(menuImageFile)
            if (finalImageUrl?.startsWith('data:image/')) finalImageUrl = ''
            const payload: MenuForm = { ...form, imageUrl: finalImageUrl }
            if (editingId) await api.updateMenuItem(editingId, payload)
            else await api.createMenuItem(payload)
            flash(editingId ? 'Item updated!' : 'Item created!')
            setForm(emptyForm); setEditingId(null); setMenuImageFile(null); setMenuImagePreview(''); setFormOpen(false)
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

    function flash(msg: string) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 2500) }

    function startEdit(item: MenuItem) {
        setEditingId(item.id)
        setForm({ name: item.name, nameAr: item.nameAr, cat: item.cat, price: item.price, emoji: item.emoji, desc: item.desc, descAr: item.descAr, avail: item.avail, calories: item.calories, imageUrl: item.imageUrl, sortOrder: item.sortOrder, sizesJson: item.sizesJson ?? '' })
        setMenuImageFile(null); setMenuImagePreview(''); setFormOpen(true)
        setTimeout(() => document.getElementById('menu-form-top')?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    function cancelEdit() {
        setEditingId(null); setForm(emptyForm); setMenuImageFile(null); setMenuImagePreview(''); setFormOpen(false)
    }

    const filteredMenu = menu.filter(item =>
        (filterCat === 'all' || item.cat === filterCat) &&
        (`${item.name} ${item.nameAr}`).toLowerCase().includes(search.toLowerCase())
    )

    const sizes: ItemSizeOption[] = (() => { try { return form.sizesJson ? JSON.parse(form.sizesJson) as ItemSizeOption[] : [] } catch { return [] } })()
    const setSizes = (next: ItemSizeOption[]) => setForm({ ...form, sizesJson: next.length ? JSON.stringify(next) : '' })

    // ── Login screen ─────────────────────────────────────────────
    if (!loggedIn) return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0c0704', fontFamily: "'DM Sans',sans-serif", padding: 20 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;700;800;900&display=swap');*{box-sizing:border-box}input:focus{border-color:rgba(192,125,64,0.5)!important;outline:none}`}</style>
            <div style={{ width: '100%', maxWidth: 380, borderRadius: 22, background: '#1a0f0a', border: '1px solid rgba(192,125,64,0.2)', padding: 'clamp(24px,5vw,36px)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(192,125,64,0.4)', margin: '0 auto 12px' }}>
                        <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: '#f5e0c0', fontSize: 26, margin: '0 0 4px', fontWeight: 900 }}>Menu Editor</h2>
                    <p style={{ color: 'rgba(245,220,180,0.35)', fontSize: 13, margin: 0 }}>Staff access required</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={darkInp} />
                    <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={darkInp} onKeyDown={e => e.key === 'Enter' && login()} />
                    {loginError && <div style={{ color: '#f87171', fontSize: 13, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{loginError}</div>}
                    <button onClick={login} style={{ padding: '13px', borderRadius: 999, background: 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', boxShadow: '0 4px 18px rgba(192,125,64,0.35)' }}>🔐 Sign In</button>
                    <Link to="/admin" style={{ textAlign: 'center', color: 'rgba(192,125,64,0.45)', textDecoration: 'none', fontSize: 12, marginTop: 4 }}>← Back to Admin</Link>
                </div>
            </div>
        </div>
    )

    // ── Main editor ──────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', background: '#f7f2ea', color: '#1a0f0a', fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;900&family=DM+Sans:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
                input:focus, select:focus, textarea:focus { border-color: #c07d40 !important; box-shadow: 0 0 0 3px rgba(192,125,64,0.1); outline: none; }
                ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(192,125,64,0.25); border-radius: 99px; }
                @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                .me-layout { display: grid; grid-template-columns: 380px 1fr; gap: 24px; align-items: start; }
                .me-form-panel { position: sticky; top: 76px; }
                .cats-row { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
                .cats-row::-webkit-scrollbar { display: none; }
                @media(max-width:1000px) { .me-layout { grid-template-columns: 1fr; } .me-form-panel { position: static; } }
                @media(max-width:600px) { .me-layout { padding: 12px; gap: 16px; } }
            `}</style>

            {/* Header */}
            <header style={{ background: 'rgba(247,242,234,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #e8ddd0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', height: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(12px,3vw,28px)', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(192,125,64,0.45)', flexShrink: 0 }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 900, fontSize: 15, color: '#1a0f0a', lineHeight: 1 }}>Menu Editor</div>
                            <div style={{ fontSize: 9, color: 'rgba(192,125,64,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>For Friends Café</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {successMsg && <span style={{ color: '#15803d', fontWeight: 700, fontSize: 13, background: '#dcfce7', padding: '5px 12px', borderRadius: 999, border: '1px solid #86efac', animation: 'fadeUp 0.3s ease' }}>✓ {successMsg}</span>}
                        <Link to="/admin" style={{ padding: '7px 14px', borderRadius: 999, border: '1px solid #ead7be', background: 'white', color: '#7a6458', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>← Admin</Link>
                        <button onClick={() => { setFormOpen(p => !p); if (editingId) cancelEdit() }}
                            style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: formOpen ? '#1a0f0a' : 'linear-gradient(135deg,#c07d40,#8b4f1c)', color: 'white', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 14px rgba(192,125,64,0.3)' }}>
                            {formOpen ? '✕ Close' : '+ Add Item'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="me-layout" style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(16px,2vw,24px) clamp(12px,3vw,28px) 60px' }}>

                {/* ── FORM PANEL ── */}
                {(formOpen || editingId) && (
                    <div className="me-form-panel">
                        <div id="menu-form-top" style={{ borderRadius: 20, background: 'white', border: `2px solid ${editingId ? '#c07d40' : '#e8ddd0'}`, padding: 'clamp(16px,3vw,24px)', boxShadow: '0 8px 32px rgba(26,15,10,0.08)', animation: 'slideDown 0.25s ease' }}>
                            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 900, color: '#1a0f0a', margin: '0 0 20px' }}>
                                {editingId ? '✏️ Edit Item' : '➕ New Item'}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* Emoji + Category row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10 }}>
                                    <div>
                                        <label style={lbl}>Emoji</label>
                                        <input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} style={{ ...inp, textAlign: 'center', fontSize: 22, padding: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={lbl}>Category</label>
                                        <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })} style={{ ...inp, cursor: 'pointer' }}>
                                            {categories.map(c => <option key={c.id} value={c.key}>{c.name}</option>)}
                                            {categories.length === 0 && <>
                                                <option value="hot">Hot Coffee</option>
                                                <option value="cold">Cold Drinks</option>
                                                <option value="tea">Tea</option>
                                                <option value="food">Food</option>
                                            </>}
                                        </select>
                                    </div>
                                </div>

                                {/* Names */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div><label style={lbl}>Name (EN)</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Cappuccino" style={inp} /></div>
                                    <div><label style={lbl}>Name (AR)</label><input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} placeholder="كابتشينو" style={{ ...inp, direction: 'rtl' }} /></div>
                                </div>

                                {/* Descriptions */}
                                <div><label style={lbl}>Description (EN)</label><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Rich espresso with steamed milk..." rows={2} style={{ ...inp, resize: 'none' }} /></div>
                                <div><label style={lbl}>Description (AR)</label><textarea value={form.descAr} onChange={e => setForm({ ...form, descAr: e.target.value })} placeholder="إسبريسو غني مع حليب مبخر..." rows={2} style={{ ...inp, resize: 'none', direction: 'rtl' }} /></div>

                                {/* Price + Calories */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div><label style={lbl}>Price (SAR)</label><input type="number" min="0" step="0.5" value={form.price} onChange={e => setForm({ ...form, price: +e.target.value })} style={inp} /></div>
                                    <div><label style={lbl}>Calories</label><input type="number" min="0" value={form.calories} onChange={e => setForm({ ...form, calories: +e.target.value })} style={inp} /></div>
                                </div>

                                {/* Size options */}
                                <div style={{ borderRadius: 12, background: '#eef7ff', border: '1.5px solid #bae6fd', padding: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ fontWeight: 800, fontSize: 12, color: '#0369a1' }}>☕ Size Options <span style={{ fontWeight: 400, color: '#7cb9e8', fontSize: 11 }}>(optional)</span></div>
                                        <button type="button" onClick={() => { const used = sizes.map(s => s.key); const next = ['S','M','L','XL'].find(k => !used.includes(k)) ?? `S${sizes.length+1}`; setSizes([...sizes, { key: next, label: next === 'S' ? 'Small' : next === 'M' ? 'Medium' : next === 'L' ? 'Large' : next, labelAr: '', price: form.price, active: true, isDefault: sizes.length === 0 }]) }}
                                            style={{ padding: '5px 12px', borderRadius: 999, background: '#0369a1', color: 'white', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
                                    </div>
                                    {sizes.length === 0
                                        ? <div style={{ color: '#7cb9e8', fontSize: 12, textAlign: 'center', padding: '6px 0' }}>No sizes — single price: SAR {form.price.toFixed(2)}</div>
                                        : sizes.map((sz, i) => (
                                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 80px 32px', gap: 6, alignItems: 'center', marginBottom: 6, background: 'white', borderRadius: 8, border: '1px solid #bae6fd', padding: '6px 8px' }}>
                                                <input value={sz.key} onChange={e => setSizes(sizes.map((s,j)=>j===i?{...s,key:e.target.value.toUpperCase().slice(0,3)}:s))} maxLength={3} style={{ ...inp, textAlign: 'center', fontWeight: 900, fontSize: 12, color: '#0369a1', padding: '4px', background: 'white' }} />
                                                <input value={sz.label} onChange={e => setSizes(sizes.map((s,j)=>j===i?{...s,label:e.target.value}:s))} placeholder="Small" style={{ ...inp, fontSize: 12, padding: '4px 8px', background: 'white' }} />
                                                <input type="number" min="0" step="0.5" value={sz.price} onChange={e => setSizes(sizes.map((s,j)=>j===i?{...s,price:+e.target.value}:s))} style={{ ...inp, fontWeight: 800, fontSize: 12, padding: '4px 6px', textAlign: 'center', background: 'white' }} />
                                                <button type="button" onClick={() => setSizes(sizes.filter((_,j)=>j!==i))} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center', flexShrink: 0 }}>×</button>
                                            </div>
                                        ))}
                                </div>

                                {/* Image upload */}
                                <div style={{ borderRadius: 12, background: '#faf6f0', border: '1.5px dashed #e8ddd0', padding: 14 }}>
                                    <label style={lbl}>📷 Item Image</label>
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) { setMenuImageFile(f); setMenuImagePreview(URL.createObjectURL(f)) } }} style={{ width: '100%', fontSize: 13, cursor: 'pointer', marginTop: 4 }} />
                                    {(menuImagePreview || form.imageUrl) && (
                                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img src={menuImagePreview || getImageUrl(form.imageUrl)} alt="preview" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', border: '1px solid #e8ddd0' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                                            {menuImagePreview && <button onClick={() => { setMenuImageFile(null); setMenuImagePreview('') }} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>}
                                        </div>
                                    )}
                                </div>

                                {/* Available + Sort */}
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#1a0f0a' }}>
                                        <input type="checkbox" checked={form.avail} onChange={e => setForm({ ...form, avail: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#c07d40', cursor: 'pointer' }} />
                                        Available for ordering
                                    </label>
                                    <div style={{ flex: 1, minWidth: 100 }}>
                                        <label style={lbl}>Sort Order</label>
                                        <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: +e.target.value })} style={inp} />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={save} disabled={saving || !form.name}
                                        style={{ flex: 1, padding: '13px', borderRadius: 999, border: 'none', background: form.name ? 'linear-gradient(135deg,#c07d40,#8b4f1c)' : 'rgba(26,15,10,0.1)', color: form.name ? 'white' : '#9a7a5a', fontWeight: 800, cursor: form.name ? 'pointer' : 'default', fontSize: 15, fontFamily: 'inherit', boxShadow: form.name ? '0 4px 18px rgba(192,125,64,0.32)' : 'none' }}>
                                        {saving ? 'Saving...' : editingId ? '✓ Update Item' : '✓ Create Item'}
                                    </button>
                                    {editingId && <button onClick={cancelEdit} style={{ padding: '13px 18px', borderRadius: 999, border: '1px solid #ead7be', background: 'white', color: '#7a6458', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>Cancel</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MENU LIST ── */}
                <div style={{ minWidth: 0 }}>
                    {/* Filter row */}
                    <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="cats-row" style={{ flex: 1 }}>
                            {[{ key: 'all', name: 'All' }, ...categories.map(c => ({ key: c.key, name: c.name }))].map(c => (
                                <button key={c.key} onClick={() => setFilterCat(c.key)}
                                    style={{ padding: '7px 14px', borderRadius: 999, border: `1.5px solid ${filterCat === c.key ? '#1a0f0a' : '#ead7be'}`, background: filterCat === c.key ? '#1a0f0a' : 'white', color: filterCat === c.key ? 'white' : '#1a0f0a', cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                    {CAT_ICONS[c.key] || ''} {c.name} {c.key !== 'all' ? `(${menu.filter(m => m.cat === c.key).length})` : `(${menu.length})`}
                                </button>
                            ))}
                        </div>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...inp, maxWidth: 180, flex: '0 0 auto' }} />
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredMenu.map(item => {
                            const itemSizes = parseItemSizes(item)
                            const imgUrl = getImageUrl(item.imageUrl)
                            return (
                                <div key={item.id} style={{ borderRadius: 18, background: 'white', border: `1.5px solid ${editingId === item.id ? '#c07d40' : '#ead7be'}`, padding: 'clamp(12px,2vw,18px)', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(26,15,10,0.05)', animation: 'fadeUp 0.25s ease both' }}>
                                    {/* Thumbnail */}
                                    <div style={{ width: 'clamp(48px,8vw,64px)', height: 'clamp(48px,8vw,64px)', borderRadius: 12, overflow: 'hidden', border: '1px solid #e8ddd0', flexShrink: 0, background: '#faf6f0', display: 'grid', placeItems: 'center' }}>
                                        {imgUrl
                                            ? <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                                            : <span style={{ fontSize: 'clamp(20px,4vw,28px)' }}>{item.emoji}</span>}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                                            <span style={{ fontWeight: 800, fontSize: 'clamp(13px,2vw,15px)', color: '#1a0f0a' }}>{item.emoji} {item.name}</span>
                                            {item.nameAr && <span style={{ fontSize: 12, color: '#9a7a5a', direction: 'rtl' }}>{item.nameAr}</span>}
                                            <span style={{ padding: '2px 8px', borderRadius: 999, background: '#f7f2ea', fontSize: 10, color: '#7a6458', fontWeight: 700 }}>{item.cat}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: 999, background: item.avail ? '#dcfce7' : '#fef2f2', fontSize: 10, color: item.avail ? '#15803d' : '#dc2626', fontWeight: 800 }}>{item.avail ? '● On' : '○ Off'}</span>
                                            {itemSizes.length > 0 && <span style={{ padding: '2px 8px', borderRadius: 999, background: '#e0f2fe', fontSize: 10, color: '#0369a1', fontWeight: 700 }}>{itemSizes.length} sizes</span>}
                                        </div>
                                        {item.desc && <div style={{ fontSize: 11, color: '#9a7a5a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</div>}
                                    </div>

                                    {/* Price + Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flexShrink: 0 }}>
                                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(15px,2.5vw,19px)', fontWeight: 900, color: '#c07d40' }}>SAR {item.price.toFixed(2)}</span>
                                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            <button onClick={() => toggleAvail(item)} style={{ padding: '5px 10px', borderRadius: 999, border: `1.5px solid ${item.avail ? '#86efac' : '#ead7be'}`, background: item.avail ? '#dcfce7' : '#f7f2ea', color: item.avail ? '#15803d' : '#9a7a5a', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>
                                                {item.avail ? 'On' : 'Off'}
                                            </button>
                                            <button onClick={() => startEdit(item)} style={{ padding: '5px 10px', borderRadius: 999, border: '1.5px solid #ead7be', background: 'white', color: '#1a0f0a', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>Edit</button>
                                            <button onClick={() => deleteItem(item.id)} style={{ padding: '5px 10px', borderRadius: 999, border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: 11, fontFamily: 'inherit' }}>Del</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {filteredMenu.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: '#b09a7a' }}>
                                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>No items found</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
