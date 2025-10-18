// Critical resource preloader
// This script runs immediately to preload the most important resources

(function() {
  'use strict';
  
  // Preload critical crypto icons immediately
  const criticalIcons = [
    'https://assets.coingecko.com/coins/images/1/large/btc.png',
    'https://assets.coingecko.com/coins/images/1027/large/eth.png',
    'https://assets.coingecko.com/coins/images/1839/large/bnb.png',
    'https://assets.coingecko.com/coins/images/4128/large/sol.png',
    'https://assets.coingecko.com/coins/images/52/large/xrp.png',
  ];

  // Preload critical icons
  criticalIcons.forEach(function(iconUrl) {
    var link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = iconUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preload API endpoint
  var apiLink = document.createElement('link');
  apiLink.rel = 'prefetch';
  apiLink.href = '/api/assets?limit=20&sort=volume&dir=desc';
  document.head.appendChild(apiLink);

  console.log('Critical resources preloaded');
})();
