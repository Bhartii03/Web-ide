export const LiteStudioLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '4px 8px' }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#007acc"/>
      <path d="M10 16L16 10L17.4 11.4L12.8 16L17.4 20.6L16 22L10 16Z" fill="white"/>
      <path d="M22 16L16 22L14.6 20.6L19.2 16L14.6 11.4L16 10L22 16Z" fill="white"/>
      <path d="M17 8L13 24H15L19 8H17Z" fill="white" opacity="0.6"/>
    </svg>
    <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      Lite<span style={{ color: '#007acc' }}>Studio</span>
    </span>
  </div>
);