import { PythonClass } from './PythonClass';
import { PythonDeclaration } from './PythonDeclaration';
import { PythonModule } from './PythonModule';
import { PythonFunction } from './PythonFunction';
import { Optional } from '../../../common/util/types';

export class PythonPackage extends PythonDeclaration {
    constructor(
        readonly distribution: string,
        readonly name: string,
        readonly version: string,
        readonly modules: PythonModule[] = [],
        private readonly reexportMap: Map<string, PythonClass | PythonFunction> = new Map(),
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

    getByRelativePath(relativePath: string[]): Optional<PythonDeclaration> {
        const id = this.name + '/' + relativePath.join('/');
        if (this.reexportMap.has(id)) {
            return this.reexportMap.get(id);
        }

        return super.getByRelativePath(relativePath);
    }

    toString(): string {
        return `Package "${this.distribution}/${this.name} v${this.version}"`;
    }
}
