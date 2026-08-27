'use client';

import { useMemo, useState } from 'react';
import { analyzeOrder, CatalogItem } from '../lib/detector';

const catalog: CatalogItem[] = [
  { id: 'hoodie-black', name: 'black hoodie', price: 549 },
  { id: 'hoodie-red', name: 'red hoodie', price: 599 },
  { id: 'tshirt-black', name: 'black t-shirt', price: 399 },
  { id: 'shoes-red', name: 'red shoes', price: 1099 },
];

const sample = 'Bhai 2 black hoodie aur 1 red hoodie bhej dena, total 1600 COD';

export default function Home() {
  const [message, setMessage] = useState(sample);
  const [analyzed, setAnalyzed] = useState(false);
  const result = useMemo(() => analyzed ? analyzeOrder(message, catalog) : null, [message, analyzed]);

  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: 40 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div><div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>ORDER GUARD</div><h1 style={{ margin: '8px 0 4px', fontSize: 32 }}>WhatsApp Order Mistake Detector</h1><p style={{ margin: 0, color: '#68707a' }}>Catch wrong orders before they cost you money.</p></div>
        <div style={{ padding: '10px 14px', background: '#fff', border: '1px solid #e1e4e8', borderRadius: 10 }}>MVP • Offline analyzer</div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Paste WhatsApp order</h2>
          <p style={{ color: '#68707a' }}>Paste the customer&apos;s exact message. The MVP compares it with the sample catalog.</p>
          <textarea value={message} onChange={(e) => { setMessage(e.target.value); setAnalyzed(false); }} rows={10} style={{ width: '100%', resize: 'vertical', padding: 14, border: '1px solid #d8dce1', borderRadius: 10 }} />
          <button onClick={() => setAnalyzed(true)} style={{ marginTop: 14, width: '100%', padding: 13, border: 0, borderRadius: 10, background: '#17191c', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Analyze Order</button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 16, padding: 24 }}>
          {!result ? <div style={{ color: '#68707a', paddingTop: 80, textAlign: 'center' }}>Analysis results will appear here.</div> : <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ marginTop: 0 }}>Analysis</h2><strong>{result.confidence}% confidence</strong></div>
            <div style={{ padding: 16, background: result.issues.length ? '#fff8e8' : '#eefaf2', borderRadius: 12, marginBottom: 18 }}><strong>{result.issues.length ? `${result.issues.length} issue(s) detected` : 'Safe to confirm'}</strong><div style={{ marginTop: 6 }}>{result.recommendation}</div></div>
            <div style={{ display: 'grid', gap: 10 }}><div><b>Expected total:</b> ₹{result.expectedTotal}</div><div><b>Customer total:</b> {result.statedTotal === null ? 'Not detected' : `₹${result.statedTotal}`}</div></div>
            <h3>Issues</h3>
            {result.issues.length === 0 ? <p>No issues detected.</p> : result.issues.map((issue, i) => <div key={i} style={{ padding: 12, border: '1px solid #eceff2', borderRadius: 10, marginBottom: 8 }}><b>{issue.type.replaceAll('_', ' ')}</b><div>{issue.message}</div>{issue.difference !== undefined && <small>Difference: ₹{Math.abs(issue.difference)}</small>}</div>)}
          </>}
        </div>
      </section>

      <section style={{ marginTop: 24, background: '#fff', border: '1px solid #e1e4e8', borderRadius: 16, padding: 24 }}><h2>Sample Catalog</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>{catalog.map(item => <div key={item.id} style={{ border: '1px solid #eceff2', borderRadius: 10, padding: 14 }}><b>{item.name}</b><div>₹{item.price}</div></div>)}</div></section>
    </main>
  );
}
