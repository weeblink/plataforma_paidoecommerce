/**
 * Validador de CPF e CNPJ para o frontend
 * Compatível com navegadores antigos
 */

export type DocumentType = 'cpf' | 'cnpj';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class DocumentValidator {
  private static readonly CPF_LENGTH = 11;
  private static readonly CNPJ_LENGTH = 14;

  private static readonly CPF_MULTIPLIERS = {
    first: [10, 9, 8, 7, 6, 5, 4, 3, 2],
    second: [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
  };

  private static readonly CNPJ_MULTIPLIERS = {
    first: [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    second: [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  };

  /**
   * Limpa caracteres não numéricos do documento
   */
  static cleanDocument(document: string): string {
    if (!document) return '';
    return document.replace(/\D/g, '');
  }

  /**
   * Valida se o documento tem apenas dígitos repetidos
   */
  private static hasRepeatedDigits(document: string): boolean {
    return /^(\d)\1+$/.test(document);
  }

  /**
   * Calcula o dígito verificador
   */
  private static calculateDigit(document: string, multipliers: number[]): number {
    let sum = 0;
    for (let i = 0; i < multipliers.length; i++) {
      sum += parseInt(document[i] || '0') * multipliers[i];
    }
    
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  /**
   * Valida CPF
   */
  private static validateCPF(document: string): ValidationResult {
    const cleaned = this.cleanDocument(document);

    if (cleaned.length !== this.CPF_LENGTH) {
      return {
        isValid: false,
        error: 'CPF deve conter 11 dígitos'
      };
    }

    if (this.hasRepeatedDigits(cleaned)) {
      return {
        isValid: false,
        error: 'CPF inválido'
      };
    }

    const firstDigit = this.calculateDigit(cleaned, this.CPF_MULTIPLIERS.first);
    const secondDigit = this.calculateDigit(
      cleaned.substring(0, 9) + firstDigit,
      this.CPF_MULTIPLIERS.second
    );

    const isValid = 
      cleaned[9] === String(firstDigit) && 
      cleaned[10] === String(secondDigit);

    return {
      isValid,
      error: isValid ? undefined : 'CPF inválido'
    };
  }

  /**
   * Valida CNPJ
   */
  private static validateCNPJ(document: string): ValidationResult {
    const cleaned = this.cleanDocument(document);

    if (cleaned.length !== this.CNPJ_LENGTH) {
      return {
        isValid: false,
        error: 'CNPJ deve conter 14 dígitos'
      };
    }

    if (this.hasRepeatedDigits(cleaned)) {
      return {
        isValid: false,
        error: 'CNPJ inválido'
      };
    }

    const firstDigit = this.calculateDigit(cleaned, this.CNPJ_MULTIPLIERS.first);
    const secondDigit = this.calculateDigit(
      cleaned.substring(0, 12) + firstDigit,
      this.CNPJ_MULTIPLIERS.second
    );

    const isValid = 
      cleaned[12] === String(firstDigit) && 
      cleaned[13] === String(secondDigit);

    return {
      isValid,
      error: isValid ? undefined : 'CNPJ inválido'
    };
  }

  /**
   * Valida documento (CPF ou CNPJ)
   */
  static validate(document: string, type: DocumentType): ValidationResult {
    if (!document || !type) {
      return {
        isValid: false,
        error: 'Documento e tipo são obrigatórios'
      };
    }

    const normalizedType = type.toLowerCase() as DocumentType;

    if (normalizedType === 'cpf') {
      return this.validateCPF(document);
    } else if (normalizedType === 'cnpj') {
      return this.validateCNPJ(document);
    }

    return {
      isValid: false,
      error: 'Tipo de documento inválido'
    };
  }

  /**
   * Formata CPF (000.000.000-00)
   */
  static formatCPF(cpf: string): string {
    const cleaned = this.cleanDocument(cpf);
    if (cleaned.length !== 11) return cpf;
    
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata CNPJ (00.000.000/0000-00)
   */
  static formatCNPJ(cnpj: string): string {
    const cleaned = this.cleanDocument(cnpj);
    if (cleaned.length !== 14) return cnpj;
    
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}