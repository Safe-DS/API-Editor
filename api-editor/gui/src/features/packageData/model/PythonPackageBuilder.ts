import { PythonClass } from './PythonClass';
import { PythonFromImport } from './PythonFromImport';
import { PythonFunction } from './PythonFunction';
import { PythonImport } from './PythonImport';
import { PythonModule } from './PythonModule';
import { PythonPackage } from './PythonPackage';
import { PythonParameter, PythonParameterAssignment } from './PythonParameter';
import { PythonResult } from './PythonResult';
import { PythonDeclaration } from './PythonDeclaration';
import {
    EXPECTED_API_SCHEMA_VERSION,
    ParameterAssignmentJson,
    PythonClassJson,
    PythonFromImportJson,
    PythonFunctionJson,
    PythonImportJson,
    PythonModuleJson,
    PythonPackageJson,
    PythonParameterJson,
    PythonResultJson,
} from './APIJsonData';

export const parsePythonPackageJson = function (packageJson: PythonPackageJson): PythonPackage | null {
    if ((packageJson.schemaVersion ?? 1) !== EXPECTED_API_SCHEMA_VERSION) {
        return null;
    }

    const idToDeclaration = new Map();

    // Functions
    const functions = new Map(
        packageJson.functions.map((it) => parsePythonFunctionJson(it, idToDeclaration)).map((it) => [it.id, it]),
    );

    // Classes
    const classes = new Map(
        packageJson.classes.map((it) => parsePythonClassJson(it, functions, idToDeclaration)).map((it) => [it.id, it]),
    );

    return new PythonPackage(
        packageJson.distribution,
        packageJson.package,
        packageJson.version,
        packageJson.modules
            .map((it) => parsePythonModuleJson(it, classes, functions, idToDeclaration))
            .sort((a, b) => a.name.localeCompare(b.name)),
        idToDeclaration,
    );
};

const parsePythonModuleJson = function (
    moduleJson: PythonModuleJson,
    classes: Map<string, PythonClass>,
    functions: Map<string, PythonFunction>,
    idToDeclaration: Map<string, PythonDeclaration>,
): PythonModule {
    // Classes
    const classesInModule = moduleJson.classes
        .filter((classId) => classes.has(classId) && classes.get(classId)!.reexportedBy.length === 0)
        .map((classId) => classes.get(classId)!);
    const reexportedClasses = [...classes.values()].filter(
        (it) => it.reexportedBy.length > 0 && it.reexportedBy[0] === moduleJson.id,
    );
    const allClasses = [...classesInModule, ...reexportedClasses];

    // Functions
    const functionsInModule = moduleJson.functions
        .filter((functionId) => functions.has(functionId) && functions.get(functionId)!.reexportedBy.length === 0)
        .map((functionId) => functions.get(functionId)!);
    const reexportedFunctions = [...functions.values()].filter(
        (it) => it.reexportedBy.length > 0 && it.reexportedBy[0] === moduleJson.id,
    );
    const allFunctions = [...functionsInModule, ...reexportedFunctions];

    const result = new PythonModule(
        moduleJson.id,
        moduleJson.name,
        moduleJson.imports.map(parsePythonImportJson).sort((a, b) => a.module.localeCompare(b.module)),
        moduleJson.from_imports.map(parsePythonFromImportJson).sort((a, b) => {
            const moduleComparison = a.module.localeCompare(b.module);
            if (moduleComparison === 0) {
                return a.declaration.localeCompare(b.declaration);
            } else {
                return moduleComparison;
            }
        }),
        allClasses.sort((a, b) => a.name.localeCompare(b.name)),
        allFunctions.sort((a, b) => a.name.localeCompare(b.name)),
    );
    idToDeclaration.set(moduleJson.id, result);
    return result;
};

const parsePythonImportJson = function (importJson: PythonImportJson): PythonImport {
    return new PythonImport(importJson.module, importJson.alias);
};

const parsePythonFromImportJson = function (fromImportJson: PythonFromImportJson): PythonFromImport {
    return new PythonFromImport(fromImportJson.module, fromImportJson.declaration, fromImportJson.alias);
};

const parsePythonClassJson = function (
    classJson: PythonClassJson,
    functions: Map<string, PythonFunction>,
    idToDeclaration: Map<string, PythonDeclaration>,
): PythonClass {
    const methods = classJson.methods
        .sort((a, b) => a.localeCompare(b))
        .filter((functionId) => functions.has(functionId))
        .map((functionId) => functions.get(functionId) as PythonFunction);

    const result = new PythonClass(
        classJson.id,
        classJson.name,
        classJson.qname,
        classJson.decorators,
        classJson.superclasses,
        methods,
        classJson.is_public,
        classJson.reexported_by,
        classJson.description ?? '',
        classJson.docstring ?? '',
    );
    idToDeclaration.set(classJson.id, result);
    return result;
};

const parsePythonFunctionJson = function (
    functionJson: PythonFunctionJson,
    idToDeclaration: Map<string, PythonDeclaration>,
): PythonFunction {
    const result = new PythonFunction(
        functionJson.id,
        functionJson.name,
        functionJson.qname,
        functionJson.decorators,
        functionJson.parameters.map((it) => parsePythonParameterJson(it, idToDeclaration)),
        functionJson.results.map(parsePythonResultJson),
        functionJson.is_public,
        functionJson.reexported_by,
        functionJson.description ?? '',
        functionJson.docstring ?? '',
    );
    idToDeclaration.set(functionJson.id, result);
    return result;
};

const parsePythonParameterJson = function (
    parameterJson: PythonParameterJson,
    idToDeclaration: Map<string, PythonDeclaration>,
): PythonParameter {
    const result = new PythonParameter(
        parameterJson.id,
        parameterJson.name,
        parameterJson.qname,
        parameterJson.default_value,
        parsePythonParameterAssignment(parameterJson.assigned_by),
        parameterJson.is_public,
        parameterJson.docstring.type ?? '',
        parameterJson.docstring.description ?? '',
        parameterJson.type,
    );
    idToDeclaration.set(parameterJson.id, result);
    return result;
};

const parsePythonParameterAssignment = function (assignedBy: ParameterAssignmentJson): PythonParameterAssignment {
    switch (assignedBy) {
        case 'IMPLICIT':
            return PythonParameterAssignment.IMPLICIT;
        case 'POSITION_ONLY':
            return PythonParameterAssignment.POSITION_ONLY;
        case 'POSITION_OR_NAME':
            return PythonParameterAssignment.POSITION_OR_NAME;
        case 'POSITIONAL_VARARG':
            return PythonParameterAssignment.POSITIONAL_VARARG;
        case 'NAME_ONLY':
            return PythonParameterAssignment.NAME_ONLY;
        case 'NAMED_VARARG':
            return PythonParameterAssignment.NAMED_VARARG;
    }
};

const parsePythonResultJson = function (resultJson: PythonResultJson): PythonResult {
    return new PythonResult(resultJson.name, resultJson.docstring.type ?? '', resultJson.docstring.description ?? '');
};
