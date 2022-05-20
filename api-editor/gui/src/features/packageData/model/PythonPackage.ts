import { isEmptyList } from '../../../common/util/listOperations';
import PythonDeclaration from './PythonDeclaration';
import PythonModule from './PythonModule';
import AbstractPythonFilter from './filters/AbstractPythonFilter';

export default class PythonPackage extends PythonDeclaration {
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

    filter(pythonFilter: AbstractPythonFilter): PythonPackage {
        if (pythonFilter.canSkipPackageUpdate()) {
            return this;
        }

        const modules = this.modules
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    pythonFilter.shouldKeepModule(it) ||
                    // Don't exclude empty modules when we only filter modules
                    pythonFilter.canSkipModuleUpdate() ||
                    !isEmptyList(it.classes) ||
                    !isEmptyList(it.functions),
            );

        return new PythonPackage(this.distribution, this.name, this.version, modules);
    }
}
