import { useState } from 'react';
import { phase5Api } from '../../services/api';
export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [message, setMessage] = useState('');
  async function submit(event) { event.preventDefault(); try { const result = await phase5Api.submitEnquiry(form); setMessage(result.message); setForm({ name: '', email: '', subject: '', message: '' }); } catch (error) { setMessage(error.message); } }
  return (
    <section className="public-editorial-page contact-editorial">
      <div className="container"><p className="eyebrow">DRISHYA / 09 — Get in touch</p><div className="contact-layout"><div><h1>Let’s make something <em>remarkable.</em></h1><p className="lead muted-copy">Our team is here to help you choose the right kit for your production.</p><a className="contact-link" href="mailto:hello@drishya.rentals">hello@drishya.rentals <span aria-hidden="true">↗</span></a><div className="contact-image"><img src="/images/studio-camera.jpg" alt="Cinema camera ready for a production" /></div></div><form className="contact-form d-grid gap-3" onSubmit={submit}><span className="cart-panel-label">Start a conversation</span><label htmlFor="contact-name">Your name<input id="contact-name" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label htmlFor="contact-email">Email address<input id="contact-email" required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label htmlFor="contact-subject">Subject<input id="contact-subject" required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label><label htmlFor="contact-message">How can we help?<textarea id="contact-message" required placeholder="Tell us about your production" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label><button className="btn btn-primary">Send enquiry <span aria-hidden="true">↗</span></button>{message && <p className="muted-copy" role="status">{message}</p>}</form></div></div>
    </section>
  );
}
