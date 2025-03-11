<?php

namespace App\Classes\Payments;

class DocumentValidator
{
    private const VALID_TYPES = ['cpf', 'cnpj'];

    private const CPF_LENGTH = 11;
    private const CNPJ_LENGTH = 14;

    private const CPF_MULTIPLIERS = [
        'first' => [10, 9, 8, 7, 6, 5, 4, 3, 2],
        'second' => [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
    ];

    private const CNPJ_MULTIPLIERS = [
        'first' => [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
        'second' => [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    ];

    public static function validate(string $documentNumber, string $type): bool
    {
        $type = strtolower($type);
        if (!in_array($type, self::VALID_TYPES)) {
            return false;
        }

        $document = self::cleanDocument($documentNumber);
        return match($type) {
            'cpf' => self::validateCPF($document),
            'cnpj' => self::validateCNPJ($document),
            default => false,
        };
    }

    private static function cleanDocument(string $document): string
    {
        return preg_replace('/[^0-9]/', '', $document);
    }

    private static function validateCPF(string $document): bool
    {
        if (!self::isValidLength($document, self::CPF_LENGTH) || self::hasRepeatedDigits($document)) {
            return false;
        }

        $firstDigit = self::calculateDigit($document, self::CPF_MULTIPLIERS['first']);
        $secondDigit = self::calculateDigit($document . $firstDigit, self::CPF_MULTIPLIERS['second']);

        return $document[-2] == $firstDigit && $document[-1] == $secondDigit;
    }

    private static function validateCNPJ(string $document): bool
    {
        if (!self::isValidLength($document, self::CNPJ_LENGTH) || self::hasRepeatedDigits($document)) {
            return false;
        }

        $firstDigit = self::calculateDigit($document, self::CNPJ_MULTIPLIERS['first']);
        $secondDigit = self::calculateDigit($document . $firstDigit, self::CNPJ_MULTIPLIERS['second']);

        return $document[-2] == $firstDigit && $document[-1] == $secondDigit;
    }

    private static function calculateDigit(string $document, array $multipliers): int
    {
        $sum = 0;
        foreach ($multipliers as $index => $multiplier) {
            $sum += (int)$document[$index] * $multiplier;
        }

        $remainder = $sum % 11;
        return $remainder < 2 ? 0 : 11 - $remainder;
    }

    private static function isValidLength(string $document, int $length): bool
    {
        return strlen($document) === $length;
    }

    private static function hasRepeatedDigits(string $document): bool
    {
        return preg_match('/^(\d)\1*$/', $document);
    }
}
