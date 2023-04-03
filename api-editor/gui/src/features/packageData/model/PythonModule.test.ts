import { PythonModule } from './PythonModule';
import { expect, test } from 'vitest';

test('toString', () => {
    const pythonModule = new PythonModule('module', 'module');
    expect(pythonModule.toString()).toBe(`Module "module"`);
});
