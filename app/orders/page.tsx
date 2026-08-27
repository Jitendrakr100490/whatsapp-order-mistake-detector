import Link from 'next/link';

const orders = [
  ['#4821', 'Rahul', '3 items', '₹1,600', '₹1,900', 'Price mismatch', 'Critical'],
  ['#4820', 'Aman', '1 item', '₹549', '₹549', 'Missing size', 'Warning'],
  ['#4819', 'Neha', '2 items', '₹998', '₹998', 'Address incomplete', 'Warning'],
  ['#4818', 'Sahil', '2 items', '₹1,098', '₹1,098', 'Possible duplicate', 'Critical'],
];

export default function Orders() {
  return <main style={{ maxWidth: 1180, margin: '0 auto', padding: 36 }}><header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}><div><h1>Orders</h1><p style={{ color: '#68707a' }}>Review analyzed WhatsApp orders.</p></div><Link href="/dashboard">← Dashboard</Link></header><div style={{ background: '#fff', border: '1px solid #e1e4e8', borderRadius: 14, overflow: 'hidden' }}><div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 110px 110px 1fr 100px', gap: 12, padding: 16, fontSize: 12, fontWeight: 800, color: '#68707a', borderBottom: '1px solid #e1e4e8' }}><span>ORDER</span><span>CUSTOMER</span><span>ITEMS</span><span>STATED</span><span>EXPECTED</span><span>ISSUE</span><span>STATUS</span></div>{orders.map(row => <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 110px 110px 1fr 100px', gap: 12, padding: 17, borderBottom: '1px solid #eef0f2', alignItems: 'center' }}>{row.map((cell, i) => <span key={i} style={{ fontWeight: i === 0 ? 700 : 400 }}>{cell}</span>)}</div>)}</div></main>;
}
