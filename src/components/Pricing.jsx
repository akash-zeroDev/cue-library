import React from 'react';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for exploring the curated library.',
      features: ['Access to free prompts', 'Basic components', 'Community support'],
      btnText: 'Get Started',
      premium: false
    },
    {
      name: 'Pro Monthly',
      price: '$19',
      period: 'per month',
      desc: 'Full access to all premium UI components and patterns.',
      features: ['All premium prompts', 'Framer & React code', 'Weekly updates', 'Priority support'],
      btnText: 'Subscribe Monthly',
      premium: true
    },
    {
      name: 'Pro Yearly',
      price: '$149',
      period: 'per year',
      desc: 'Best value for serious developers and designers.',
      features: ['Everything in Monthly', 'Save $79 annually', 'Exclusive templates', '1-on-1 design review'],
      btnText: 'Subscribe Yearly',
      premium: true,
      highlight: true
    }
  ];

  return (
    <div style={{ padding: '120px clamp(20px, 4vw, 56px) 60px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: '16px', textAlign: 'center', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        Simple, transparent <span style={{ color: '#3B82F6' }}>pricing</span>.
      </h2>
      <p style={{ color: 'var(--t2)', fontSize: '18px', marginBottom: '64px', textAlign: 'center', maxWidth: '500px' }}>
        Unlock the complete library of production-ready components and prompts. Ship your next landing page today.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%' }}>
        {plans.map((plan, i) => (
          <div key={i} style={{
            position: 'relative',
            background: plan.highlight ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
            border: plan.highlight ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: plan.highlight ? '0 20px 40px rgba(59, 130, 246, 0.1)' : 'none',
            transform: plan.highlight ? 'scale(1.02)' : 'scale(1)',
            zIndex: plan.highlight ? 2 : 1
          }}>
            {plan.highlight && (
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#3B82F6', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Most Popular
              </div>
            )}
            <h3 style={{ color: plan.premium ? '#fff' : 'var(--t2, rgba(255,255,255,0.65))', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontSize: '48px', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>{plan.price}</span>
              <span style={{ color: 'var(--t3, rgba(255,255,255,0.45))', fontSize: '14px', fontWeight: 500 }}>{plan.period}</span>
            </div>
            <p style={{ color: 'var(--t2, rgba(255,255,255,0.65))', fontSize: '14px', lineHeight: 1.5, marginBottom: '32px' }}>{plan.desc}</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              {plan.features.map((feat, j) => (
                <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--t1, #EDEDED)', fontSize: '14px', fontWeight: 500 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? '#3B82F6' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>
            
            <button className={plan.highlight ? 'hover-btn-get' : 'hover-color-tstrong'} style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: plan.highlight ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
              background: plan.highlight ? '#fff' : 'transparent',
              color: plan.highlight ? '#000' : '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}>
              {plan.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
