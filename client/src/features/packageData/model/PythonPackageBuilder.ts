import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonFromImport from './PythonFromImport';
import PythonFunction from './PythonFunction';
import PythonImport from './PythonImport';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';
import PythonParameter from './PythonParameter';
import PythonResult from './PythonResult';

export interface PythonPackageJson {
    distribution: string;
    name: string;
    version: string;
    modules: PythonModuleJson[];
}

export const parsePythonPackageJson = function (
    packageJson: PythonPackageJson,
): PythonPackage {
    return new PythonPackage(
        packageJson.name,
        packageJson.modules
            .map(parsePythonModuleJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
    );
};

interface PythonModuleJson {
    name: string;
    imports: PythonImportJson[];
    fromImports: PythonFromImportJson[];
    classes: string[];
    functions: string[];
}

const parsePythonModuleJson = function (
    moduleJson: PythonModuleJson,
): PythonModule {
    return new PythonModule(
        moduleJson.name,
        moduleJson.imports
            .map(parsePythonImportJson)
            .sort((a, b) => a.module.localeCompare(b.module)),
        moduleJson.fromImports.map(parsePythonFromImportJson).sort((a, b) => {
            const moduleComparison = a.module.localeCompare(b.module);
            if (moduleComparison === 0) {
                return a.declaration.localeCompare(b.declaration);
            } else {
                return moduleComparison;
            }
        }),
        moduleJson.classes
            .map(parsePythonClassJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
        moduleJson.functions
            .map(parsePythonFunctionJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
    );
};

interface PythonImportJson {
    module: string;
    alias: Optional<string>;
}

const parsePythonImportJson = function (
    importJson: PythonImportJson,
): PythonImport {
    return new PythonImport(importJson.module, importJson.alias);
};

interface PythonFromImportJson {
    module: string;
    declaration: string;
    alias: Optional<string>;
}

const parsePythonFromImportJson = function (
    fromImportJson: PythonFromImportJson,
): PythonFromImport {
    return new PythonFromImport(
        fromImportJson.module,
        fromImportJson.declaration,
        fromImportJson.alias,
    );
};

interface PythonClassJson {
    name: string;
    qname: string;
    decorators: string[];
    superclasses: string[];
    methods: string[];
    is_public: boolean;
    description: Optional<string>;
    docstring: Optional<string>;
    source_code: string;
}

const parsePythonClassJson = function (
    classJson: PythonClassJson,
): PythonClass {
    return new PythonClass(
        classJson.name,
        classJson.decorators,
        classJson.superclasses,
        classJson.methods
            .map(parsePythonFunctionJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
        classJson.summary || '',
        classJson.description || '',
        classJson.fullDocstring || '',
    );
};

interface PythonFunctionJson {
    name: string;
    qname: string;
    decorators: string[];
    parameters: PythonParameterJson[];
    results: PythonResultJson[];
    is_public: boolean;
    description: Optional<string>;
    docstring: Optional<string>;
    source_code: string;
}

const parsePythonFunctionJson = function (
    functionJson: PythonFunctionJson,
): PythonFunction {
    return new PythonFunction(
        functionJson.name,
        functionJson.decorators,
        functionJson.parameters.map(parsePythonParameterJson),
        functionJson.results.map(parsePythonResultJson),
        functionJson.returnType,
        functionJson.summary || '',
        functionJson.description || '',
        functionJson.fullDocstring || '',
    );
};

interface PythonParameterJson {
    name: string;
    default_value: Optional<string>;
    is_public: boolean;
    assigned_by: 'POSITION_ONLY' | 'POSITION_OR_NAME' | 'NAME_ONLY';
    docstring: {
        type: Optional<string>;
        description: Optional<string>;
    };
}

const parsePythonParameterJson = function (
    parameterJson: PythonParameterJson,
): PythonParameter {
    return new PythonParameter(
        parameterJson.name,
        parameterJson.type,
        parameterJson.typeInDocs || '',
        parameterJson.hasDefault,
        parameterJson.default || '',
        parameterJson.limitation,
        parameterJson.ignored,
        parameterJson.description || '',
    );
};

interface PythonResultJson {
    name: string;
    type: string;
    typeInDocs: Optional<string>;
    description: Optional<string>;
}

const parsePythonResultJson = function (
    resultJson: PythonResultJson,
): PythonResult {
    return new PythonResult(
        resultJson.name,
        resultJson.type,
        resultJson.typeInDocs || '',
        resultJson.description || '',
    );
};
