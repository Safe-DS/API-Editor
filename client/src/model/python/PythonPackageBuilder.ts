import {Nullable} from "../../util/types";
import PythonClass from "./PythonClass";
import PythonFromImport from "./PythonFromImport";
import PythonFunction from "./PythonFunction";
import PythonImport from "./PythonImport";
import PythonModule from "./PythonModule";
import PythonPackage from "./PythonPackage";
import PythonParameter from "./PythonParameter";
import PythonResult from "./PythonResult";

export interface PythonPackageJson {
    name: string,
    modules: PythonModuleJson[]
}

export function parsePythonPackageJson(packageJson: PythonPackageJson): PythonPackage {
    return new PythonPackage(
        packageJson.name,
        packageJson.modules
            .map(parsePythonModuleJson)
            .sort((a, b) => a.name.localeCompare(b.name))
    );
}

interface PythonModuleJson {
    name: string,
    imports: PythonImportJson[]
    fromImports: PythonFromImportJson[]
    classes: PythonClassJson[]
    functions: PythonFunctionJson[]
}

function parsePythonModuleJson(moduleJson: PythonModuleJson): PythonModule {
    return new PythonModule(
        moduleJson.name,
        moduleJson.imports
            .map(parsePythonImportJson)
            .sort((a, b) => a.module.localeCompare(b.module)),
        moduleJson.fromImports
            .map(parsePythonFromImportJson)
            .sort((a, b) => {
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
            .sort((a, b) => a.name.localeCompare(b.name))
    );
}

interface PythonImportJson {
    module: string,
    alias: Nullable<string>
}

function parsePythonImportJson(importJson: PythonImportJson): PythonImport {
    return new PythonImport(
        importJson.module,
        importJson.alias
    );
}

interface PythonFromImportJson {
    module: string,
    declaration: string,
    alias: Nullable<string>
}

function parsePythonFromImportJson(fromImportJson: PythonFromImportJson): PythonFromImport {
    return new PythonFromImport(
        fromImportJson.module,
        fromImportJson.declaration,
        fromImportJson.alias
    );
}

interface PythonClassJson {
    name: string,
    decorators: string[],
    superclasses: string[],
    methods: PythonFunctionJson[],
    summary: Nullable<string>,
    description: Nullable<string>
    fullDocstring: Nullable<string>
}

function parsePythonClassJson(classJson: PythonClassJson): PythonClass {
    return new PythonClass(
        classJson.name,
        classJson.decorators,
        classJson.superclasses,
        classJson.methods
            .map(parsePythonFunctionJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
        classJson.summary || "",
        classJson.description || "",
        classJson.fullDocstring || ""
    );
}

interface PythonFunctionJson {
    name: string,
    decorators: string[],
    parameters: PythonParameterJson[],
    results: PythonResultJson[],
    hasReturnType: boolean,
    returnType: string,
    summary: Nullable<string>,
    description: Nullable<string>
    fullDocstring: Nullable<string>
}

function parsePythonFunctionJson(functionJson: PythonFunctionJson): PythonFunction {
    return new PythonFunction(
        functionJson.name,
        functionJson.decorators,
        functionJson.parameters
            .map(parsePythonParameterJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
        functionJson.results
            .map(parsePythonResultJson)
            .sort((a, b) => a.name.localeCompare(b.name)),
        functionJson.returnType,
        functionJson.summary || "",
        functionJson.description || "",
        functionJson.fullDocstring || ""
    );
}

interface PythonParameterJson {
    name: string,
    type: string,
    typeInDocs: Nullable<string>,
    hasDefault: boolean,
    default: Nullable<string>,
    limitation: null,
    ignored: boolean,
    description: Nullable<string>
}

function parsePythonParameterJson(parameterJson: PythonParameterJson): PythonParameter {
    return new PythonParameter(
        parameterJson.name,
        parameterJson.type,
        parameterJson.typeInDocs || "",
        parameterJson.hasDefault,
        parameterJson.default || "",
        parameterJson.limitation,
        parameterJson.ignored,
        parameterJson.description || ""
    );
}

interface PythonResultJson {
    name: string,
    type: string,
    typeInDocs: Nullable<string>,
    description: Nullable<string>
}

function parsePythonResultJson(resultJson: PythonResultJson): PythonResult {
    return new PythonResult(
        resultJson.name,
        resultJson.type,
        resultJson.typeInDocs || "",
        resultJson.description || ""
    );
}
