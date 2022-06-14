import { PythonResult } from './PythonResult';

test('toString', () => {
    const pythonResult = new PythonResult('result');
    expect(pythonResult.toString()).toBe(`Result "result"`);
});
