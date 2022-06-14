import { PythonClass } from './PythonClass';
import { PythonFunction } from './PythonFunction';
import { PythonModule } from './PythonModule';
import { PythonPackage } from './PythonPackage';
import { PythonParameter } from './PythonParameter';

test('toString without decorators and parameters', () => {
    const pythonFunction = new PythonFunction('function', 'function', 'function');
    expect(pythonFunction.toString()).toBe('def function()');
});

test('toString with decorators and parameters', () => {
    const pythonFunction = new PythonFunction(
        'function',
        'function',
        'function',
        ['deco1', 'deco2'],
        [new PythonParameter('param1', 'param1', 'param1'), new PythonParameter('param2', 'param2', 'param2')],
    );

    expect(pythonFunction.toString()).toBe('@deco1 @deco2 def function(param1, param2)');
});
