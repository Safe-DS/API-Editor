import { isEmptyList } from '../../../common/util/listOperations';
import PythonDeclaration from './PythonDeclaration';
import { PythonFilter } from './PythonFilter';
import PythonModule from './PythonModule';

export default class PythonPackage extends PythonDeclaration {
    readonly name: string;
    readonly modules: PythonModule[];

    constructor(name: string, modules: PythonModule[] = []) {
        super();

        this.name = name;
        this.modules = modules;

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
        return `Package "${this.name}"`;
    }

    filter(pythonFilter: PythonFilter | void): PythonPackage {
        if (!pythonFilter || !pythonFilter.isFiltering()) {
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
                    (!isEmptyList(it.classes) || !isEmptyList(it.functions)),
            );

        return new PythonPackage(this.name, modules);
    }
}
