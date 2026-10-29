import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <section className="not-found-page"><div className="container"><span className="not-found-mark">404</span><p className="eyebrow">The edit is missing</p><h1>Frame not <em>found.</em></h1><p className="muted-copy">This page has moved outside the cut. Let’s get you back to the collection.</p><Link className="btn btn-primary" to="/">Back to home <span aria-hidden="true">↗</span></Link></div></section>;
}
