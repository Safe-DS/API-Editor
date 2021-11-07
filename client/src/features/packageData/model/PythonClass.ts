import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonFunction from './PythonFunction';
import PythonModule from './PythonModule';

export default class PythonClass extends PythonDeclaration {
    readonly name: string;
    readonly qname: string;
    readonly decorators: string[];
    readonly superclasses: string[];
    readonly methods: PythonFunction[];
    readonly description: string;
    readonly fullDocstring: string;
    containingModule: Optional<PythonModule>;

    constructor(
        name: string,
        qname: string,
        decorators: string[] = [],
        superclasses: string[] = [],
        methods: PythonFunction[] = [],
        description = '',
        fullDocstring = '',
    ) {
        super();

        this.name = name;
        this.qname = qname;
        this.decorators = decorators;
        this.superclasses = superclasses;
        this.methods = methods;
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
            this.qname,
            this.decorators,
            this.superclasses,
            methods,
            this.description,
            this.fullDocstring,
        );
    }
}
