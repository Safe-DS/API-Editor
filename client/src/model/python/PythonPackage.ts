import {PythonFilter} from "./PythonFilter";
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

    filter(filter: PythonFilter | void): PythonPackage {
        if (!filter) {
            return this;
        }

        return this;

        // return new PythonPackage(
        //     this.name,
        //     modules.filter
        // );
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
}


