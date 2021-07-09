import PythonModule from "./PythonModule";
import PythonDeclaration from "./PythonDeclaration";

export default class PythonPackage extends PythonDeclaration {

    readonly name: string;
    readonly modules: PythonModule[];

    constructor(name: string, modules: PythonModule[] = []) {
        super();

        this.name = name;
        this.modules = modules;

        this.modules.forEach(it => {
            it.containingPackage = this;
        });
    }

    parent(): null {
        return null;
    }

    children(): PythonDeclaration[] {
        return this.modules;
    }

    toString(): string {
        return `Package "${this.name}"`;
    }
}
