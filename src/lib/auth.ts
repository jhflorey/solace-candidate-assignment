import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'solace-jwt-secret-2024'
);

export async function validateJWT(request: Request): Promise<{ valid: boolean; payload?: any }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false };
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch (error) {
    return { valid: false };
  }
}

export async function createJWT(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export function createAuthErrorResponse(): Response {
  return Response.json(
    { error: 'Unauthorized - Valid JWT token required' },
    { status: 401 }
  );
}
