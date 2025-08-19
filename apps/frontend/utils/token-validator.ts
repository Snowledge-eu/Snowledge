export class TokenValidator {
  private static instance: TokenValidator;
  private tokenCache = new Map<string, { valid: boolean; exp: number }>();

  static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator();
    }
    return TokenValidator.instance;
  }

  isValid(token: string): boolean {
    if (!token) return false;

    const cached = this.tokenCache.get(token);
    if (cached && cached.exp > Date.now()) {
      return cached.valid;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isValid = payload.exp * 1000 > Date.now();
      
      this.tokenCache.set(token, {
        valid: isValid,
        exp: Date.now() + 60000 // Cache pour 1 minute
      });
      
      return isValid;
    } catch {
      this.tokenCache.set(token, {
        valid: false,
        exp: Date.now() + 60000
      });
      return false;
    }
  }

  getExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  clearCache(): void {
    this.tokenCache.clear();
  }

  // Nettoyer le cache des tokens expirés
  cleanupCache(): void {
    const now = Date.now();
    for (const [token, data] of this.tokenCache.entries()) {
      if (data.exp < now) {
        this.tokenCache.delete(token);
      }
    }
  }
}

// Instance singleton
export const tokenValidator = TokenValidator.getInstance();
