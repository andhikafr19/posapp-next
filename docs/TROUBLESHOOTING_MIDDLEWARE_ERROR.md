# Troubleshooting Guide - POS Application

## Error: "Cannot find the middleware module"

### Problem Description
Error yang terjadi ketika Next.js tidak dapat memuat middleware.ts karena konflik dengan dependencies atau konfigurasi.

### Root Cause Analysis
1. **JWT Library Conflict**: Penggunaan `jsonwebtoken` library di middleware yang berjalan di Edge Runtime
2. **Module Loading Issues**: Next.js Edge Runtime memiliki keterbatasan dalam memuat Node.js modules
3. **Configuration Issues**: Konfigurasi yang tidak sesuai dengan versi Next.js terbaru

### Solutions Applied

#### 1. Simplified Middleware
**Before (Problematic):**
```typescript
import jwt from 'jsonwebtoken'; // ❌ Tidak kompatibel dengan Edge Runtime

export function middleware(request: NextRequest) {
  // Complex JWT verification in middleware
  const decoded = jwt.verify(token, JWT_SECRET);
  // ...
}
```

**After (Fixed):**
```typescript
// ✅ Simplified middleware
export function middleware(request: NextRequest) {
  // Minimal logic, auth moved to API routes
  return NextResponse.next();
}
```

#### 2. Auth Utilities Separation
Memindahkan JWT verification ke utility functions yang dapat digunakan di API routes:

```typescript
// lib/auth-utils.ts
import jwt from 'jsonwebtoken'; // ✅ OK di API routes

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}
```

#### 3. API Route Protection
Memindahkan authentication logic ke masing-masing API route:

```typescript
// app/api/auth/users/route.ts
import { authenticateRequest, requireAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  const user = authenticateRequest(request);
  if (!requireAdmin(user)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  // ... rest of the logic
}
```

#### 4. Next.js Configuration Update
**Before:**
```typescript
experimental: {
  serverComponentsExternalPackages: ['jsonwebtoken'] // ❌ Deprecated
}
```

**After:**
```typescript
serverExternalPackages: ['jsonwebtoken'] // ✅ Correct syntax
```

### Implementation Steps

#### Step 1: Simplify Middleware
```bash
# Update middleware.ts to minimal implementation
```

#### Step 2: Create Auth Utilities
```bash
# Create lib/auth-utils.ts
# Move JWT verification logic here
```

#### Step 3: Update API Routes
```bash
# Update each protected API route to use auth utilities
# Add proper error handling
```

#### Step 4: Update Configuration
```bash
# Fix next.config.ts configuration
# Remove deprecated options
```

### Prevention Strategies

#### 1. Edge Runtime Compatibility
- Avoid Node.js specific modules in middleware
- Use Web APIs instead of Node.js APIs where possible
- Keep middleware logic minimal

#### 2. Proper Separation of Concerns
- Authentication logic in API routes
- Middleware for simple request/response manipulation
- Utilities for reusable auth functions

#### 3. Configuration Management
- Stay updated with Next.js configuration changes
- Test configuration changes in development
- Use TypeScript for configuration validation

### Testing the Fix

#### 1. Start Development Server
```bash
npm run dev
```

#### 2. Check for Compilation Errors
- No middleware compilation errors
- All API routes compile successfully
- No TypeScript errors

#### 3. Test Authentication Flow
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected route
curl -X GET http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Related Issues and Solutions

#### Issue: JWT Token Not Valid
**Solution:** Ensure JWT_SECRET is consistent across all environments

#### Issue: CORS Errors
**Solution:** Add proper CORS headers in API routes

#### Issue: Session Management
**Solution:** Implement proper token refresh mechanism

### Performance Considerations

#### 1. Middleware Performance
- Simplified middleware reduces request processing time
- Fewer dependencies in Edge Runtime

#### 2. Database Queries
- Cache user permissions when possible
- Use connection pooling for database operations

#### 3. Token Validation
- Implement token caching for frequently accessed routes
- Use shorter token expiration with refresh tokens

### Security Improvements

#### 1. Token Security
```typescript
// Use secure token generation
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '15m', // Shorter expiration
  algorithm: 'HS256'
});
```

#### 2. Request Validation
```typescript
// Validate all inputs
if (!username || username.length < 3) {
  return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
}
```

#### 3. Error Handling
```typescript
// Don't expose internal errors
catch (error) {
  console.error('Internal error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### Monitoring and Debugging

#### 1. Logging
```typescript
// Add structured logging
console.log('Auth attempt:', { username, timestamp: new Date().toISOString() });
```

#### 2. Error Tracking
```typescript
// Track authentication failures
if (!user) {
  console.warn('Failed auth attempt:', { ip: request.ip, userAgent: request.headers.get('user-agent') });
}
```

#### 3. Performance Monitoring
```typescript
// Monitor response times
const start = Date.now();
// ... process request
const duration = Date.now() - start;
console.log('Request duration:', duration, 'ms');
```

### Future Improvements

#### 1. Enhanced Security
- Implement rate limiting
- Add CAPTCHA for repeated failures
- Use refresh tokens

#### 2. Better UX
- Remember user sessions
- Graceful error messages
- Loading states

#### 3. Scalability
- Implement Redis for session storage
- Add horizontal scaling support
- Optimize database queries

## Conclusion

The middleware module error was resolved by:
1. Simplifying middleware to avoid Edge Runtime conflicts
2. Moving authentication logic to API route level
3. Creating reusable auth utilities
4. Updating Next.js configuration to latest standards

This approach provides better separation of concerns, improved maintainability, and better compatibility with Next.js Edge Runtime.
