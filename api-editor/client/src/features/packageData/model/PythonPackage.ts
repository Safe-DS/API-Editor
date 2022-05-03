import { isEmptyList } from '../../../common/util/listOperations';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonModule from './PythonModule';

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

    filter(pythonFilter: PythonFilter | void): PythonPackage {
        if (!pythonFilter || !pythonFilter.isFilteringModules()) {
            return this;
        }

        const modules = this.modules
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    it.name
                        .toLowerCase()
                        .includes(
                            (pythonFilter.pythonModule || '').toLowerCase(),
                        ) &&
                    // Don't exclude empty modules when we only filter modules
                    (!pythonFilter.isFilteringClasses() ||
                        !isEmptyList(it.classes) ||
                        !isEmptyList(it.functions)),
            );

        return new PythonPackage(
            this.distribution,
            this.name,
            this.version,
            modules,
        );
    }
}
