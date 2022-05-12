import PythonClass from './PythonClass';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';

test('path', () => {
    const pythonPackage = new PythonPackage('distribution', 'package', '0.0.1');
    expect(pythonPackage.path()).toEqual(['package']);
});

test('getByRelativePath with correct path', () => {
    const pythonClass = new PythonClass('Class', 'Class');
    const pythonPackage = new PythonPackage(
        'distribution',
        'package',
        '0.0.1',
        [new PythonModule('module', [], [], [pythonClass])],
    );
    expect(pythonPackage.getByRelativePath(['module', 'Class'])).toBe(
        pythonClass,
    );
});

test('getByRelativePath with misleading path', () => {
    const pythonPackage = new PythonPackage('distribution', 'package', '0.0.1');
    // eslint-disable-next-line testing-library/prefer-presence-queries
    expect(pythonPackage.getByRelativePath(['child'])).toBeNull();
});

test('toString', () => {
    const pythonPackage = new PythonPackage('distribution', 'package', '0.0.1');
    expect(pythonPackage.toString()).toBe(
        `Package "distribution/package v0.0.1"`,
    );
});
