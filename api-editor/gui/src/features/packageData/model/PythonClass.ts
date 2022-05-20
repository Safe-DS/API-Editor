import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';
import AbstractPythonFilter from "./AbstractPythonFilter";

export default class PythonClass extends PythonDeclaration {
    containingModule: Optional<PythonModule>;

    constructor(
        readonly name: string,
        readonly qualifiedName: string,
        readonly decorators: string[] = [],
        readonly superclasses: string[] = [],
        readonly methods: PythonFunction[] = [],
        readonly isPublic: boolean = true,
        readonly description = '',
        readonly fullDocstring = '',
    ) {
        super();

        this.containingModule = null;

        this.methods.forEach((it) => {
            it.containingModuleOrClass = this;
        });
    }

    parent(): Optional<PythonModule> {
        return this.containingModule;
    }

    children(): PythonFunction[] {
        return this.methods;
    }

    isPublicDeclaration(): boolean {
        return this.isPublic;
    }

    toString(): string {
        let result = '';

        if (this.decorators.length > 0) {
            result += this.decorators.map((it) => `@${it}`).join(' ');
            result += ' ';
        }

        result += `class ${this.name}`;

        if (this.superclasses.length > 0) {
            result += `(${this.superclasses.join(', ')})`;
        }

        return result;
    }

    filter(pythonFilter: AbstractPythonFilter): PythonClass {
        if (!pythonFilter.isFilteringFunctions()) {
            return this;
        }

        const methods = this.methods
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    pythonFilter.shouldKeepFunction(it) ||
                    // Don't exclude functions without parameters when we don't filter parameters
                    (!pythonFilter.isFilteringParameters() ||
                        !isEmptyList(it.parameters)),
            );

        return new PythonClass(
            this.name,
            this.qualifiedName,
            this.decorators,
            this.superclasses,
            methods,
            this.isPublic,
            this.description,
            this.fullDocstring,
        );
    }
}
