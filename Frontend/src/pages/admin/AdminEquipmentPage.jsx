import { useEffect, useState } from 'react';
import { equipmentApi } from '../../services/api';

const initial = { name: '', slug: '', categoryId: '', description: '', dailyRate: '', securityDeposit: '', totalUnits: 1, imageUrl: '' };
export default function AdminEquipmentPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const refresh = () => equipmentApi.list().then(({ equipment }) => setItems(equipment)).catch((e) => setMessage(e.message));
  useEffect(() => { refresh(); equipmentApi.categories().then(({ categories: result }) => { setCategories(result); setForm((value) => ({ ...value, categoryId: result[0]?.id || '' })); }); }, []);
  async function submit(event) { event.preventDefault(); try { await equipmentApi.create(form); setForm({ ...initial, categoryId: categories[0]?.id || '' }); setMessage('Equipment added'); refresh(); } catch (e) { setMessage(e.message); } }
  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { imageUrl } = await equipmentApi.uploadImage(file);
      setForm((value) => ({ ...value, imageUrl }));
      setMessage('Image uploaded');
    } catch (e) {
      event.target.value = '';
      setMessage(e.message);
    } finally {
      setUploading(false);
    }
  }
  async function archive(id) { try { await equipmentApi.archive(id); setMessage('Equipment archived'); refresh(); } catch (e) { setMessage(e.message); } }
  return <section className="admin-control-page"><div className="container"><div className="admin-command-header"><div><p className="eyebrow">DRISHYA / CONTROL ROOM — 02</p><h1>Equipment <em>inventory.</em></h1></div><span className="dashboard-date">{items.length.toString().padStart(2, '0')} PRODUCTS</span></div>{message && <div className="alert alert-info">{message}</div>}<div className="admin-split-layout"><form className="admin-form d-grid gap-3" onSubmit={submit}><span className="cart-panel-label">Add to collection</span><h2>New equipment</h2><input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required placeholder="URL slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Category</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select><textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><div className="admin-form-row"><input required type="number" min="0" placeholder="Daily rate" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} /><input type="number" min="0" placeholder="Security deposit" value={form.securityDeposit} onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} /></div><input required type="number" min="1" placeholder="Total units" value={form.totalUnits} onChange={(e) => setForm({ ...form, totalUnits: e.target.value })} /><label>Product image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={uploading} /></label>{form.imageUrl && <img className="admin-image-preview" src={form.imageUrl} alt="Selected product preview" />}{uploading && <small className="muted-copy">Uploading image…</small>}<button className="btn btn-primary" disabled={uploading}>Add equipment <span aria-hidden="true">↗</span></button></form><div><div className="admin-list-header"><span className="cart-panel-label">Live collection</span><span>{items.length.toString().padStart(2, '0')} items</span></div><div className="admin-list">{items.map((item, index) => <div className="admin-list-item" key={item.id}><span className="admin-list-index">0{index + 1}</span><div><strong>{item.name}</strong><small>{item.categoryName} · ₹{Number(item.dailyRate).toLocaleString('en-IN')}/day</small></div><button className="btn btn-sm btn-outline-danger" onClick={() => archive(item.id)}>Archive</button></div>)}</div></div></div></div></section>;
}
