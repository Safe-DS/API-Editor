import { PythonClass } from './PythonClass';
import { PythonFunction } from './PythonFunction';
import { PythonModule } from './PythonModule';
import { PythonPackage } from './PythonPackage';
import { PythonParameter } from './PythonParameter';

test('path without parent', () => {
    const pythonParameter = new PythonParameter('param', 'param', 'param');
    expect(pythonParameter.path()).toEqual(['param']);
});

test('path with ancestors', () => {
    const pythonParameter = new PythonParameter('param', 'param', 'param');

    // eslint-disable-next-line no-new
    new PythonPackage('distribution', 'package', '0.0.1', [
        new PythonModule(
            'module',
            'module',
            [],
            [],
            [
                new PythonClass(
                    'Class',
                    'Class',
                    'Class',
                    [],
                    [],
                    [new PythonFunction('function', 'function', 'function', [], [pythonParameter])],
                ),
            ],
        ),
    ]);

    expect(pythonParameter.path()).toEqual(['package', 'module', 'Class', 'function', 'param']);
});

test('getByRelativePath', () => {
    const pythonParameter = new PythonParameter('param', 'param', 'param');
    // eslint-disable-next-line testing-library/prefer-presence-queries
    expect(pythonParameter.getByRelativePath(['child'])).toBeNull();
});

test('toString', () => {
    const pythonParameter = new PythonParameter('param', 'param', 'param');
    expect(pythonParameter.toString()).toBe(`Parameter "param"`);
});
