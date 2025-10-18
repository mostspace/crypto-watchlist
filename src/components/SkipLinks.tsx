'use client';

export function SkipLinks() {
  return (
    <div className="skip-links">
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      >
        Skip to main content
      </a>
      <a 
        href="#search-input" 
        className="skip-link"
        onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
      >
        Skip to search
      </a>
    </div>
  );
}
