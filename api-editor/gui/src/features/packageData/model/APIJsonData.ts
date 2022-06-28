import { Optional } from '../../../common/util/types';

export const EXPECTED_API_SCHEMA_VERSION = 1;

export interface PythonPackageJson {
    schemaVersion?: number;
    distribution: string;
    package: string;
    version: string;
    modules: PythonModuleJson[];
    classes: PythonClassJson[];
    functions: PythonFunctionJson[];
}

export interface PythonModuleJson {
    id: string;
    name: string;
    imports: PythonImportJson[];
    from_imports: PythonFromImportJson[];
    classes: string[];
    functions: string[];
}

export interface PythonImportJson {
    module: string;
    alias: Optional<string>;
}

export interface PythonFromImportJson {
    module: string;
    declaration: string;
    alias: Optional<string>;
}

export interface PythonClassJson {
    id: string;
    name: string;
    qname: string;
    decorators: string[];
    superclasses: string[];
    methods: string[];
    is_public: boolean;
    reexported_by: string[];
    description: Optional<string>;
    docstring: Optional<string>;
}

export interface PythonFunctionJson {
    id: string;
    name: string;
    qname: string;
    decorators: string[];
    parameters: PythonParameterJson[];
    results: PythonResultJson[];
    is_public: boolean;
    reexported_by: string[];
    description: Optional<string>;
    docstring: Optional<string>;
}

export interface PythonParameterJson {
    id: string;
    name: string;
    qname: string;
    default_value: Optional<string>;
    assigned_by: ParameterAssignment;
    is_public: boolean;
    docstring: {
        type: Optional<string>;
        description: Optional<string>;
    };
    type: object; // TODO parse type
}

export interface PythonResultJson {
    name: string;
    docstring: {
        type: Optional<string>;
        description: Optional<string>;
    };
}

export type ParameterAssignment =
    | 'IMPLICIT'
    | 'POSITION_ONLY'
    | 'POSITION_OR_NAME'
    | 'POSITIONAL_VARARG'
    | 'NAME_ONLY'
    | 'NAMED_VARARG';
