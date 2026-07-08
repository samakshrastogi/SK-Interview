import { Token, ITokenDocument } from '../models/Token';

export class TokenRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<ITokenDocument> {
    const sessionToken = new Token({
      userId,
      token,
      expiresAt,
    });
    return sessionToken.save();
  }

  async findByToken(token: string): Promise<ITokenDocument | null> {
    return Token.findOne({ token });
  }

  async deleteByToken(token: string): Promise<any> {
    return Token.deleteOne({ token });
  }

  async deleteAllForUser(userId: string): Promise<any> {
    return Token.deleteMany({ userId });
  }
}
export const tokenRepository = new TokenRepository();
