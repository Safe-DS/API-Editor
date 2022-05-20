import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';
import PythonClass from './PythonClass';
import PythonDeclaration from './PythonDeclaration';
import PythonFromImport from './PythonFromImport';
import PythonFunction from './PythonFunction';
import PythonImport from './PythonImport';
import PythonPackage from './PythonPackage';
import AbstractPythonFilter from './filters/AbstractPythonFilter';

export default class PythonModule extends PythonDeclaration {
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

    parent(): Optional<PythonPackage> {
        return this.containingPackage;
    }

    children(): (PythonClass | PythonFunction)[] {
        return [...this.classes, ...this.functions];
    }

    toString(): string {
        return `Module "${this.name}"`;
    }

    filter(pythonFilter: AbstractPythonFilter): PythonModule {
        if (pythonFilter.canSkipModuleUpdate() || pythonFilter.shouldKeepModule(this)) {
            return this;
        }

        const classes = this.classes
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    pythonFilter.shouldKeepClass(it) ||
                    // Don't exclude empty classes when we only filter modules or classes
                    pythonFilter.canSkipClassUpdate() ||
                    !isEmptyList(it.methods),
            );

        const functions = this.functions
            .map((it) => it.filter(pythonFilter))
            .filter(
                (it) =>
                    pythonFilter.shouldKeepFunction(it) ||
                    // Don't exclude functions without parameters when we don't filter parameters
                    pythonFilter.canSkipFunctionUpdate() ||
                    !isEmptyList(it.parameters),
            );

        return new PythonModule(this.name, this.imports, this.fromImports, classes, functions);
    }
}
