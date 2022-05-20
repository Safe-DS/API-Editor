import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonDeclaration from './PythonDeclaration';
import PythonModule from './PythonModule';
import PythonParameter from './PythonParameter';
import PythonResult from './PythonResult';
import AbstractPythonFilter from "./AbstractPythonFilter";

export default class PythonFunction extends PythonDeclaration {
    containingModuleOrClass: Optional<PythonModule | PythonClass>;

    constructor(
        readonly name: string,
        readonly uniqueName: string,
        readonly qualifiedName: string,
        readonly uniqueQualifiedName: string,
        readonly decorators: string[] = [],
        readonly parameters: PythonParameter[] = [],
        readonly results: PythonResult[] = [],
        readonly isPublic: boolean = false,
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

    isPublicDeclaration(): boolean {
        return this.isPublic;
    }

    getUniqueName(): string {
        return this.uniqueName;
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
        if (this.parent() instanceof PythonModule) {
            return this.children();
        }

        return this.children().slice(1);
    }

    siblingFunctions(): PythonFunction[] {
        return (
            (this.parent()
                ?.children()
                .filter(
                    (it) =>
                        it instanceof PythonFunction && it.name !== this.name,
                ) as PythonFunction[]) ?? []
        );
    }

    toString(): string {
        let result = '';

        if (this.decorators.length > 0) {
            result += this.decorators.map((it) => `@${it}`).join(' ');
            result += ' ';
        }

        result += `def ${this.name}(${this.parameters
            .map((it) => it.name)
            .join(', ')})`;

        return result;
    }

    filter(pythonFilter: AbstractPythonFilter): PythonFunction {
        if (!pythonFilter.isFilteringParameters()) {
            return this;
        }

        const parameters = this.parameters
            .map((it) => it.clone())
            .filter((it) => pythonFilter.shouldKeepParameter(it)
            );

        const results = this.results.map((it) => it.clone());

        return new PythonFunction(
            this.name,
            this.uniqueName,
            this.qualifiedName,
            this.uniqueQualifiedName,
            this.decorators,
            parameters,
            results,
            this.isPublic,
            this.description,
            this.fullDocstring,
        );
    }
}
