// JWT utility functions for Edge Runtime compatibility
export function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }
  
  try {
    // Decode base64 and convert to string
    return atob(str);
  } catch (error) {
    throw new Error('Invalid base64url encoding');
  }
}

export function parseJWT(token: string): { header: any; payload: any; signature: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(payload: any): boolean {
  if (!payload.exp) {
    return false; // No expiration set
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export function validateJWTStructure(token: string): boolean {
  const parsed = parseJWT(token);
  if (!parsed) {
    return false;
  }

  const { payload } = parsed;
  
  // Check required fields
  return !!(payload.userId && payload.username && payload.role);
}

export function verifyToken(token: string): { userId: string; username: string; role: string } | null {
  try {
    const parsed = parseJWT(token);
    if (!parsed) {
      return null;
    }

    const { payload } = parsed;
    
    // Check if token is expired
    if (isTokenExpired(payload)) {
      return null;
    }

    // Validate structure
    if (!validateJWTStructure(token)) {
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
