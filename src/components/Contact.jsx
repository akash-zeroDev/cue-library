import React from 'react';

export default function Contact() {
  return (
    <div style={{ padding: '120px clamp(20px, 4vw, 56px) 60px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: '16px', textAlign: 'center', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        Get in <span style={{ color: '#3B82F6' }}>touch</span>.
      </h2>
      <p style={{ color: 'var(--t2)', fontSize: '18px', marginBottom: '64px', textAlign: 'center', maxWidth: '500px' }}>
        Have a question about our components, pricing, or custom enterprise plans? We're here to help.
      </p>

      <form style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: 'clamp(24px, 5vw, 48px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: 'var(--t1)', fontSize: '14px', fontWeight: 600 }}>Name</label>
          <input type="text" placeholder="John Doe" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: 'var(--t1)', fontSize: '14px', fontWeight: 600 }}>Email</label>
          <input type="email" placeholder="john@example.com" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ color: 'var(--t1)', fontSize: '14px', fontWeight: 600 }}>Message</label>
          <textarea rows="5" placeholder="How can we help?" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '16px', outline: 'none', resize: 'vertical' }}></textarea>
        </div>

        <button type="button" className="hover-btn-get" style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          border: 'none',
          background: '#fff',
          color: '#000',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          marginTop: '12px'
        }}>
          Send Message
        </button>
      </form>
    </div>
  );
}
