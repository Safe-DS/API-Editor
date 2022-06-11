import { Optional } from '../../../common/util/types';
import { PythonClass } from './PythonClass';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonFromImport } from './PythonFromImport';
import { PythonFunction } from './PythonFunction';
import { PythonImport } from './PythonImport';
import { PythonPackage } from './PythonPackage';

export class PythonModule extends PythonDeclaration {
    containingPackage: Optional<PythonPackage>;

    constructor(
        readonly name: string,
        readonly imports: PythonImport[] = [],
        readonly fromImports: PythonFromImport[] = [],
        readonly classes: PythonClass[] = [],
        readonly functions: PythonFunction[] = [],
    ) {
        super();

        this.containingPackage = null;

        this.classes.forEach((it) => {
            it.containingModule = this;
        });

        this.functions.forEach((it) => {
            it.containingModuleOrClass = this;
        });
    }

    isPublicDeclaration(): boolean {
        return !this.name.split('.').some((it) => it.startsWith('_'));
    }

    parent(): Optional<PythonPackage> {
        return this.containingPackage;
    }

    children(): (PythonClass | PythonFunction)[] {
        return [...this.classes, ...this.functions];
    }

    toString(): string {
        return `Module "${this.name}"`;
    }
}
