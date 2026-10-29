import { useEffect, useState } from 'react';
import { phase5Api } from '../../services/api';
export default function EnquiriesPage() {
  const [items, setItems] = useState([]);
  function refresh() {
    phase5Api.enquiries()
      .then(({ enquiries }) => setItems(enquiries))
      .catch(() => {});
  }

  useEffect(refresh, []);
  return <section className="admin-control-page"><div className="container"><div className="admin-command-header"><div><p className="eyebrow">DRISHYA / CONTROL ROOM — 06</p><h1>Customer <em>enquiries.</em></h1></div><span className="dashboard-date">{items.length.toString().padStart(2, '0')} OPEN THREADS</span></div><div className="enquiry-list">{items.map((item, index) => <article className="enquiry-card" key={item.id}><span className="admin-list-index">0{index + 1}</span><div><strong>{item.subject}</strong><small>{item.name} · {item.email}</small><p>{item.message}</p></div><select value={item.status} onChange={async (e) => { await phase5Api.updateEnquiry(item.id, e.target.value); refresh(); }}><option value="new">New</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></article>)}</div></div></section>;
}
