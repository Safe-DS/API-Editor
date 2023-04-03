import { PythonPackage } from './PythonPackage';
import {expect, test} from 'vitest';

test('toString', () => {
    const pythonPackage = new PythonPackage('distribution', 'package', '0.0.1');
    expect(pythonPackage.toString()).toBe(`Package "distribution/package v0.0.1"`);
});
