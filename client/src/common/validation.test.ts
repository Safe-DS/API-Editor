import { numberPattern, booleanPattern } from './validation';

test('valid natural number', () => {
    const testNumber = '1';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('valid negative integer', () => {
    const testNumber = '-1234567890';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('valid negative decimal number', () => {
    const testNumber = '-1234567890.0';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('valid negative decimal number with ending "."', () => {
    const testNumber = '-1234567890.';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('zero is a valid decimal number', () => {
    const testNumber = '0';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('number with leading "+" is a valid decimal number', () => {
    const testNumber = '+1234567890.1234567890';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('number with leading 0 is not a valid number', () => {
    const testNumber = '015';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(false);
});

test('negative number with empty integer part is a valid number', () => {
    const testNumber = '-.2';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(true);
});

test('empty negative decimal number is not a valid number', () => {
    const testNumber = '-.';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(false);
});

test('number with "-" sign in the middle is not a valid number', () => {
    const testNumber = '15-67';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(false);
});

test('number with "+" sign in the middle is not a valid number', () => {
    const testNumber = '15+67';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(false);
});

test('letter is not a valid number', () => {
    const testNumber = 'a';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(false);
});

test('number containing a letter is not a valid number', () => {
    const testNumber = '12345a';
    expect(Boolean(testNumber.match(numberPattern.value))).toEqual(false);
});

test('"true" is a valid boolean', () => {
    const testNumber = 'true';
    expect(Boolean(testNumber.match(booleanPattern.value))).toEqual(true);
});

test('"false" is a valid boolean', () => {
    const testNumber = 'false';
    expect(Boolean(testNumber.match(booleanPattern.value))).toEqual(true);
});

test('"random" is not a valid boolean', () => {
    const testNumber = 'random';
    expect(Boolean(testNumber.match(booleanPattern.value))).toEqual(false);
});

test('number is not a valid boolean', () => {
    const testNumber = '0';
    expect(Boolean(testNumber.match(booleanPattern.value))).toEqual(false);
});

test('negative number is not a valid boolean', () => {
    const testNumber = '-1';
    expect(Boolean(testNumber.match(booleanPattern.value))).toEqual(false);
});
