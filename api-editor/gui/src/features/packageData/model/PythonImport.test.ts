import { PythonImport } from './PythonImport';
import {expect, test} from 'vitest';

test('toString without alias', () => {
    const pythonImport = new PythonImport('module');
    expect(pythonImport.toString()).toBe('import module');
});

test('toString with alias', () => {
    const pythonImport = new PythonImport('module', 'm');
    expect(pythonImport.toString()).toBe('import module as m');
});
