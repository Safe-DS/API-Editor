import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';
import PythonParameter from './PythonParameter';

test('path without parent', () => {
    const pythonModule = new PythonModule('module');
    expect(pythonModule.path()).toEqual(['module']);
});

test('path with parent', () => {
    const pythonModule = new PythonModule('module');

    // eslint-disable-next-line no-new
    new PythonPackage('distribution', 'package', '0.0.1', [pythonModule]);

    expect(pythonModule.path()).toEqual(['package', 'module']);
});

test('getByRelativePath with correct path', () => {
    const pythonParameter = new PythonParameter('param');
    const pythonModule = new PythonModule(
        'module',
        [],
        [],
        [],
        [
            new PythonFunction(
                'function',
                'function',
                'function',
                'function',
                [],
                [pythonParameter],
            ),
        ],
    );
    expect(pythonModule.getByRelativePath(['function', 'param'])).toBe(
        pythonParameter,
    );
});

test('getByRelativePath with misleading path', () => {
    const pythonModule = new PythonModule('module');
    // eslint-disable-next-line testing-library/prefer-presence-queries
    expect(pythonModule.getByRelativePath(['child'])).toBeNull();
});

test('toString', () => {
    const pythonModule = new PythonModule('module');
    expect(pythonModule.toString()).toBe(`Module "module"`);
});
