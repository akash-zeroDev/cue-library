import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    inquiry_type: 'General Inquiry',
    custom_inquiry: '',
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const INQUIRY_OPTIONS = [
    'General Inquiry',
    'Component Licensing',
    'Enterprise Plan',
    'Bug Report',
    'Feature Request',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/send-contact`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error('Failed to send message. Please try again later.');
      }

      setStatus('success');
      setForm({ name: '', email: '', inquiry_type: 'General Inquiry', custom_inquiry: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '140px clamp(20px, 4vw, 56px) 120px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '64px', minHeight: '100vh', animation: 'fadeUp .4s ease' }}>
      
      {/* Header Area */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: '24px', lineHeight: 1.1 }}>
          Get in <span style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>touch</span>.
        </h2>
        <p style={{ color: 'var(--t2)', fontSize: '20px', lineHeight: 1.6 }}>
          Whether you need a custom enterprise license or just want to say hello, our team is ready to assist you immediately.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px', alignItems: 'start' }}>
        
        {/* Left Side: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
          
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Email Us</h3>
            <p style={{ color: 'var(--t2)', fontSize: '15px', lineHeight: 1.6 }}>
              Expect a response within 24 hours. We prioritize support for our premium users.
            </p>
            <a href="mailto:cueui.support@gmail.com" style={{ display: 'inline-block', marginTop: '12px', color: '#60A5FA', textDecoration: 'none', fontWeight: 500, fontSize: '15px' }}>cueui.support@gmail.com</a>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>

          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Business Hours</h3>
            <p style={{ color: 'var(--t2)', fontSize: '15px', lineHeight: 1.6 }}>
              Monday - Friday<br/>
              9:00 AM - 6:00 PM (IST)
            </p>
          </div>

        </div>

        {/* Right Side: Form */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: 'clamp(24px, 5vw, 48px)', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--t1)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name *</label>
              <input 
                type="text" 
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="John Doe" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: 'var(--t1)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email *</label>
              <input 
                type="email" 
                required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="john@example.com" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--t1)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What are you inquiring about?</label>
            <select 
              value={form.inquiry_type}
              onChange={e => setForm({...form, inquiry_type: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', appearance: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            >
              {INQUIRY_OPTIONS.map(opt => <option key={opt} value={opt} style={{background: '#111'}}>{opt}</option>)}
            </select>
          </div>

          {form.inquiry_type === 'Other' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeUp 0.3s ease' }}>
              <label style={{ color: 'var(--t1)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Please specify</label>
              <input 
                type="text" 
                required
                value={form.custom_inquiry}
                onChange={e => setForm({...form, custom_inquiry: e.target.value})}
                placeholder="e.g. Partnership Opportunity" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} 
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: 'var(--t1)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message *</label>
            <textarea 
              rows="5" 
              required
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder="How can we help?" 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            ></textarea>
          </div>

          {errorMsg && <div style={{ color: '#EF4444', fontSize: '14px', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{errorMsg}</div>}
          
          {status === 'success' && <div style={{ color: '#10B981', fontSize: '14px', background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>Your message has been sent successfully! We'll get back to you soon.</div>}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: status === 'loading' ? 'rgba(255,255,255,0.1)' : '#fff',
              color: status === 'loading' ? 'rgba(255,255,255,0.5)' : '#000',
              fontSize: '16px',
              fontWeight: 700,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"/>
                  <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                Sending...
              </>
            ) : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
