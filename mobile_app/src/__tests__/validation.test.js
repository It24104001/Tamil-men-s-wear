import { validateEmail, validatePhone, isNotEmpty, validatePassword } from '../utils/validation';

describe('Validation Utils', () => {
  test('validateEmail correctly identifies valid and invalid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.in')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });

  test('validatePhone correctly identifies valid and invalid phone numbers', () => {
    expect(validatePhone('1234567890')).toBe(true);
    expect(validatePhone('  1234567890  ')).toBe(true);
    expect(validatePhone('12345')).toBe(false);
    expect(validatePhone('12345678901')).toBe(false);
    expect(validatePhone('abcdefghij')).toBe(false);
  });

  test('isNotEmpty correctly identifies non-empty values', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('  ')).toBe(false);
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
  });

  test('validatePassword correctly checks length', () => {
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('password123')).toBe(true);
    expect(validatePassword('12345')).toBe(false);
    expect(validatePassword('')).toBe(false);
  });
});
