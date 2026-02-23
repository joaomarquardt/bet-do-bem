# BetDoBem - Mobile Frontend

Gamified social betting app (P2P) built with Expo/React Native. Users challenge friends to real-world feats, post proof, and the community votes on winners.

## Architecture

- **Frontend**: Expo Router (file-based routing) with React Native
- **Backend**: External Java/Spring Boot API (not in this repo)
- **State**: React Context + AsyncStorage (mock data), React Query hooks ready for API integration
- **Auth**: JWT-based (mock mode, ready for real backend)

## Project Structure

```
app/                          # Expo Router screens (file-based routing)
  _layout.tsx                 # Root layout (providers, auth guard, fonts)
  (auth)/                     # Auth flow (modal presentation)
    _layout.tsx
    login.tsx
    register.tsx
  (tabs)/                     # Main tab navigation
    _layout.tsx               # Tab bar config (NativeTabs + classic fallback)
    index.tsx                 # Feed screen (judge community bets)
    dashboard.tsx             # My bets management
    profile.tsx               # Profile, wallet, transactions

components/                   # UI components organized by domain
  ui/                         # Reusable primitives
    Avatar.tsx
  feed/                       # Feed-specific
    BetCard.tsx
    BetCard.styles.ts
  dashboard/                  # Dashboard-specific
    MyBetCard.tsx
    MyBetCard.styles.ts
  profile/                    # Profile-specific
    TransactionItem.tsx
    TransactionItem.styles.ts
  ErrorBoundary.tsx           # App-level error boundary
  ErrorFallback.tsx

constants/
  colors.ts                   # Theme colors (dark theme with green accent)

lib/
  api/                        # API layer (ready for Spring Boot backend)
    client.ts                 # HTTP client with JWT auth headers
    auth.service.ts           # Auth endpoints (login, register, logout, getMe)
    bets.service.ts           # Bets endpoints (feed, myBets, create, vote, proof)
    wallet.service.ts         # Wallet endpoints (balance, transactions)
    index.ts                  # Barrel export
  contexts/                   # React contexts
    auth.context.tsx          # Auth state (user, login, register, logout)
    bets.context.tsx          # Bets state (feed, myBets, wallet, CRUD operations)
    index.ts
  hooks/                      # React Query hooks (for API integration)
    useAuthQuery.ts
    useBetsQuery.ts
    useWalletQuery.ts
    index.ts
  mocks/                      # Mock data for development
    data.ts
  types/                      # TypeScript interfaces
    index.ts                  # All domain types + API request/response types
  utils/
    formatters.ts             # Date, currency, text formatters
  query-client.ts             # React Query client config

styles/                       # Extracted StyleSheet files
  auth/
    auth.styles.ts            # Login + register styles
  tabs/
    feed.styles.ts
    dashboard.styles.ts
    profile.styles.ts

server/                       # Express backend (landing page + API proxy)
  index.ts
  routes.ts
  templates/landing-page.html
```

## API Integration Guide

The app is pre-configured to connect to a Spring Boot backend. To switch from mock data to real API:

1. Set `EXPO_PUBLIC_API_URL` env var to your backend URL (e.g., `https://api.betdobem.com/api`)
2. In `lib/contexts/auth.context.tsx`: Replace mock login/register with `authService` calls (marked with TODO comments)
3. In `lib/contexts/bets.context.tsx`: Replace mock operations with `betsService`/`walletService` calls (marked with TODO comments)
4. The React Query hooks in `lib/hooks/` are ready to use as an alternative to context-based state

### API Client (`lib/api/client.ts`)
- Automatic JWT token management (stored in AsyncStorage)
- Bearer token injection in Authorization header
- Auto-logout on 401 responses
- Type-safe request/response handling

### Expected Backend Endpoints
- `POST /auth/login` → `{ user, tokens: { accessToken, refreshToken } }`
- `POST /auth/register` → `{ user, tokens }`
- `GET /users/me` → `User`
- `GET /feed?page=0&size=10` → `PaginatedResponse<Bet>`
- `GET /bets/me?page=0&size=20` → `PaginatedResponse<Bet>`
- `POST /bets` → `Bet`
- `POST /bets/:id/accept` → `Bet`
- `POST /bets/:id/decline` → `void`
- `POST /votes` → `void`
- `POST /proofs` → `void`
- `GET /wallet` → `Wallet`
- `GET /wallet/transactions` → `PaginatedResponse<Transaction>`

## Key Dependencies

- expo ~54, expo-router ~6, react-native 0.81
- @tanstack/react-query (server state)
- @react-native-async-storage/async-storage (persistence)
- @expo-google-fonts/inter (typography)
- expo-crypto (UUID generation)
- expo-haptics (haptic feedback)
- react-native-reanimated (animations)
- expo-glass-effect (iOS 26 liquid glass tabs)

## Workflows

- `Start Backend`: Express server on port 5000 (landing page + API proxy)
- `Start Frontend`: Expo dev server on port 8081 (HMR enabled)
