import PythonClass from './PythonClass'
import PythonFunction from './PythonFunction'
import PythonModule from './PythonModule'
import PythonPackage from './PythonPackage'
import PythonParameter from './PythonParameter'

test('path without parent', () => {
    const pythonFunction = new PythonFunction('function')
    expect(pythonFunction.path()).toEqual(['function'])
})

test('path with ancestors', () => {
    const pythonFunction = new PythonFunction('function')
    new PythonPackage('package', [
        new PythonModule('module', [], [], [new PythonClass('Class', [], [], [pythonFunction])]),
    ])

    expect(pythonFunction.path()).toEqual(['package', 'module', 'Class', 'function'])
})

test('getByRelativePath with correct path', () => {
    const pythonParameter = new PythonParameter('param')
    const pythonFunction = new PythonFunction('function', [], [pythonParameter])
    expect(pythonFunction.getByRelativePath(['param'])).toBe(pythonParameter)
})

test('getByRelativePath with misleading path', () => {
    const pythonFunction = new PythonFunction('function')
    expect(pythonFunction.getByRelativePath(['child'])).toBe(null)
})

test('toString without decorators and parameters', () => {
    const pythonFunction = new PythonFunction('function')
    expect(pythonFunction.toString()).toBe('def function()')
})

test('toString with decorators and parameters', () => {
    const pythonFunction = new PythonFunction(
        'function',
        ['deco1', 'deco2'],
        [new PythonParameter('param1'), new PythonParameter('param2')],
    )

    expect(pythonFunction.toString()).toBe('@deco1 @deco2 def function(param1, param2)')
})

export {}
