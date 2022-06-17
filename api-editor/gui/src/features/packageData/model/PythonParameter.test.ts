import { PythonParameter } from './PythonParameter';

test('toString', () => {
    const pythonParameter = new PythonParameter('param', 'param', 'param');
    expect(pythonParameter.toString()).toBe(`Parameter "param"`);
});
