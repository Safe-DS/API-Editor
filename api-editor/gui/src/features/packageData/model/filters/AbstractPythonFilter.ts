import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import PythonPackage from '../PythonPackage';
import { isEmptyList } from '../../../../common/util/listOperations';

/**
 * An abstract base class for filters of Python declarations. To create a new filter create a new subclass and override
 * the shouldKeepXXX methods. To speed up the filter, you can also override the canSkipXXXUpdate methods.
 */
export default abstract class AbstractPythonFilter {
    /**
     * Whether the given module should be kept after filtering.
     */
    abstract shouldKeepModule(pythonModule: PythonModule): boolean;

    /**
     * Whether the given class should be kept after filtering.
     */
    abstract shouldKeepClass(pythonClass: PythonClass): boolean;

    /**
     * Whether the given function should be kept after filtering.
     */
    abstract shouldKeepFunction(pythonFunction: PythonFunction): boolean;

    /**
     * Whether the given parameter should be kept after filtering.
     */
    abstract shouldKeepParameter(pythonParameter: PythonParameter): boolean;

    /**
     * Returns whether the package can be returned unchanged after filtering. Use this to improve the performance of
     * the filter but ensure correctness.
     */
    canSkipPackageUpdate(): boolean {
        return false;
    }

    /**
     * Returns whether the module can be returned unchanged after filtering. Use this to improve the performance of
     * the filter but ensure correctness.
     */
    canSkipModuleUpdate(): boolean {
        return false;
    }

    /**
     * Returns whether the class can be returned unchanged after filtering. Use this to improve the performance of
     * the filter but ensure correctness.
     */
    canSkipClassUpdate(): boolean {
        return false;
    }

    /**
     * Returns whether the function can be returned unchanged after filtering. Use this to improve the performance of
     * the filter but ensure correctness.
     */
    canSkipFunctionUpdate(): boolean {
        return false;
    }

    /**
     * Apply this filter to the given package and create a package with filtered modules.
     */
    applyToPackage(pythonPackage: PythonPackage): PythonPackage {
        // If the package is kept, keep the entire subtree
        if (this.canSkipPackageUpdate()) {
            return pythonPackage;
        }

        // Filter modules
        const modules = pythonPackage.modules
            .map((it) => this.applyToModule(it))
            .filter(
                (it) =>
                    this.shouldKeepModule(it) ||
                    // Don't exclude empty modules when we only filter modules
                    this.canSkipModuleUpdate() ||
                    !isEmptyList(it.classes) ||
                    !isEmptyList(it.functions),
            );

        // Create filtered package
        return new PythonPackage(pythonPackage.distribution, pythonPackage.name, pythonPackage.version, modules);
    }

    /**
     * Apply this filter to the given module and create a module with filtered classes and functions.
     */
    applyToModule(pythonModule: PythonModule): PythonModule {
        // If the module is kept, keep the entire subtree
        if (this.canSkipModuleUpdate() || this.shouldKeepModule(pythonModule)) {
            return pythonModule;
        }

        // Filter classes
        const classes = pythonModule.classes
            .map((it) => this.applyToClass(it))
            .filter(
                (it) =>
                    this.shouldKeepClass(it) ||
                    // Don't exclude empty classes when we only filter modules or classes
                    this.canSkipClassUpdate() ||
                    !isEmptyList(it.methods),
            );

        // Filter functions
        const functions = pythonModule.functions
            .map((it) => this.applyToFunction(it))
            .filter(
                (it) =>
                    this.shouldKeepFunction(it) ||
                    // Don't exclude functions without parameters when we don't filter parameters
                    this.canSkipFunctionUpdate() ||
                    !isEmptyList(it.parameters),
            );

        // Create filtered module
        return new PythonModule(pythonModule.name, pythonModule.imports, pythonModule.fromImports, classes, functions);
    }

    /**
     * Apply this filter to the given class and create a class with filtered methods.
     */
    applyToClass(pythonClass: PythonClass): PythonClass {
        // If the class is kept, keep the entire subtree
        if (this.canSkipClassUpdate() || this.shouldKeepClass(pythonClass)) {
            return pythonClass;
        }

        // Filter methods
        const methods = pythonClass.methods
            .map((it) => this.applyToFunction(it))
            .filter((it) => this.shouldKeepFunction(it) || this.canSkipFunctionUpdate() || !isEmptyList(it.parameters));

        // Create filtered class
        return new PythonClass(
            pythonClass.name,
            pythonClass.qualifiedName,
            pythonClass.decorators,
            pythonClass.superclasses,
            methods,
            pythonClass.isPublic,
            pythonClass.description,
            pythonClass.fullDocstring,
        );
    }

    /**
     * Apply this filter to the given function and create a function with filtered parameters.
     */
    applyToFunction(pythonFunction: PythonFunction): PythonFunction {
        // If the function is kept, keep the entire subtree
        if (this.canSkipFunctionUpdate() || this.shouldKeepFunction(pythonFunction)) {
            return pythonFunction;
        }

        // Filter parameters
        const parameters = pythonFunction.parameters
            .map((it) => it.clone())
            .filter((it) => this.shouldKeepParameter(it));

        // Filter results
        const results = pythonFunction.results.map((it) => it.clone());

        // Create filtered function
        return new PythonFunction(
            pythonFunction.name,
            pythonFunction.uniqueName,
            pythonFunction.qualifiedName,
            pythonFunction.uniqueQualifiedName,
            pythonFunction.decorators,
            parameters,
            results,
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
        );
    }
}
