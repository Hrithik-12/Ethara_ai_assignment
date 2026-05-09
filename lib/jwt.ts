import jwt from "jsonwebtoken";

export type TokenPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  return s;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, secret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, secret()) as TokenPayload;
  } catch {
    return null;
  }
}
