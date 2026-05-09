import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to .env.local.");
}

export type TokenPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, SECRET as string, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET as string) as TokenPayload;
  } catch {
    return null;
  }
}
