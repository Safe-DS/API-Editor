import { PythonClass } from './PythonClass';
import {expect, test} from 'vitest';

test('toString without decorators and superclasses', () => {
    const pythonClass = new PythonClass('Class', 'Class', 'Class');
    expect(pythonClass.toString()).toBe('class Class');
});

test('toString with decorators and superclasses', () => {
    const pythonClass = new PythonClass('Class', 'Class', 'Class', ['deco1', 'deco2'], ['super1', 'super2']);
    expect(pythonClass.toString()).toBe('@deco1 @deco2 class Class(super1, super2)');
});
