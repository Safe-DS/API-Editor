import { PythonDeclaration } from './PythonDeclaration';
import { PythonModule } from './PythonModule';
import { Optional } from '../../../common/util/types';

interface PythonPackageShallowCopy {
    distribution?: string;
    name?: string;
    version?: string;
    modules?: PythonModule[];
}

export class PythonPackage extends PythonDeclaration {
    readonly id: string;
    readonly isPublic: boolean = true;

    constructor(
        readonly distribution: string,
        readonly name: string,
        readonly version: string,
        readonly modules: PythonModule[] = [],
        private readonly idToDeclaration: Map<string, PythonDeclaration> = new Map(),
    ) {
        super();

        this.id = name;
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

    getDeclarationById(id: string): Optional<PythonDeclaration> {
        if (this.idToDeclaration.has(id)) {
            return this.idToDeclaration.get(id);
        }
    }

    shallowCopy({
        distribution = this.distribution,
        name = this.name,
        version = this.version,
        modules = this.modules,
    }: PythonPackageShallowCopy = {}): PythonPackage {
        return new PythonPackage(distribution, name, version, modules);
    }

    toString(): string {
        return `Package "${this.distribution}/${this.name} v${this.version}"`;
    }
}
