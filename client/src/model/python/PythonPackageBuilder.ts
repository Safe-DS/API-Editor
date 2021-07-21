import { Nullable } from '../../util/types'
import PythonClass from './PythonClass'
import PythonFromImport from './PythonFromImport'
import PythonFunction from './PythonFunction'
import PythonImport from './PythonImport'
import PythonModule from './PythonModule'
import PythonPackage from './PythonPackage'
import PythonParameter from './PythonParameter'
import PythonResult from './PythonResult'

export interface PythonPackageJson {
    name: string
    modules: PythonModuleJson[]
}

export function parsePythonPackageJson(packageJson: PythonPackageJson): PythonPackage {
    return new PythonPackage(packageJson.name, packageJson.modules.map(parsePythonModuleJson))
}

interface PythonModuleJson {
    name: string
    imports: PythonImportJson[]
    fromImports: PythonFromImportJson[]
    classes: PythonClassJson[]
    functions: PythonFunctionJson[]
}

function parsePythonModuleJson(moduleJson: PythonModuleJson): PythonModule {
    return new PythonModule(
        moduleJson.name,
        moduleJson.imports.map(parsePythonImportJson),
        moduleJson.fromImports.map(parsePythonFromImportJson),
        moduleJson.classes.map(parsePythonClassJson),
        moduleJson.functions.map(parsePythonFunctionJson),
    )
}

interface PythonImportJson {
    module: string
    alias: Nullable<string>
}

function parsePythonImportJson(importJson: PythonImportJson): PythonImport {
    return new PythonImport(importJson.module, importJson.alias)
}

interface PythonFromImportJson {
    module: string
    declaration: string
    alias: Nullable<string>
}

function parsePythonFromImportJson(fromImportJson: PythonFromImportJson): PythonFromImport {
    return new PythonFromImport(fromImportJson.module, fromImportJson.declaration, fromImportJson.alias)
}

interface PythonClassJson {
    name: string
    decorators: string[]
    superclasses: string[]
    methods: PythonFunctionJson[]
    summary: Nullable<string>
    description: Nullable<string>
    fullDocstring: Nullable<string>
}

function parsePythonClassJson(classJson: PythonClassJson): PythonClass {
    return new PythonClass(
        classJson.name,
        classJson.decorators,
        classJson.superclasses,
        classJson.methods.map(parsePythonFunctionJson),
        classJson.summary || '',
        classJson.description || '',
        classJson.fullDocstring || '',
    )
}

interface PythonFunctionJson {
    name: string
    decorators: string[]
    parameters: PythonParameterJson[]
    results: PythonResultJson[]
    hasReturnType: boolean
    returnType: string
    summary: Nullable<string>
    description: Nullable<string>
    fullDocstring: Nullable<string>
}

function parsePythonFunctionJson(functionJson: PythonFunctionJson): PythonFunction {
    return new PythonFunction(
        functionJson.name,
        functionJson.decorators,
        functionJson.parameters.map(parsePythonParameterJson),
        functionJson.results.map(parsePythonResultJson),
        functionJson.returnType,
        functionJson.summary || '',
        functionJson.description || '',
        functionJson.fullDocstring || '',
    )
}

interface PythonParameterJson {
    name: string
    type: string
    typeInDocs: Nullable<string>
    hasDefault: boolean
    default: Nullable<string>
    limitation: null
    ignored: boolean
    description: Nullable<string>
}

function parsePythonParameterJson(parameterJson: PythonParameterJson): PythonParameter {
    return new PythonParameter(
        parameterJson.name,
        parameterJson.type,
        parameterJson.typeInDocs || '',
        parameterJson.hasDefault,
        parameterJson.default || '',
        parameterJson.limitation,
        parameterJson.ignored,
        parameterJson.description || '',
    )
}

interface PythonResultJson {
    name: string
    type: string
    typeInDocs: Nullable<string>
    description: Nullable<string>
}

function parsePythonResultJson(resultJson: PythonResultJson): PythonResult {
    return new PythonResult(resultJson.name, resultJson.type, resultJson.typeInDocs || '', resultJson.description || '')
}
