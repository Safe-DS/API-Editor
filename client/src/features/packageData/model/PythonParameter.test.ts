import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';
import PythonParameter from './PythonParameter';

test('path without parent', () => {
    const pythonParameter = new PythonParameter('param');
    expect(pythonParameter.path()).toEqual(['param']);
});

test('path with ancestors', () => {
    const pythonParameter = new PythonParameter('param');
    new PythonPackage('package', [
        new PythonModule(
            'module',
            [],
            [],
            [new PythonClass('Class', [], [], [new PythonFunction('function', [], [pythonParameter])])],
        ),
    ]);

    expect(pythonParameter.path()).toEqual(['package', 'module', 'Class', 'function', 'param']);
});

test('getByRelativePath', () => {
    const pythonParameter = new PythonParameter('param');
    expect(pythonParameter.getByRelativePath(['child'])).toBe(null);
});

test('toString', () => {
    const pythonParameter = new PythonParameter('param');
    expect(pythonParameter.toString()).toBe(`Parameter "param"`);
});

export {};
