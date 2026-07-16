import React from 'react';

export default function TodaysPick({ allItems, renderCard }) {
  // Filter for featured items, fallback to top 6 newest if no featured items exist
  let picks = allItems.filter(item => item.rail === 'featured');
  if (picks.length === 0) {
    picks = allItems.slice(0, 6);
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '140px clamp(20px,4vw,56px) 80px', minHeight: '100vh', color: '#fff', animation: 'fadeUp .4s ease' }}>
      <h1 style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
        Today's Picks
      </h1>
      <p style={{ color: 'var(--t2,rgba(255,255,255,0.65))', fontSize: '18px', marginBottom: '48px', maxWidth: '600px', lineHeight: 1.6 }}>
        The absolute best, production-ready designs curated for you today. Stop endlessly tweaking and start shipping immediately.
      </p>

      {picks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', columnGap: '24px', rowGap: '44px', alignItems: 'start' }}>
          {picks.map(item => renderCard(item))}
        </div>
      ) : (
        <div style={{ opacity: 0.5, marginTop: '40px' }}>No picks available at the moment.</div>
      )}
    </div>
  );
}
