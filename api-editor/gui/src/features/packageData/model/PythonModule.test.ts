import { PythonModule } from './PythonModule';

test('toString', () => {
    const pythonModule = new PythonModule('module', 'module');
    expect(pythonModule.toString()).toBe(`Module "module"`);
});
