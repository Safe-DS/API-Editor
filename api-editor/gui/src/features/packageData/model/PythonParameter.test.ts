import { PythonParameter } from './PythonParameter';
import { expect, test } from 'vitest';

test('toString', () => {
    const pythonParameter = new PythonParameter('param', 'param', 'param');
    expect(pythonParameter.toString()).toBe(`Parameter "param"`);
});
