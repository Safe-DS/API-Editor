import PythonClass from '../PythonClass';
import PythonFunction from '../PythonFunction';
import PythonModule from '../PythonModule';
import PythonParameter from '../PythonParameter';
import PythonPackage from '../PythonPackage';
import { isEmptyList } from '../../../../common/util/listOperations';
import PythonDeclaration from '../PythonDeclaration';

/**
 * An abstract base class for filters of Python declarations. To create a new filter create a new subclass and override
 * the shouldKeepXXX methods.
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
     * Whether the given declaration should be kept after filtering. This function generally does not need to be
     * overridden.
     */
    shouldKeepDeclaration(pythonDeclaration: PythonDeclaration): boolean {
        if (pythonDeclaration instanceof PythonModule) {
            return this.shouldKeepModule(pythonDeclaration);
        } else if (pythonDeclaration instanceof PythonClass) {
            return this.shouldKeepClass(pythonDeclaration);
        } else if (pythonDeclaration instanceof PythonFunction) {
            return this.shouldKeepFunction(pythonDeclaration);
        } else if (pythonDeclaration instanceof PythonParameter) {
            return this.shouldKeepParameter(pythonDeclaration);
        } else {
            return true;
        }
    }

    /**
     * Applies this filter to the given package and creates a package with filtered modules. This function should not be
     * overridden.
     */
    applyToPackage(pythonPackage: PythonPackage): PythonPackage {
        // Filter modules
        const modules = pythonPackage.modules.map((it) => this.applyToModule(it)).filter((it) => it !== null);

        // Create filtered package
        return new PythonPackage(
            pythonPackage.distribution,
            pythonPackage.name,
            pythonPackage.version,
            modules as PythonModule[],
        );
    }

    /**
     * Applies this filter to the given module and creates a module with filtered classes and functions. Returns null if
     * the module should be removed.
     */
    private applyToModule(pythonModule: PythonModule): PythonModule | null {
        // If the module is kept, keep the entire subtree
        if (this.shouldKeepModule(pythonModule)) {
            return pythonModule;
        }

        // Filter classes
        const classes = pythonModule.classes.map((it) => this.applyToClass(it)).filter((it) => it !== null);

        // Filter functions
        const functions = pythonModule.functions.map((it) => this.applyToFunction(it)).filter((it) => it !== null);

        // Return null if all classes and functions are removed
        if (isEmptyList(classes) && isEmptyList(functions)) {
            return null;
        }

        // Otherwise, create filtered module
        return new PythonModule(
            pythonModule.name,
            pythonModule.imports,
            pythonModule.fromImports,
            classes as PythonClass[],
            functions as PythonFunction[],
        );
    }

    /**
     * Applies this filter to the given class and creates a class with filtered methods. Returns null if the class
     * should be removed.
     */
    private applyToClass(pythonClass: PythonClass): PythonClass | null {
        // If the class is kept, keep the entire subtree
        if (this.shouldKeepClass(pythonClass)) {
            return pythonClass;
        }

        // Filter methods
        const methods = pythonClass.methods.map((it) => this.applyToFunction(it)).filter((it) => it !== null);

        // Return null if all methods are removed
        if (isEmptyList(methods)) {
            return null;
        }

        // Otherwise, create filtered class
        return new PythonClass(
            pythonClass.name,
            pythonClass.qualifiedName,
            pythonClass.decorators,
            pythonClass.superclasses,
            methods as PythonFunction[],
            pythonClass.isPublic,
            pythonClass.description,
            pythonClass.fullDocstring,
        );
    }

    /**
     * Applies this filter to the given function and creates a function with filtered parameters. Returns null if the
     * function should be removed.
     */
    private applyToFunction(pythonFunction: PythonFunction): PythonFunction | null {
        // If the function is kept, keep the entire subtree
        if (this.shouldKeepFunction(pythonFunction)) {
            return pythonFunction;
        }

        // Filter parameters
        const parameters = pythonFunction.parameters
            .map((it) => it.clone())
            .filter((it) => this.shouldKeepParameter(it));

        // Return null if all parameters are removed
        if (isEmptyList(parameters)) {
            return null;
        }

        // Otherwise, create filtered function
        return new PythonFunction(
            pythonFunction.name,
            pythonFunction.uniqueName,
            pythonFunction.qualifiedName,
            pythonFunction.uniqueQualifiedName,
            pythonFunction.decorators,
            parameters,
            pythonFunction.results,
            pythonFunction.isPublic,
            pythonFunction.description,
            pythonFunction.fullDocstring,
        );
    }
}
