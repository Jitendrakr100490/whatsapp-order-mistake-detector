import Link from 'next/link';

const stats = [
  ['Orders scanned', '128'],
  ['Safe orders', '91'],
  ['Needs review', '27'],
  ['Critical', '10'],
];

const recent = [
  ['#4821', 'Price mismatch', '₹300 difference', 'Critical'],
  ['#4820', 'Missing size', 'Black Hoodie', 'Warning'],
  ['#4819', 'Incomplete address', 'Aligarh', 'Warning'],
  ['#4818', 'Possible duplicate', '2 × Hoodie L', 'Critical'],
];

export default function Dashboard() {
  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: 36 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>ORDER GUARD</div><h1 style={{ margin: '8px 0 4px' }}>Dashboard</h1><p style={{ color: '#68707a', margin: 0 }}>See which WhatsApp orders need attention.</p></div>
        <Link href="/" style={{ textDecoration: 'none', padding: '11px 16px', borderRadius: 10, background: '#17191c', color: '#fff', fontWeight: 700 }}>Analyze order</Link>
      </header>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(([label, value]) => <div key={label} style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 14, padding: 20 }}><div style={{ color: '#68707a', fontSize: 13 }}>{label}</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div></div>)}
      </section>
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 14, padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>Recent issues</h2>
          {recent.map(([id, issue, detail, severity]) => <div key={id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 90px', gap: 12, alignItems: 'center', padding: '15px 0', borderTop: '1px solid #eef0f2' }}><b>{id}</b><span>{issue}</span><span style={{ color: '#68707a' }}>{detail}</span><span style={{ fontSize: 12, fontWeight: 700 }}>{severity}</span></div>)}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 14, padding: 22 }}><h2 style={{ marginTop: 0 }}>Potential loss prevented</h2><div style={{ fontSize: 36, fontWeight: 800, margin: '18px 0' }}>₹8,420</div><p style={{ color: '#68707a' }}>Estimated value of detected order discrepancies today.</p><Link href="/" style={{ display: 'inline-block', marginTop: 10 }}>Review an order →</Link></div>
      </section>
    </main>
  );
}
