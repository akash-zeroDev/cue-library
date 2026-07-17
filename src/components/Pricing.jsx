import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function Pricing() {
  const { isSignedIn, isLoaded } = useUser();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (planType) => {
    if (!isSignedIn) {
      window.location.hash = '#/sign-in';
      return;
    }

    setLoadingPlan(planType);
    setErrorMsg('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/create-subscription`;
      
      let clerkToken = null;
      if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
        clerkToken = await window.Clerk.session.getToken({ template: 'supabase' });
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clerkToken}`
        },
        body: JSON.stringify({ plan: planType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setErrorMsg(err.message);
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for exploring the curated library.',
      features: ['Access to free prompts', 'Basic components', 'Community support'],
      btnText: 'Get Started',
      premium: false,
      onClick: () => { window.location.hash = '#/'; }
    },
    {
      name: 'Pro Monthly',
      price: '$19',
      period: 'per month',
      desc: 'Full access to all premium UI components and patterns.',
      features: ['All premium prompts', 'Framer & React code', 'Weekly updates', 'Priority support'],
      btnText: 'Subscribe Monthly',
      premium: true,
      onClick: () => handleSubscribe('monthly'),
      type: 'monthly'
    },
    {
      name: 'Pro Yearly',
      price: '$149',
      period: 'per year',
      desc: 'Best value for serious developers and designers.',
      features: ['Everything in Monthly', 'Save $79 annually', 'Exclusive templates', '1-on-1 design review'],
      btnText: 'Subscribe Yearly',
      premium: true,
      highlight: true,
      onClick: () => handleSubscribe('yearly'),
      type: 'yearly'
    }
  ];

  return (
    <div style={{ padding: '120px clamp(20px, 4vw, 56px) 60px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeUp .4s ease' }}>
      <h2 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: '16px', textAlign: 'center', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        Simple, transparent <span style={{ color: '#3B82F6' }}>pricing</span>.
      </h2>
      <p style={{ color: 'var(--t2)', fontSize: '18px', marginBottom: '64px', textAlign: 'center', maxWidth: '500px' }}>
        Unlock the complete library of production-ready components and prompts. Ship your next landing page today.
      </p>

      {errorMsg && <div style={{ color: '#EF4444', marginBottom: '24px', background: 'rgba(239,68,68,0.1)', padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{errorMsg}</div>}

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
            
            <button 
              className={plan.highlight ? 'hover-btn-get' : 'hover-color-tstrong'} 
              onClick={plan.onClick}
              disabled={loadingPlan === plan.type}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: plan.highlight ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                background: plan.highlight ? '#fff' : (loadingPlan === plan.type ? 'rgba(255,255,255,0.1)' : 'transparent'),
                color: plan.highlight ? '#000' : (loadingPlan === plan.type ? 'rgba(255,255,255,0.5)' : '#fff'),
                fontSize: '15px',
                fontWeight: 600,
                cursor: loadingPlan === plan.type ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
              {loadingPlan === plan.type ? (
                <>
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                    <path d="M12 2C6.47715 2 2 6.47715 2 12" strokeLinecap="round"/>
                  </svg>
                  Processing...
                </>
              ) : plan.btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
