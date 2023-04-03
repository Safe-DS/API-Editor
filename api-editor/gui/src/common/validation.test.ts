import {numberPattern, booleanPattern, moduleNamePattern} from './validation';
import {expect, test} from 'vitest';

test('valid natural number', () => {
    const testNumber = '1';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('valid negative integer', () => {
    const testNumber = '-1234567890';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('valid negative decimal number', () => {
    const testNumber = '-1234567890.0';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('invalid negative decimal number with ending "."', () => {
    const testNumber = '-1234567890.';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('zero is a valid decimal number', () => {
    const testNumber = '0';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('number with leading "+" is not a valid decimal number', () => {
    const testNumber = '+1234567890.1234567890';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('number with leading 0 is not a valid number', () => {
    const testNumber = '015';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('negative number with empty integer part is a valid number', () => {
    const testNumber = '-.2';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('positive number with empty integer part is a valid number', () => {
    const testNumber = '.01';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('empty negative decimal number is not a valid number', () => {
    const testNumber = '-.';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('number with "-" sign in the middle is not a valid number', () => {
    const testNumber = '15-67';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('number with "+" sign in the middle is not a valid number', () => {
    const testNumber = '15+67';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('letter is not a valid number', () => {
    const testNumber = 'a';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('number containing a letter is not a valid number', () => {
    const testNumber = '12345a';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('valid integer with exponent', () => {
    const testNumber = '12e3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('valid integer with exponent "+"', () => {
    const testNumber = '12e+3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('valid number with exponent and "-"', () => {
    const testNumber = '12.1e-3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('valid negative number with negative exponent', () => {
    const testNumber = '-0.12E-3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('valid negative number with empty integer part and negative exponent', () => {
    const testNumber = '-.12E-3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeTruthy();
});

test('invalid number containing two "e"', () => {
    const testNumber = '1e2e3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('invalid number only containing exponent', () => {
    const testNumber = 'e3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('invalid number containing only "E"', () => {
    const testNumber = 'E';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('invalid number containing two exponents', () => {
    const testNumber = '1E5e3';
    expect(Boolean(testNumber.match(numberPattern.value))).toBeFalsy();
});

test('"true" is a valid boolean', () => {
    const testValue = 'true';
    expect(Boolean(testValue.match(booleanPattern.value))).toBeTruthy();
});

test('"false" is a valid boolean', () => {
    const testValue = 'false';
    expect(Boolean(testValue.match(booleanPattern.value))).toBeTruthy();
});

test('"random" is not a valid boolean', () => {
    const testValue = 'random';
    expect(Boolean(testValue.match(booleanPattern.value))).toBeFalsy();
});

test('number is not a valid boolean', () => {
    const testValue = '0';
    expect(Boolean(testValue.match(booleanPattern.value))).toBeFalsy();
});

test('negative number is not a valid boolean', () => {
    const testValue = '-1';
    expect(Boolean(testValue.match(booleanPattern.value))).toBeFalsy();
});

test('"m0dule" is a valid module path"', () => {
    const testValue = 'package';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeTruthy();
});

test('"Module2" is a valid module path"', () => {
    const testValue = 'Module2';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeTruthy();
});

test('"Module.base2" is a valid module path"', () => {
    const testValue = 'Module.base2';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeTruthy();
});

test('"P/M" is not a valid module path"', () => {
    const testValue = 'P/M';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeFalsy();
});

test('"P/234" is not a valid module name"', () => {
    const testValue = 'P/234';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeFalsy();
});

test('"P_module" is a valid module path"', () => {
    const testValue = 'P_module';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeTruthy();
});

test('"module.base" is not a valid module path"', () => {
    const testValue = 'module.base';
    expect(Boolean(testValue.match(moduleNamePattern.value))).toBeTruthy();
});
