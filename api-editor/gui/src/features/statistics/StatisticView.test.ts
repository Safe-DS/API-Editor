import { PythonPackage } from '../packageData/model/PythonPackage';
import { PythonModule } from '../packageData/model/PythonModule';
import { PythonClass } from '../packageData/model/PythonClass';
import { PythonFunction } from '../packageData/model/PythonFunction';
import { PythonParameter } from '../packageData/model/PythonParameter';
import { UsageCountStore } from '../usages/model/UsageCountStore';
import { getClassValues, getFunctionValues, getParameterValues } from './ApiSizeStatistics';
import {expect, test} from 'vitest';

const parameterTest: PythonParameter[] = [
    new PythonParameter(
        'test/test.test/parameterTestClass/privateParameterTestFunction/parameterTest0',
        'parameterTest0',
        'test.test.parameterTestClass.privateParameterTestFunction.parameterTest0',
        '',
        undefined,
        true,
        '',
        '',
        [],
    ),
    new PythonParameter(
        'test/test.test/parameterTestClass/privateParameterTestFunction/parameterTest1',
        'parameterTest1',
        'test.test.parameterTestClass.privateParameterTestFunction.parameterTest1',
        '',
        undefined,
        true,
        '',
        '',
        [],
    ),
    new PythonParameter(
        'test/test.test/parameterTestClass/privateParameterTestFunction/parameterTest2',
        'parameterTest2',
        'test.test.parameterTestClass.privateParameterTestFunction.parameterTest2',
        '',
        undefined,
        true,
        '',
        '',
        [],
    ),
];

const privateParameterTest: PythonParameter[] = [
    new PythonParameter(
        'test/test.test/parameterTestClass/privateParameterTestFunction/privateParameterTest',
        'privateParameterTest',
        'test.test.parameterTestClass.privateParameterTestFunction.privateParameterTest',
        '',
        undefined,
        false,
        '',
        '',
        [],
    ),
];

const testFunctions: PythonFunction[] = [
    new PythonFunction(
        'test/test.test/parameterTestClass/privateTestFunction',
        'privateTestFunction',
        'test.test.parameterTestClass.privateTestFunction',
        [],
        [],
        [],
        false,
        [],
        '',
        '',
    ),
    new PythonFunction(
        'test/test.test/parameterTestClass/testFunction0',
        'testFunction0',
        'test.test.parameterTestClass.testFunction0',
        [],
        [],
        [],
        true,
        [],
        '',
        '',
    ),
    new PythonFunction(
        'test/test.test/parameterTestClass/testFunction1',
        'testFunction1',
        'test.test.parameterTestClass.testFunction1',
        [],
        [],
        [],
        true,
        [],
        '',
        '',
    ),
    new PythonFunction(
        'test/test.test/parameterTestClass/testFunction2',
        'testFunction2',
        'test.test.parameterTestClass.testFunction2',
        [],
        [],
        [],
        true,
        [],
        '',
        '',
    ),
];

const parameterTestFunctions: PythonFunction[] = [
    new PythonFunction(
        'test/test.test/parameterTestClass/privateParameterTestFunction',
        'privateParameterTestFunction',
        'test.test.parameterTestClass.privateParameterTestFunction',
        [],
        privateParameterTest,
        [],
        false,
        [],
        '',
        '',
    ),
    new PythonFunction(
        'test/test.test/parameterTestClass/parameterTestFunction',
        'parameterTestFunction',
        'test.test.parameterTestClass.parameterTestFunction',
        [],
        parameterTest,
        [],
        true,
        [],
        '',
        '',
    ),
];

const testClasses: PythonClass[] = [
    new PythonClass(
        'test/test.test/privateClassTest',
        'privateClassTest',
        'test.test.privateClassTest',
        [],
        [],
        [],
        false,
        [],
        '',
        '',
    ),
    new PythonClass('test/test.test/classTest0', 'classTest0', 'test.test.classTest0', [], [], [], true, [], '', ''),
    new PythonClass('test/test.test/classTest1', 'classTest1', 'test.test.classTest1', [], [], [], true, [], '', ''),
    new PythonClass('test/test.test/classTest2', 'classTest2', 'test.test.classTest2', [], [], [], true, [], '', ''),
    new PythonClass(
        'test/test.test/functionTestClass',
        'functionTestClass',
        'test.test.functionTestClass',
        [],
        [],
        testFunctions,
        true,
        [],
        '',
        '',
    ),
    new PythonClass(
        'test/test.test/parameterTestClass',
        'parameterTestClass',
        'test.test.parameterTestClass',
        [],
        [],
        parameterTestFunctions,
        true,
        [],
        '',
        '',
    ),
];

const testModules = [new PythonModule('test/test.test', 'test.test', [], [], testClasses, [])];
const pythonPackage = new PythonPackage('distribution', 'sklearn', 'version', testModules);
/*--------------------------------------------------------------------------------------------------------------------*/

const parameterUsages = new Map([
    ['test/test.test/parameterTestClass/privateParameterTestFunction/privateParameterTest', 1],
    ['test/test.test/parameterTestClass/privateParameterTestFunction/parameterTest0', 0],
    ['test/test.test/parameterTestClass/privateParameterTestFunction/parameterTest1', 1],
    ['test/test.test/parameterTestClass/privateParameterTestFunction/parameterTest2', 2],
]);

const functionUsages = new Map([
    ['test/test.test/parameterTestClass/privateParameterTestFunction', 1],
    ['test/test.test/parameterTestClass/parameterTestFunction', 0],
    ['test/test.test/parameterTestClass/privateTestFunction', 1],
    ['test/test.test/parameterTestClass/testFunction0', 0],
    ['test/test.test/parameterTestClass/testFunction1', 1],
    ['test/test.test/parameterTestClass/testFunction2', 2],
]);

const classUsages = new Map([
    ['test/test.test/privateClassTest', 1],
    ['test/test.test/classTest0', 0],
    ['test/test.test/classTest1', 1],
    ['test/test.test/classTest2', 2],
    ['test/test.test/functionTestClass', 0],
    ['test/test.test/parameterTestClass', 0],
]);

const moduleUsages = new Map([['test/test.test', 0]]);

const usages: UsageCountStore = new UsageCountStore(
    moduleUsages,
    classUsages,
    functionUsages,
    parameterUsages,
    new Map(),
    pythonPackage,
);

const expectedClassCount = new Map([
    [0, [6, 5, 5]],
    [1, [6, 5, 2]],
    [3, [6, 5, 0]],
]);

const expectedFunctionCount = new Map([
    [0, [6, 4, 4]],
    [1, [6, 4, 2]],
    [3, [6, 4, 0]],
]);

const expectedParameterCount = new Map([
    [0, [4, 3, 3, 0]],
    [1, [4, 3, 2, 0]],
    [3, [4, 3, 0, 0]],
]);

test('getClassValues', () => {
    for (const [usedThreshold, values] of Array.from(expectedClassCount.entries())) {
        expect(getClassValues(pythonPackage, usages, usedThreshold)).toEqual(values);
    }
});

test('getFunctionValues', () => {
    for (const [usedThreshold, values] of Array.from(expectedFunctionCount.entries())) {
        expect(getFunctionValues(pythonPackage, usages, usedThreshold)).toEqual(values);
    }
});

test('getParameterValues', () => {
    for (const [usedThreshold, values] of Array.from(expectedParameterCount.entries())) {
        expect(getParameterValues(pythonPackage, usages, usedThreshold)).toEqual(values);
    }
});
