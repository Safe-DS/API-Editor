import { PythonResult } from './PythonResult';
import {expect, test} from 'vitest';

test('toString', () => {
    const pythonResult = new PythonResult('result');
    expect(pythonResult.toString()).toBe(`Result "result"`);
});
