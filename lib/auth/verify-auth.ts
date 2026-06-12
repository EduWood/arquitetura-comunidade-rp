import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key'
);

interface TokenPayload {
  usuario: {
    id: string;
    email: string;
    role: 'ALUNO' | 'ADMIN' | 'INSTRUCTOR';
  };
}

export async function verifyAuth(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, secret);
    return verified.payload as unknown as TokenPayload;
  } catch (error) {
    console.error('[VerifyAuth] Erro:', error);
    return null;
  }
}
