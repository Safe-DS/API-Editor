import PythonClass from './PythonClass'
import PythonFunction from './PythonFunction'
import PythonPackage from './PythonPackage'
import PythonModule from './PythonModule'
import PythonParameter from './PythonParameter'

test('path without parent', () => {
    const pythonClass = new PythonClass('Class')
    expect(pythonClass.path()).toEqual(['Class'])
})

test('path with ancestors', () => {
    const pythonClass = new PythonClass('Class')
    new PythonPackage('package', [new PythonModule('module', [], [], [pythonClass])])

    expect(pythonClass.path()).toEqual(['package', 'module', 'Class'])
})

test('getByRelativePath with correct path', () => {
    const pythonParameter = new PythonParameter('param')
    const pythonClass = new PythonClass('function', [], [], [new PythonFunction('function', [], [pythonParameter])])
    expect(pythonClass.getByRelativePath(['function', 'param'])).toBe(pythonParameter)
})

test('getByRelativePath with misleading path', () => {
    const pythonClass = new PythonClass('Class')
    expect(pythonClass.getByRelativePath(['child'])).toBe(null)
})

test('toString without decorators and superclasses', () => {
    const pythonClass = new PythonClass('Class')
    expect(pythonClass.toString()).toBe('class Class')
})

test('toString with decorators and superclasses', () => {
    const pythonClass = new PythonClass('Class', ['deco1', 'deco2'], ['super1', 'super2'])
    expect(pythonClass.toString()).toBe('@deco1 @deco2 class Class(super1, super2)')
})

export {}
