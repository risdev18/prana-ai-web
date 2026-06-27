import React from 'react';

// Reusable shimmer skeleton block
export const SkeletonBlock = ({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius, flexShrink: 0, ...style }}
  />
);

// Skeleton for a member table row
export const SkeletonMemberRow = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-2)',
    alignItems: 'center',
    gap: '12px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <SkeletonBlock width="36px" height="36px" borderRadius="50%" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        <SkeletonBlock width="120px" height="14px" />
        <SkeletonBlock width="80px" height="11px" />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <SkeletonBlock width="90px" height="13px" />
      <SkeletonBlock width="60px" height="10px" />
    </div>
    <SkeletonBlock width="50px" height="13px" />
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <SkeletonBlock width="32px" height="32px" borderRadius="8px" />
      <SkeletonBlock width="32px" height="32px" borderRadius="8px" />
    </div>
  </div>
);

// Skeleton for a stat card
export const SkeletonStatCard = () => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '20px', padding: '22px 24px',
    display: 'flex', flexDirection: 'column', gap: '12px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SkeletonBlock width="40px" height="40px" borderRadius="12px" />
      <SkeletonBlock width="100px" height="12px" />
    </div>
    <SkeletonBlock width="80px" height="32px" borderRadius="8px" />
    <SkeletonBlock width="120px" height="10px" />
  </div>
);

// Full table skeleton (header + n rows)
export const SkeletonTable = ({ rows = 8 }) => (
  <div style={{
    background: 'rgba(11, 16, 32, 0.35)', border: '1px solid var(--border)',
    borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(12px)'
  }}>
    {/* Header */}
    <div style={{
      display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr',
      padding: '14px 24px',
      background: 'rgba(20, 16, 50, 0.65)',
      borderBottom: '1px solid var(--border)',
      gap: '12px'
    }}>
      {['40%', '60%', '50%', '70%'].map((w, i) => (
        <SkeletonBlock key={i} width={w} height="10px" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonMemberRow key={i} />
    ))}
  </div>
);

export default SkeletonTable;
