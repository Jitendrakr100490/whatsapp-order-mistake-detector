'use client';

import { useState } from 'react';
import Link from 'next/link';

const initial = [
  ['hoodie-black', 'Black Hoodie', 'L / Black', '₹549'],
  ['hoodie-red', 'Red Hoodie', 'XL / Red', '₹599'],
  ['tshirt-black', 'Black T-Shirt', 'Standard', '₹399'],
  ['shoes-red', 'Red Shoes', 'Size 8 / Red', '₹1,099'],
];

export default function Products() {
  const [products, setProducts] = useState(initial);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  function add() { if (!name.trim() || !price.trim()) return; setProducts([...products, [`custom-${Date.now()}`, name, 'Standard', `₹${price}`]]); setName(''); setPrice(''); }
  return <main style={{ maxWidth: 1180, margin: '0 auto', padding: 36 }}><header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}><div><h1>Product Catalog</h1><p style={{ color: '#68707a' }}>Catalog prices are the source of truth for order validation.</p></div><Link href="/dashboard">← Dashboard</Link></header><section style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 14, padding: 20, marginBottom: 20 }}><h2>Add product</h2><div style={{ display: 'flex', gap: 10 }}><input value={name} onChange={e => setName(e.target.value)} placeholder="Product name" style={{ flex: 1, padding: 12, border: '1px solid #d8dce1', borderRadius: 9 }} /><input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" style={{ width: 150, padding: 12, border: '1px solid #d8dce1', borderRadius: 9 }} /><button onClick={add} style={{ padding: '12px 18px', border: 0, borderRadius: 9, background: '#17191c', color: '#fff', fontWeight: 700 }}>Add</button></div></section><section style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 14, overflow: 'hidden' }}>{products.map(p => <div key={p[0]} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12, padding: 18, borderBottom: '1px solid #eef0f2' }}><b>{p[1]}</b><span>{p[2]}</span><strong>{p[3]}</strong></div>)}</section></main>;
}
