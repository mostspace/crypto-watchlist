# Crypto Watchlist

A real-time cryptocurrency watchlist application built with Next.js 15 and React 19.

## Features

### Core Functionality
- **Real-time Data**: Live cryptocurrency prices from Binance API with CoinGecko fallback
- **Infinite Scrolling**: Efficiently load thousands of assets with pagination
- **Advanced Search**: Global search across all cryptocurrencies with autocomplete
- **Favorites Management**: Save and manage your watchlist with persistent storage
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Excellence
- **Performance Optimized**: Multi-stage Docker builds, caching, and lazy loading
- **Error Handling**: Comprehensive error boundaries and graceful degradation
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Testing**: 90%+ test coverage with Jest and React Testing Library
- **Monitoring**: Built-in logging, metrics, and health checks

### User Experience
- **Glassmorphism UI**: Modern, elegant interface with smooth animations
- **Dark Theme**: Eye-friendly dark mode optimized for trading environments
- **Sorting & Filtering**: Sort by price, volume, or 24h change
- **Asset Details**: Detailed modal views with comprehensive information
- **Offline Support**: Service worker for basic offline functionality

## Tech Stack

### Frontend
- **Next.js 15.5.5** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 3.4.18** - Utility-first styling
- **Custom Hooks** - Reusable state management logic

### Backend & APIs
- **Next.js API Routes** - Serverless API endpoints
- **Binance API** - Primary data source for real-time prices
- **CoinGecko API** - Fallback data source
- **Rate Limiting** - Built-in request throttling
- **Caching** - In-memory caching with TTL

### DevOps & Testing
- **Docker** - Multi-stage production builds
- **Jest** - Unit and integration testing
- **ESLint** - Code quality and consistency
- **GitHub Actions** - CI/CD pipeline (ready)

## Installation

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Docker (optional)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/mostspace/crypto-watchlist.git
cd crypto-watchlist

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Docker Setup

```bash
# Build and run with Docker Compose
npm run docker:compose

# Or build manually
npm run docker:build
npm run docker:run
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: API rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_WINDOW_MS=60000

# Optional: Authentication (for future features)
AUTH_SECRET=your-secret-key

# Optional: Logging level
LOG_LEVEL=INFO
```

### API Configuration

The application automatically handles API configuration:
- **Binance API**: No authentication required for public endpoints
- **CoinGecko API**: Free tier with rate limiting
- **Fallback Strategy**: Automatic failover between APIs

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Coverage
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: API routes and data fetching
- **E2E Tests**: User interactions and workflows
- **Accessibility Tests**: WCAG compliance verification

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Production

```bash
# Build production image
docker build -t crypto-watchlist .

# Run production container
docker run -p 3000:3000 crypto-watchlist
```

### Environment-Specific Deployments

The application is ready for deployment on:
- **Vercel** - Zero-config Next.js deployment
- **Docker** - Containerized deployment
- **Kubernetes** - Scalable container orchestration
- **AWS/GCP/Azure** - Cloud platform deployment

## Performance

### Metrics
- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.1s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching Strategy**: Multi-layer caching implementation

## API Documentation

### Endpoints

#### `GET /api/assets`
Fetch cryptocurrency data with filtering and pagination.

**Query Parameters:**
- `limit` (number): Number of assets to return (default: 20, max: 100)
- `offset` (number): Pagination offset (default: 0)
- `quote` (string): Quote currency (default: "USDT")
- `sort` (string): Sort field - "volume", "price", "change" (default: "volume")
- `dir` (string): Sort direction - "asc", "desc" (default: "desc")
- `symbols` (string): Comma-separated list of specific symbols

**Response:**
```json
{
  "data": [
    {
      "symbol": "BTCUSDT",
      "lastPrice": 43250.50,
      "changePercent": 2.45,
      "quoteVolume": 1234567890.12,
      "name": "Bitcoin"
    }
  ],
  "requestId": "req_123456789"
}
```

#### `GET /api/search`
Search cryptocurrencies by symbol or name.

#### `GET /api/health`
Health check endpoint for monitoring.

## Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/           # React components
│   ├── AssetTable.tsx    # Main data table
│   ├── AssetRow.tsx      # Individual asset row
│   ├── GlobalSearch.tsx  # Search functionality
│   └── ...
├── contexts/             # React contexts
│   ├── FavoritesContext.tsx
│   └── ToastContext.tsx
├── hooks/                # Custom hooks
│   ├── useFavorites.ts
│   ├── useInfiniteAssets.ts
│   └── useSearch.ts
└── lib/                  # Utilities and configurations
    ├── binance.ts        # API integration
    ├── types.ts          # TypeScript types
    ├── validation.ts     # Input validation
    └── ...
```

### Data Flow
1. **API Layer**: Binance/CoinGecko data fetching with fallback
2. **Caching Layer**: In-memory caching with TTL
3. **Validation Layer**: Zod schema validation
4. **Component Layer**: React components with hooks
5. **State Management**: Context API for global state

## Security

### Implemented Security Measures
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Request throttling to prevent abuse
- **CORS Protection**: Proper CORS headers
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Next.js CSRF tokens
- **Error Handling**: Secure error messages without data leakage

### Security Best Practices
- No sensitive data in client-side code
- Environment variables for configuration
- Regular dependency updates
- Security headers implementation

## Contributing

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Test Coverage**: Minimum 80% coverage

## Troubleshooting

### Common Issues

**API Rate Limiting**
```bash
# Check rate limit status
curl -I http://localhost:3000/api/assets
```

**Docker Build Issues**
```bash
# Clean Docker cache
docker system prune -a
```

**Test Failures**
```bash
# Clear Jest cache
npm test -- --clearCache
```

**Built with by Maksym Naidonov**