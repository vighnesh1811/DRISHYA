import { useEffect, useState } from 'react';
import { phase5Api } from '../../services/api';
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  useEffect(() => { phase5Api.customers().then(({ customers: result }) => setCustomers(result)).catch(() => {}); }, []);
  return <section className="admin-control-page"><div className="container"><div className="admin-command-header"><div><p className="eyebrow">DRISHYA / CONTROL ROOM — 04</p><h1>Customer <em>directory.</em></h1></div><span className="dashboard-date">{customers.length.toString().padStart(2, '0')} CUSTOMERS</span></div><div className="admin-list admin-directory">{customers.map((customer, index) => <div className="admin-list-item" key={customer.id}><span className="admin-list-index">0{index + 1}</span><div><strong>{customer.fullName}</strong><small>{customer.email} · {customer.phone || 'No phone'}</small></div><span>{customer.bookingCount} bookings</span><b aria-hidden="true">↗</b></div>)}</div></div></section>;
}
