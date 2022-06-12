import { PythonDeclaration } from './PythonDeclaration';
import { PythonModule } from './PythonModule';

export class PythonPackage extends PythonDeclaration {
    constructor(
        readonly distribution: string,
        readonly name: string,
        readonly version: string,
        readonly modules: PythonModule[] = [],
    ) {
        super();

        this.modules.forEach((it) => {
            it.containingPackage = this;
        });
    }

    parent(): null {
        return null;
    }

    children(): PythonModule[] {
        return this.modules;
    }

    toString(): string {
        return `Package "${this.distribution}/${this.name} v${this.version}"`;
    }
}
