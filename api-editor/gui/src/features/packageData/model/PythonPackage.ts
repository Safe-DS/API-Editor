import PythonDeclaration from './PythonDeclaration';
import PythonModule from './PythonModule';
import PythonClass from "./PythonClass";
import PythonFunction from "./PythonFunction";
import PythonParameter from "./PythonParameter";

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

    getModules(): PythonModule[] {
        return this.children();
    }

    getClasses(): PythonClass[] {
        let result: PythonClass[] = [];
        for (const module of this.getModules()) {
            let children = module.children();
            for (const child of children) {
                if (child instanceof PythonClass) {
                    result.push(child);
                }
            }
        }
        return result;
    }

    getFunctions(): PythonFunction[] {
        let result: PythonFunction[] = [];
        for (const module of this.getModules()) {
            let children = module.children();
            for (const child of children) {
                if (child instanceof PythonFunction) {
                    result.push(child);
                }
            }
        }
        for (const pythonClass of this.getClasses()) {
            let children = pythonClass.children();
            for (const child of children) {
                result.push(child);
            }
        }
        return result;
    }

    getParameter(): PythonParameter[] {
        let result: PythonParameter[] = [];
        for (const pythonFunction of this.getFunctions()) {
            let children = pythonFunction.children();
            for (const child of children) {
                result.push(child);
            }
        }
        return result;
    }

}
