/**
 * Validador de Cartão de Crédito
 * Implementa algoritmo de Luhn
 */

export interface CardValidationResult {
  isValid: boolean;
  error?: string;
  cardType?: string;
}

export class CardValidator {
  /**
   * Padrões de cartões
   */
  private static readonly CARD_PATTERNS = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    elo: /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})$/,
    hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})$/,
  };

  /**
   * Remove espaços e caracteres não numéricos
   */
  static cleanCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    return cardNumber.replace(/\D/g, '');
  }

  /**
   * Valida usando algoritmo de Luhn
   */
  private static luhnCheck(cardNumber: string): boolean {
    const cleaned = this.cleanCardNumber(cardNumber);
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    // Percorre de trás para frente
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Identifica a bandeira do cartão
   */
  static getCardType(cardNumber: string): string | null {
    const cleaned = this.cleanCardNumber(cardNumber);

    for (const [type, pattern] of Object.entries(this.CARD_PATTERNS)) {
      if (pattern.test(cleaned)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Valida número do cartão
   */
  static validateCardNumber(cardNumber: string): CardValidationResult {
    if (!cardNumber) {
      return {
        isValid: false,
        error: 'Número do cartão é obrigatório'
      };
    }

    const cleaned = this.cleanCardNumber(cardNumber);

    if (cleaned.length < 13 || cleaned.length > 19) {
      return {
        isValid: false,
        error: 'Número do cartão deve ter entre 13 e 19 dígitos'
      };
    }

    if (!this.luhnCheck(cleaned)) {
      return {
        isValid: false,
        error: 'Número do cartão inválido'
      };
    }

    const cardType = this.getCardType(cleaned);

    return {
      isValid: true,
      cardType: cardType || 'unknown'
    };
  }

  /**
   * Valida CVV
   */
  static validateCVV(cvv: string, cardType?: string): CardValidationResult {
    if (!cvv) {
      return {
        isValid: false,
        error: 'CVV é obrigatório'
      };
    }

    const cleaned = cvv.replace(/\D/g, '');

    // Amex usa 4 dígitos, outros usam 3
    const expectedLength = cardType === 'amex' ? 4 : 3;

    if (cleaned.length !== expectedLength) {
      return {
        isValid: false,
        error: `CVV deve ter ${expectedLength} dígitos`
      };
    }

    return { isValid: true };
  }

  /**
   * Valida data de expiração
   */
  static validateExpiration(month: string, year: string): CardValidationResult {
    if (!month || !year) {
      return {
        isValid: false,
        error: 'Mês e ano de expiração são obrigatórios'
      };
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(monthNum) || isNaN(yearNum)) {
      return {
        isValid: false,
        error: 'Mês e ano devem ser numéricos'
      };
    }

    if (monthNum < 1 || monthNum > 12) {
      return {
        isValid: false,
        error: 'Mês inválido'
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear() % 100; // Últimos 2 dígitos
    const currentMonth = now.getMonth() + 1;

    if (yearNum < currentYear) {
      return {
        isValid: false,
        error: 'Cartão expirado'
      };
    }

    if (yearNum === currentYear && monthNum < currentMonth) {
      return {
        isValid: false,
        error: 'Cartão expirado'
      };
    }

    return { isValid: true };
  }

  /**
   * Formata número do cartão (0000 0000 0000 0000)
   */
  static formatCardNumber(cardNumber: string): string {
    const cleaned = this.cleanCardNumber(cardNumber);
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  }

  /**
   * Mascara número do cartão (mantém apenas últimos 4 dígitos)
   */
  static maskCardNumber(cardNumber: string): string {
    const cleaned = this.cleanCardNumber(cardNumber);
    if (cleaned.length < 4) return cardNumber;
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return this.formatCardNumber(masked + lastFour);
  }
}