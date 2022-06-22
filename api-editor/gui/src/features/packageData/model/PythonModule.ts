import { Optional } from '../../../common/util/types';
import { PythonClass } from './PythonClass';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFromImport } from './PythonFromImport';
import { PythonFunction } from './PythonFunction';
import { PythonImport } from './PythonImport';
import { PythonPackage } from './PythonPackage';

interface PythonPackageShallowCopy {
    id?: string;
    name?: string;
    imports?: PythonImport[];
    fromImports?: PythonFromImport[];
    classes?: PythonClass[];
    functions?: PythonFunction[];
}

export class PythonModule extends PythonDeclaration {
    readonly isPublic: boolean;

    containingPackage: Optional<PythonPackage>;

    constructor(
        readonly id: string,
        readonly name: string,
        readonly imports: PythonImport[] = [],
        readonly fromImports: PythonFromImport[] = [],
        readonly classes: PythonClass[] = [],
        readonly functions: PythonFunction[] = [],
    ) {
        super();

        this.isPublic = !this.name.split('.').some((it) => it.startsWith('_'));

        this.containingPackage = null;

        this.classes.forEach((it) => {
            it.containingModule = this;
        });

        this.functions.forEach((it) => {
            it.containingModuleOrClass = this;
        });
    }

    parent(): Optional<PythonPackage> {
        return this.containingPackage;
    }

    children(): (PythonClass | PythonFunction)[] {
        return [...this.classes, ...this.functions];
    }

    preferredQualifiedName(): string {
        return this.name;
    }

    shallowCopy({
        id = this.id,
        name = this.name,
        imports = this.imports,
        fromImports = this.fromImports,
        classes = this.classes,
        functions = this.functions,
    }: PythonPackageShallowCopy = {}): PythonModule {
        return new PythonModule(id, name, imports, fromImports, classes, functions);
    }

    toString(): string {
        return `Module "${this.name}"`;
    }
}
