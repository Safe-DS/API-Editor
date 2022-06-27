import { Optional } from '../../../common/util/types';
import { PythonClass } from './PythonClass';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonModule } from './PythonModule';
import { PythonParameter, PythonParameterAssignment } from './PythonParameter';
import { PythonResult } from './PythonResult';
import { PythonFunctionJson } from './APIJsonData';

interface PythonFunctionShallowCopy {
    id?: string;
    name?: string;
    qualifiedName?: string;
    decorators?: string[];
    parameters?: PythonParameter[];
    results?: PythonResult[];
    isPublic?: boolean;
    reexportedBy?: string[];
    description?: string;
    fullDocstring?: string;
}

export class PythonFunction extends PythonDeclaration {
    containingModuleOrClass: Optional<PythonModule | PythonClass>;

    constructor(
        readonly id: string,
        readonly name: string,
        readonly qualifiedName: string,
        readonly decorators: string[] = [],
        readonly parameters: PythonParameter[] = [],
        readonly results: PythonResult[] = [],
        readonly isPublic: boolean = false,
        readonly reexportedBy: string[] = [],
        readonly description = '',
        readonly fullDocstring = '',
    ) {
        super();

        this.containingModuleOrClass = null;

        this.parameters.forEach((it) => {
            it.containingFunction = this;
        });

        this.results.forEach((it) => {
            it.containingFunction = this;
        });
    }

    parent(): Optional<PythonModule | PythonClass> {
        return this.containingModuleOrClass;
    }

    children(): PythonParameter[] {
        return this.parameters;
    }

    getUniqueName(): string {
        const segments = this.id.split('/');
        return segments[segments.length - 1];
    }

    preferredQualifiedName(): string {
        if (this.containingModuleOrClass) {
            return `${this.containingModuleOrClass.preferredQualifiedName()}.${this.name}`;
        } else {
            return this.name;
        }
    }

    isGlobal(): boolean {
        return this.containingModuleOrClass instanceof PythonModule;
    }

    isGetter(): boolean {
        return this.decorators.includes('property');
    }

    isSetter(): boolean {
        return this.decorators.some((it) => /[^.]*.setter/u.test(it));
    }

    isDeleter(): boolean {
        return this.decorators.some((it) => /[^.]*.deleter/u.test(it));
    }

    explicitParameters(): PythonParameter[] {
        return this.parameters.filter((it) => it.assignedBy !== PythonParameterAssignment.IMPLICIT);
    }

    siblingFunctions(): PythonFunction[] {
        return (
            (this.parent()
                ?.children()
                .filter((it) => it instanceof PythonFunction && it.name !== this.name) as PythonFunction[]) ?? []
        );
    }

    shallowCopy({
        id = this.id,
        name = this.name,
        qualifiedName = this.qualifiedName,
        decorators = this.decorators,
        parameters = this.parameters,
        results = this.results,
        isPublic = this.isPublic,
        reexportedBy = this.reexportedBy,
        description = this.description,
        fullDocstring = this.fullDocstring,
    }: PythonFunctionShallowCopy = {}): PythonFunction {
        const result = new PythonFunction(
            id,
            name,
            qualifiedName,
            decorators,
            parameters,
            results,
            isPublic,
            reexportedBy,
            description,
            fullDocstring,
        );
        result.containingModuleOrClass = this.containingModuleOrClass;
        return result;
    }

    toString(): string {
        let result = '';

        if (this.decorators.length > 0) {
            result += this.decorators.map((it) => `@${it}`).join(' ');
            result += ' ';
        }

        result += `def ${this.name}(${this.parameters.map((it) => it.name).join(', ')})`;

        return result;
    }

    toJson(): PythonFunctionJson {
        return {
            id: this.id,
            name: this.name,
            qname: this.qualifiedName,
            decorators: this.decorators,
            parameters: this.parameters.map((it) => it.toJson()),
            results: this.results.map((it) => it.toJson()),
            is_public: this.isPublic,
            reexported_by: this.reexportedBy,
            description: this.description,
            docstring: this.fullDocstring,
        };
    }
}
