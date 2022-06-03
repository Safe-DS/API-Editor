// noinspection UnnecessaryLocalVariableJS,DuplicatedCode

import PythonPackage from '../PythonPackage';
import PythonParameter from '../PythonParameter';
import PythonModule from '../PythonModule';
import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import NameFilter from './NameFilter';
import { initialState as annotations } from '../../../annotations/annotationSlice';
import PythonDeclaration from '../PythonDeclaration';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

let pythonPackage: PythonPackage;

beforeEach(() => {
    pythonPackage = new PythonPackage('test_package', 'test_package', '1.0.0', [
        new PythonModule(
            'test_module_1',
            [],
            [],
            [
                new PythonClass(
                    'test_class_1',
                    'test_module_1.test_class_1',
                    [],
                    [],
                    [
                        new PythonFunction(
                            'test_method_1',
                            'test_method_1',
                            'test_module_1.test_class_1.test_method_1',
                            'test_module_1.test_class_1.test_method_1',
                            [],
                            [new PythonParameter('test_parameter_1'), new PythonParameter('test_parameter_2')],
                        ),
                        new PythonFunction(
                            'test_method_2',
                            'test_method_2',
                            'test_module_1.test_class_1.test_method_2',
                            'test_module_1.test_class_1.test_method_2',
                        ),
                    ],
                ),
                new PythonClass('test_class_2', 'test_module_1.test_class_1'),
            ],
            [
                new PythonFunction(
                    'test_global_function_1',
                    'test_global_function_1',
                    'test_module_1.test_global_function_1',
                    'test_module_1.test_global_function_1',
                    [],
                    [new PythonParameter('test_parameter_1'), new PythonParameter('test_parameter_2')],
                ),
                new PythonFunction(
                    'test_global_function_2',
                    'test_global_function_2',
                    'test_module_1.test_global_function_2',
                    'test_module_1.test_global_function_2',
                ),
            ],
        ),
        new PythonModule('test_module_2', [], [], [], []),
    ]);
});

describe('AbstractPythonFilter::applyToPackage', () => {
    test('keeps modules for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameFilter('test_module_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual(['test_class_1', 'test_class_2']);

        const methods = classes[0].methods;
        expect(names(methods)).toEqual(['test_method_1', 'test_method_2']);

        const methodParameters = methods[0].parameters;
        expect(names(methodParameters)).toEqual(['test_parameter_1', 'test_parameter_2']);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual(['test_global_function_1', 'test_global_function_2']);

        const globalFunctionParameters = globalFunctions[0].parameters;
        expect(names(globalFunctionParameters)).toEqual(['test_parameter_1', 'test_parameter_2']);
    });

    test('keeps classes for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameFilter('test_class_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual(['test_class_1']);

        const methods = classes[0].methods;
        expect(names(methods)).toEqual(['test_method_1', 'test_method_2']);

        const methodParameters = methods[0].parameters;
        expect(names(methodParameters)).toEqual(['test_parameter_1', 'test_parameter_2']);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual([]);
    });

    test('keeps methods for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameFilter('test_method_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual(['test_class_1']);

        const methods = classes[0].methods;
        expect(names(methods)).toEqual(['test_method_1']);

        const methodParameters = methods[0].parameters;
        expect(names(methodParameters)).toEqual(['test_parameter_1', 'test_parameter_2']);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual([]);
    });

    test('keeps global functions for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameFilter('test_global_function_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual([]);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual(['test_global_function_1']);

        const globalFunctionParameters = globalFunctions[0].parameters;
        expect(names(globalFunctionParameters)).toEqual(['test_parameter_1', 'test_parameter_2']);
    });

    test('keeps parameters for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameFilter('test_parameter_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual(['test_class_1']);

        const methods = classes[0].methods;
        expect(names(methods)).toEqual(['test_method_1']);

        const methodParameters = methods[0].parameters;
        expect(names(methodParameters)).toEqual(['test_parameter_1']);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual(['test_global_function_1']);

        const globalFunctionParameters = globalFunctions[0].parameters;
        expect(names(globalFunctionParameters)).toEqual(['test_parameter_1']);
    });
});

function names(declarations: PythonDeclaration[]): string[] {
    return declarations.map((it) => it.name);
}
