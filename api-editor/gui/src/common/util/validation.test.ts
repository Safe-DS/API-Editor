import { isValidJsonFile, isValidPythonIdentifier } from './validation';
import {expect, test} from 'vitest';

test('valid name starting with lower case letter', () => {
    const testString = 'hallo_welt';
    expect(isValidPythonIdentifier(testString)).toBeTruthy();
});

test('valid name starting with _', () => {
    const testString = '_hallo_welt';
    expect(isValidPythonIdentifier(testString)).toBeTruthy();
});

test('valid name starting with upper case letter', () => {
    const testString = 'Hallo_welt';
    expect(isValidPythonIdentifier(testString)).toBeTruthy();
});

test('invalid name with %', () => {
    const testString = 'Hallo%welt';
    expect(isValidPythonIdentifier(testString)).toBeFalsy();
});

test('invalid name starting with number', () => {
    const testString = '9Hallo_Welt';
    expect(isValidPythonIdentifier(testString)).toBeFalsy();
});

test('invalid json file name', () => {
    const testString = 'helloWorld.png';
    expect(isValidJsonFile(testString)).toBeFalsy();
});

test('valid json file name', () => {
    const testString = 'helloWorld.json';
    expect(isValidJsonFile(testString)).toBeTruthy();
});
