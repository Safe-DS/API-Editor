import { Optional } from '../../common/util/types';
import { PythonDeclaration } from './model/PythonDeclaration';
import { PythonClass } from './model/PythonClass';
import { PythonParameter } from './model/PythonParameter';
import { PythonModule } from './model/PythonModule';
import { PythonFunction } from './model/PythonFunction';
import { PythonPackage } from './model/PythonPackage';

export const buildMinimalAPIJson = function (declaration: Optional<PythonDeclaration>): string {
    let result: PythonPackage;

    if (declaration instanceof PythonModule) {
        result = buildMinimalModule(declaration);
    } else if (declaration instanceof PythonClass) {
        result = buildMinimalClass(declaration);
    } else if (declaration instanceof PythonFunction) {
        result = buildMinimalFunction(declaration);
    } else if (declaration instanceof PythonParameter) {
        result = buildMinimalParameter(declaration);
    } else {
        result = new PythonPackage('test', 'test', '0.0.1');
    }

    return JSON.stringify(result.toJson(), null, 4);
};

const buildMinimalPackage = function (declaration?: PythonPackage, modules: PythonModule[] = []): PythonPackage {
    if (declaration) {
        return declaration.shallowCopy({ modules });
    } else {
        return new PythonPackage('test', 'test', '0.0.1', modules);
    }
};

const buildMinimalModule = function (
    declaration?: PythonModule,
    classes: PythonClass[] = [],
    functions: PythonFunction[] = [],
): PythonPackage {
    let module: PythonModule;
    if (declaration) {
        module = declaration.shallowCopy({ classes, functions });
    } else {
        module = new PythonModule('test/test_module', 'test_module', [], [], classes, functions);
    }
    return buildMinimalPackage(module?.parent() ?? undefined, [module]);
};

const buildMinimalClass = function (declaration?: PythonClass, methods: PythonFunction[] = []): PythonPackage {
    let clazz: PythonClass;
    if (declaration) {
        clazz = declaration.shallowCopy({ methods });
    } else {
        clazz = new PythonClass('test/test_module/TestClass', 'TestClass', 'test_module.TestClass', [], [], methods);
    }
    return buildMinimalModule(clazz?.parent() ?? undefined, [clazz]);
};

const buildMinimalFunction = function (
    declaration?: PythonFunction,
    parameters: PythonParameter[] = [],
): PythonPackage {
    if (declaration) {
        const fun = declaration.shallowCopy({ parameters, results: [] });
        const parent = fun.parent();
        if (parent instanceof PythonClass) {
            return buildMinimalClass(parent, [fun]);
        } else {
            return buildMinimalModule(undefined, [], [fun]);
        }
    } else {
        const fun = new PythonFunction(
            'test/test_module/test_function',
            'test_function',
            'test_module.test_function',
            [],
            parameters,
        );
        return buildMinimalModule(undefined, [], [fun]);
    }
};

const buildMinimalParameter = function (declaration?: PythonParameter): PythonPackage {
    let parameter: PythonParameter;
    if (declaration) {
        parameter = declaration.clone();
    } else {
        parameter = new PythonParameter(
            'test/test_module/test_function/test_parameter',
            'test_parameter',
            'test_module.test_function.test_parameter',
        );
    }
    return buildMinimalFunction(declaration?.parent() ?? undefined, [parameter]);
};
