import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';
import PythonResult from './PythonResult';

test('path without parent', () => {
    const pythonResult = new PythonResult('result');
    expect(pythonResult.path()).toEqual(['result']);
});

test('path with ancestors', () => {
    const pythonResult = new PythonResult('result');

    // eslint-disable-next-line no-new
    new PythonPackage('package', [
        new PythonModule(
            'module',
            [],
            [],
            [
                new PythonClass(
                    'Class',
                    [],
                    [],
                    [new PythonFunction('function', [], [], [pythonResult])],
                ),
            ],
        ),
    ]);

    expect(pythonResult.path()).toEqual([
        'package',
        'module',
        'Class',
        'function',
        'result',
    ]);
});

test('getByRelativePath', () => {
    const pythonResult = new PythonResult('result');
    expect(pythonResult.getByRelativePath(['child'])).toBeNull();
});

test('toString', () => {
    const pythonResult = new PythonResult('result');
    expect(pythonResult.toString()).toBe(`Result "result"`);
});
