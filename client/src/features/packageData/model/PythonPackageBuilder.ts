import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonFromImport from './PythonFromImport';
import PythonFunction from './PythonFunction';
import PythonImport from './PythonImport';
import PythonModule from './PythonModule';
import PythonPackage from './PythonPackage';
import PythonParameter, { PythonParameterAssignment } from './PythonParameter';
import PythonResult from './PythonResult';

export interface PythonPackageJson {
    distribution: string;
    name: string;
    version: string;
    modules: PythonModuleJson[];
    classes: PythonClassJson[];
    functions: PythonFunctionJson[];
}

export const parsePythonPackageJson = function (
    packageJson: PythonPackageJson,
): PythonPackage {
    // Functions
    const functions = new Map(
        packageJson.functions
            .map(parsePythonFunctionJson)
            .map((it) => [it.qname, it]),
    );

    // Classes
    const classes = new Map(
        packageJson.classes
            .map((it) => parsePythonClassJson(it, functions))
            .map((it) => [it.qname, it]),
    );

    return new PythonPackage(
        packageJson.distribution,
        packageJson.name,
        packageJson.version,
        packageJson.modules
            .map((it) => parsePythonModuleJson(it, classes, functions))
            .sort((a, b) => a.name.localeCompare(b.name)),
    );
};

interface PythonModuleJson {
    name: string;
    imports: PythonImportJson[];
    from_imports: PythonFromImportJson[];
    classes: string[];
    functions: string[];
}

const parsePythonModuleJson = function (
    moduleJson: PythonModuleJson,
    classes: Map<string, PythonClass>,
    functions: Map<string, PythonFunction>,
): PythonModule {
    return new PythonModule(
        moduleJson.name,
        moduleJson.imports
            .map(parsePythonImportJson)
            .sort((a, b) => a.module.localeCompare(b.module)),
        moduleJson.from_imports.map(parsePythonFromImportJson).sort((a, b) => {
            const moduleComparison = a.module.localeCompare(b.module);
            if (moduleComparison === 0) {
                return a.declaration.localeCompare(b.declaration);
            } else {
                return moduleComparison;
            }
        }),
        moduleJson.classes
            .sort((a, b) => a.localeCompare(b))
            .filter((classQname) => classes.has(classQname))
            .map((classQName) => classes.get(classQName) as PythonClass),
        moduleJson.functions
            .sort((a, b) => a.localeCompare(b))
            .filter((functionQname) => functions.has(functionQname))
            .map(
                (functionQname) =>
                    functions.get(functionQname) as PythonFunction,
            ),
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
    functions: Map<string, PythonFunction>,
): PythonClass {
    return new PythonClass(
        classJson.name,
        classJson.qname,
        classJson.decorators,
        classJson.superclasses,
        classJson.methods
            .sort((a, b) => a.localeCompare(b))
            .filter((functionQname) => functions.has(functionQname))
            .map(
                (functionQname) =>
                    functions.get(functionQname) as PythonFunction,
            ),
        classJson.description ?? '',
        classJson.docstring ?? '',
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
        functionJson.qname,
        functionJson.decorators,
        functionJson.parameters.map(parsePythonParameterJson),
        functionJson.results.map(parsePythonResultJson),
        functionJson.is_public,
        functionJson.description ?? '',
        functionJson.description ?? '',
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
        parameterJson.default_value ?? '',
        parsePythonParameterAssignment(parameterJson.assigned_by),
        parameterJson.is_public,
        parameterJson.docstring.type ?? '',
        parameterJson.docstring.description ?? '',
    );
};

const parsePythonParameterAssignment = function (
    assignedBy: 'POSITION_ONLY' | 'POSITION_OR_NAME' | 'NAME_ONLY',
): PythonParameterAssignment {
    switch (assignedBy) {
        case 'POSITION_ONLY':
            return PythonParameterAssignment.POSITION_ONLY;
        case 'POSITION_OR_NAME':
            return PythonParameterAssignment.POSITION_OR_NAME;
        case 'NAME_ONLY':
            return PythonParameterAssignment.NAME_ONLY;
    }
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
        resultJson.typeInDocs ?? '',
        resultJson.description ?? '',
    );
};
