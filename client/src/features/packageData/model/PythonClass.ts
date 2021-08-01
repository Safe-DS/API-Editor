import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';

export default class PythonClass extends PythonDeclaration {
    readonly name: string;
    readonly decorators: string[];
    readonly superclasses: string[];
    readonly methods: PythonFunction[];
    readonly summary: string;
    readonly description: string;
    readonly fullDocstring: string;
    containingModule: Optional<PythonModule>;

    constructor(
        name: string,
        decorators: string[] = [],
        superclasses: string[] = [],
        methods: PythonFunction[] = [],
        summary = '',
        description = '',
        fullDocstring = '',
    ) {
        super();

        this.name = name;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.methods = methods;
        this.summary = summary;
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
        if (!pythonFilter) {
            return this;
        }

        const methods = this.methods
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    it.name.toLowerCase().includes((pythonFilter.pythonFunction || '').toLowerCase()) &&
                    !isEmptyList(it.parameters),
            );

        return new PythonClass(
            this.name,
            this.decorators,
            this.superclasses,
            methods,
            this.summary,
            this.description,
            this.fullDocstring,
        );
    }
}
