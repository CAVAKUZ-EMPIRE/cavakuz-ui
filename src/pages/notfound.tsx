import { Link } from 'react-router-dom'

export default function Notfound() {
  return (
    <main className="cavakuz-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section className="panel module-panel" style={{ maxWidth: 480, width: '100%' }}>
        <h1>Page not found</h1>
        <p>The page you requested is not part of the Cavakuz workspace.</p>
        <Link to="/dashboard" className="primary-button" style={{ marginTop: 16 }}>Go to dashboard</Link>
      </section>
    </main>
  )
}
