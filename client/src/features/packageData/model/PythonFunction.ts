import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonModule from './PythonModule';
import PythonParameter from './PythonParameter';
import PythonResult from './PythonResult';

export default class PythonFunction extends PythonDeclaration {
    readonly name: string;
    readonly decorators: string[];
    readonly parameters: PythonParameter[];
    readonly results: PythonResult[];
    readonly returnType: string;
    readonly summary: string;
    readonly description: string;
    readonly fullDocstring: string;
    containingModuleOrClass: Optional<PythonModule | PythonClass>;

    constructor(
        name: string,
        decorators: string[] = [],
        parameters: PythonParameter[] = [],
        results: PythonResult[] = [],
        returnType = 'Any',
        summary = '',
        description = '',
        fullDocstring = '',
    ) {
        super();

        this.name = name;
        this.decorators = decorators;
        this.parameters = parameters;
        this.results = results;
        this.returnType = returnType;
        this.summary = summary;
        this.description = description;
        this.fullDocstring = fullDocstring;
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

    filter(pythonFilter: PythonFilter | void): PythonFunction {
        if (!pythonFilter) {
            return this;
        }

        const parameters = this.parameters
            .map((it) => it.clone())
            .filter((it) =>
                it.name
                    .toLowerCase()
                    .includes(
                        (pythonFilter.pythonParameter || '').toLowerCase(),
                    ),
            );

        const results = this.results.map((it) => it.clone());

        return new PythonFunction(
            this.name,
            this.decorators,
            parameters,
            results,
            this.returnType,
            this.summary,
            this.description,
            this.fullDocstring,
        );
    }
}
