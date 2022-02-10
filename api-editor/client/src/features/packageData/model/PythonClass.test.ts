import PythonClass from './PythonClass';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';
import PythonParameter from './PythonParameter';

test('path without parent', () => {
    const pythonClass = new PythonClass('Class', 'Class');
    expect(pythonClass.path()).toEqual(['Class']);
});

test('path with ancestors', () => {
    const pythonClass = new PythonClass('Class', 'Class');

    // eslint-disable-next-line no-new
    new PythonPackage('distribution', 'package', '0.0.1', [
        new PythonModule('module', [], [], [pythonClass]),
    ]);

    expect(pythonClass.path()).toEqual(['package', 'module', 'Class']);
});

test('getByRelativePath with correct path', () => {
    const pythonParameter = new PythonParameter('param');
    const pythonClass = new PythonClass(
        'Class',
        'Class',
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
    expect(pythonClass.getByRelativePath(['function', 'param'])).toBe(
        pythonParameter,
    );
});

test('getByRelativePath with misleading path', () => {
    const pythonClass = new PythonClass('Class', 'Class');
    // eslint-disable-next-line testing-library/prefer-presence-queries
    expect(pythonClass.getByRelativePath(['child'])).toBeNull();
});

test('toString without decorators and superclasses', () => {
    const pythonClass = new PythonClass('Class', 'Class');
    expect(pythonClass.toString()).toBe('class Class');
});

test('toString with decorators and superclasses', () => {
    const pythonClass = new PythonClass(
        'Class',
        'Class',
        ['deco1', 'deco2'],
        ['super1', 'super2'],
    );
    expect(pythonClass.toString()).toBe(
        '@deco1 @deco2 class Class(super1, super2)',
    );
});
