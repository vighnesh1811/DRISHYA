import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      <section className="hero-section">
        <div className="hero-image" role="img" aria-label="Professional cinema camera on a production set" />
        <div className="hero-scrim" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-kicker"><span className="hero-index">01 / 06</span><p className="eyebrow mb-0">Professional camera equipment rental</p></div>
          <h1>Every vision<br /><em>deserves a frame.</em></h1>
          <p className="hero-copy">Production-ready cameras, cinema glass, lighting and sound for the stories you are ready to tell.</p>
          <div className="hero-actions"><Link className="btn btn-primary btn-lg" to="/catalog">Explore equipment <span aria-hidden="true">↗</span></Link><Link className="text-link text-light" to="/about">The DRISHYA standard <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="hero-meta"><span>DRISHYA / 2025</span><span>Production equipment</span><span>Available across India</span></div>
      </section>
      <section className="intro-section container section-rule">
        <p className="eyebrow">The DRISHYA standard</p>
        <div className="row g-4 align-items-end">
          <div className="col-lg-7"><h2>Tools for the way<br />you <em>see.</em></h2></div>
          <div className="col-lg-5"><p className="muted-copy">Reliable, well-maintained equipment and thoughtful service for filmmakers, photographers and creative teams across India. No compromises between the idea and the image.</p></div>
        </div>
      </section>
      <section className="feature-section container">
        <div className="feature-image"><img src="/images/filmmaker.jpg" alt="Filmmaker operating a camera on set" loading="lazy" /></div>
        <div className="feature-copy"><p className="eyebrow">Built for the frame</p><h2>From first light<br />to <em>final cut.</em></h2><p className="muted-copy">A considered collection for the full production. Every piece is checked, cared for and ready to disappear into your process.</p><Link className="text-link" to="/about">Why creators choose us <span aria-hidden="true">↗</span></Link></div>
      </section>
      <section className="container category-section section-rule">
        <div className="section-heading"><div><p className="eyebrow">Explore the collection</p><h2>Made to be <em>used.</em></h2></div><Link className="text-link" to="/equipment">View all equipment <span aria-hidden="true">↗</span></Link></div>
        <div className="category-grid">
          {['Cameras', 'Cinema glass', 'Lighting', 'Sound'].map((category, index) => <Link className={`category-tile category-tile-${index + 1}`} to="/equipment" key={category}><span>0{index + 1}</span><strong>{category}</strong><i aria-hidden="true">↗</i></Link>)}
        </div>
      </section>
      <section className="process-section">
        <div className="container section-rule"><p className="eyebrow">How it works</p><div className="process-grid">{[['01', 'Choose your kit', 'Browse a considered collection of production-ready equipment.'], ['02', 'Request your dates', 'Tell us when you are shooting and we will confirm availability.'], ['03', 'Make your frame', 'Collect your kit, create freely, and return it when you are done.']].map(([number, title, copy]) => <article className="process-step" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>
      <section className="container closing-cta section-rule"><p className="eyebrow">Start something</p><h2>Your next story<br /><em>starts here.</em></h2><Link className="btn btn-primary" to="/contact">Talk to our team <span aria-hidden="true">→</span></Link></section>
    </div>
  );
}
