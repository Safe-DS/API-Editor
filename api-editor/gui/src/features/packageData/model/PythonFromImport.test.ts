import { PythonFromImport } from './PythonFromImport';
import { expect, test } from 'vitest';

test('toString without alias', () => {
    const pythonFromImport = new PythonFromImport('module', 'declaration');
    expect(pythonFromImport.toString()).toBe('from module import declaration');
});

test('toString with alias', () => {
    const pythonFromImport = new PythonFromImport('module', 'declaration', 'd');
    expect(pythonFromImport.toString()).toBe('from module import declaration as d');
});
