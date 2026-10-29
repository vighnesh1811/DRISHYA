import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { equipmentApi } from '../../services/api';

export default function EquipmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  useEffect(() => {
    equipmentApi.list(searchParams.toString()).then(({ equipment }) => setItems(equipment)).catch((e) => setError(e.message));
    equipmentApi.categories().then(({ categories: result }) => setCategories(result)).catch(() => {});
  }, [searchParams]);

  return <section className="catalog-page">
    <div className="catalog-masthead container"><div><p className="eyebrow">DRISHYA / 02 — The collection</p><h1>Choose your <em>frame.</em></h1><p className="catalog-intro">Production-ready tools, carefully selected for the work that matters.</p></div><div className="catalog-index" aria-label="Catalog information"><span>01</span><span>Camera / Cinema / Light / Sound</span></div></div>
    <div className="catalog-toolbar container"><div className="category-filter"><button type="button" className={!category ? 'active' : ''} onClick={() => { const next = new URLSearchParams(searchParams); next.delete('category'); setSearchParams(next); }}>All equipment</button>{categories.map((item) => <button type="button" className={category === item.slug ? 'active' : ''} key={item.id} onClick={() => { const next = new URLSearchParams(searchParams); next.set('category', item.slug); setSearchParams(next); }}>{item.name}</button>)}</div><label className="catalog-search-wrap"><span className="visually-hidden">Search equipment</span><input id="equipment-search" className="catalog-search" placeholder="Search the collection" value={search} onChange={(e) => { const next = new URLSearchParams(searchParams); e.target.value ? next.set('search', e.target.value) : next.delete('search'); setSearchParams(next); }} /><span aria-hidden="true">⌕</span></label></div>
    {error && <div className="alert alert-warning">{error}. Start the API and configure MySQL to load the catalog.</div>}
    <div className="container"><div className="catalog-count"><span>{items.length.toString().padStart(2, '0')} pieces</span><span>Rental-ready / India</span></div><div className="row g-4 equipment-grid">{items.map((item, index) => <div className="col-md-6 col-lg-4" key={item.id}><article className="equipment-card"><div className="equipment-number">0{index + 1}</div><div className="equipment-image">{item.imageUrl ? <img loading="lazy" decoding="async" src={item.imageUrl} alt={item.name} /> : <span>{item.categoryName}</span>}<span className="equipment-arrow" aria-hidden="true">↗</span></div><div className="equipment-card-body"><div><p className="eyebrow mb-2">{item.categoryName}</p><h3>{item.name}</h3></div><strong>₹{Number(item.dailyRate).toLocaleString('en-IN')}<small>/day</small></strong></div><Link className="stretched-link" to={`/equipment/${item.slug}`}>View details</Link></article></div>)}</div></div>
    {!error && !items.length && <p className="muted-copy">No equipment matches your search.</p>}
  </section>;
}
