import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';

export default class PythonClass extends PythonDeclaration {
    readonly name: string;
    readonly qualifiedName: string;
    readonly decorators: string[];
    readonly superclasses: string[];
    readonly methods: PythonFunction[];
    readonly isPublic: boolean;
    readonly description: string;
    readonly fullDocstring: string;
    containingModule: Optional<PythonModule>;

    constructor(
        name: string,
        qualifiedName: string,
        decorators: string[] = [],
        superclasses: string[] = [],
        methods: PythonFunction[] = [],
        isPublic: boolean = true,
        description = '',
        fullDocstring = '',
    ) {
        super();

        this.name = name;
        this.qualifiedName = qualifiedName;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.methods = methods;
        this.isPublic = isPublic;
        this.description = description;
        this.fullDocstring = fullDocstring;
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

    filter(pythonFilter: PythonFilter | void): PythonClass {
        if (!pythonFilter || !pythonFilter.isFilteringFunctions()) {
            return this;
        }

        const methods = this.methods
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    it.name
                        .toLowerCase()
                        .includes(
                            (pythonFilter.pythonFunction || '').toLowerCase(),
                        ) &&
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
