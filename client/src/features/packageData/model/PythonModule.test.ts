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
    new PythonPackage('package', [pythonModule]);

    expect(pythonModule.path()).toEqual(['package', 'module']);
});

test('getByRelativePath with correct path', () => {
    const pythonParameter = new PythonParameter('param');
    const pythonModule = new PythonModule(
        'module',
        [],
        [],
        [],
        [new PythonFunction('function', [], [pythonParameter])],
    );
    expect(pythonModule.getByRelativePath(['function', 'param'])).toBe(
        pythonParameter,
    );
});

test('getByRelativePath with misleading path', () => {
    const pythonModule = new PythonModule('module');
    expect(pythonModule.getByRelativePath(['child'])).toBeNull();
});

test('toString', () => {
    const pythonModule = new PythonModule('module');
    expect(pythonModule.toString()).toBe(`Module "module"`);
});
