import PythonClass from './PythonClass';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';

test('path', () => {
    const pythonPackage = new PythonPackage('package');
    expect(pythonPackage.path()).toEqual(['package']);
});

test('getByRelativePath with correct path', () => {
    const pythonClass = new PythonClass('Class');
    const pythonPackage = new PythonPackage('package', [new PythonModule('module', [], [], [pythonClass])]);
    expect(pythonPackage.getByRelativePath(['module', 'Class'])).toBe(pythonClass);
});

test('getByRelativePath with misleading path', () => {
    const pythonPackage = new PythonPackage('package');
    expect(pythonPackage.getByRelativePath(['child'])).toBe(null);
});

test('toString', () => {
    const pythonPackage = new PythonPackage('package');
    expect(pythonPackage.toString()).toBe(`Package "package"`);
});

export {};
