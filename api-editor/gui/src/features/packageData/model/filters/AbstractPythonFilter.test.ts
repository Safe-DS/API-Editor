// noinspection UnnecessaryLocalVariableJS,DuplicatedCode

import { PythonPackage } from '../PythonPackage';
import { PythonParameter } from '../PythonParameter';
import { PythonModule } from '../PythonModule';
import { PythonClass } from '../PythonClass';
import { PythonFunction } from '../PythonFunction';
import { NameStringFilter } from './NameStringFilter';
import { initialAnnotationStore as annotations } from '../../../annotations/annotationSlice';
import { PythonDeclaration } from '../PythonDeclaration';
import { UsageCountStore } from '../../../usages/model/UsageCountStore';

let pythonPackage: PythonPackage;

beforeEach(() => {
    pythonPackage = new PythonPackage('test_package', 'test_package', '1.0.0', [
        new PythonModule(
            'test_package/test_module_1',
            'test_module_1',
            [],
            [],
            [
                new PythonClass(
                    'test_package/test_module_1/test_class_1',
                    'test_class_1',
                    'test_module_1.test_class_1',
                    [],
                    [],
                    [
                        new PythonFunction(
                            'test_package/test_module_1/test_class_1/test_method_1',
                            'test_method_1',
                            'test_module_1.test_class_1.test_method_1',
                            [],
                            [
                                new PythonParameter(
                                    'test_package/test_module_1/test_class_1/test_method_1/test_parameter_1',
                                    'test_parameter_1',
                                    'test_module_1.test_class_1.test_method_1.test_parameter_1',
                                ),
                                new PythonParameter(
                                    'test_package/test_module_1/test_class_1/test_method_1/test_parameter_2',
                                    'test_parameter_2',
                                    'test_module_1.test_class_1.test_method_1.test_parameter_2',
                                ),
                            ],
                        ),
                        new PythonFunction(
                            'test_package/test_module_1/test_class_1/test_method_2',
                            'test_method_2',
                            'test_module_1.test_class_1.test_method_2',
                        ),
                    ],
                ),
                new PythonClass(
                    'test_package/test_module_1/test_class_2',
                    'test_class_2',
                    'test_module_1.test_class_2',
                ),
            ],
            [
                new PythonFunction(
                    'test_package/test_module_1/test_global_function_1',
                    'test_global_function_1',
                    'test_module1.test_global_function_1',
                    [],
                    [
                        new PythonParameter(
                            'test_package/test_module_1/test_global_function_1/test_parameter_1',
                            'test_parameter_1',
                            'test_module1.test_global_function_1.test_parameter_1',
                        ),
                        new PythonParameter(
                            'test_package/test_module_1/test_global_function_1/test_parameter_2',
                            'test_parameter_2',
                            'test_module1.test_global_function_1.test_parameter_2',
                        ),
                    ],
                ),
                new PythonFunction(
                    'test_package/test_module_1/test_global_function_2',
                    'test_global_function_2',
                    'test_module_1.test_global_function_2',
                ),
            ],
        ),
        new PythonModule('test_package/test_module_2', 'test_module_2', [], [], [], []),
    ]);
});

describe('AbstractPythonFilter::applyToPackage', () => {
    test('keeps modules for which the filter returns true, and their ancestors.', () => {
        const filter = new NameStringFilter('test_module_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual([]);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual([]);
    });

    test('keeps classes for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameStringFilter('test_class_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual(['test_class_1']);

        const methods = classes[0].methods;
        expect(names(methods)).toEqual([]);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual([]);
    });

    test('keeps methods for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameStringFilter('test_method_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual(['test_class_1']);

        const methods = classes[0].methods;
        expect(names(methods)).toEqual(['test_method_1']);

        const methodParameters = methods[0].parameters;
        expect(names(methodParameters)).toEqual([]);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual([]);
    });

    test('keeps global functions for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameStringFilter('test_global_function_1');
        const filteredPackage = filter.applyToPackage(pythonPackage, annotations, new UsageCountStore());

        const modules = filteredPackage.modules;
        expect(names(modules)).toEqual(['test_module_1']);

        const classes = modules[0].classes;
        expect(names(classes)).toEqual([]);

        const globalFunctions = modules[0].functions;
        expect(names(globalFunctions)).toEqual(['test_global_function_1']);

        const globalFunctionParameters = globalFunctions[0].parameters;
        expect(names(globalFunctionParameters)).toEqual([]);
    });

    test('keeps parameters for which the filter returns true, their ancestors, and their descendants', () => {
        const filter = new NameStringFilter('test_parameter_1');
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

const names = function (declarations: PythonDeclaration[]): string[] {
    return declarations.map((it) => it.name);
};
