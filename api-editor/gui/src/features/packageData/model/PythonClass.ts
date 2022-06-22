import { Optional } from '../../../common/util/types';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFunction } from './PythonFunction';
import { PythonModule } from './PythonModule';

interface PythonClassShallowCopy {
    id?: string;
    name?: string;
    qualifiedName?: string;
    decorators?: string[];
    superclasses?: string[];
    methods?: PythonFunction[];
    isPublic?: boolean;
    reexportedBy?: string[];
    description?: string;
    fullDocstring?: string;
}

export class PythonClass extends PythonDeclaration {
    containingModule: Optional<PythonModule>;

    constructor(
        readonly id: string,
        readonly name: string,
        readonly qualifiedName: string,
        readonly decorators: string[] = [],
        readonly superclasses: string[] = [],
        readonly methods: PythonFunction[] = [],
        readonly isPublic: boolean = true,
        readonly reexportedBy: string[] = [],
        readonly description: string = '',
        readonly fullDocstring: string = '',
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

    preferredQualifiedName(): string {
        if (this.containingModule) {
            return `${this.containingModule.preferredQualifiedName()}.${this.name}`;
        } else {
            return this.name;
        }
    }

    shallowCopy({
        id = this.id,
        name = this.name,
        qualifiedName = this.qualifiedName,
        decorators = this.decorators,
        superclasses = this.superclasses,
        methods = this.methods,
        isPublic = this.isPublic,
        reexportedBy = this.reexportedBy,
        description = this.description,
        fullDocstring = this.fullDocstring,
    }: PythonClassShallowCopy = {}): PythonClass {
        return new PythonClass(
            id,
            name,
            qualifiedName,
            decorators,
            superclasses,
            methods,
            isPublic,
            reexportedBy,
            description,
            fullDocstring,
        );
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
}
