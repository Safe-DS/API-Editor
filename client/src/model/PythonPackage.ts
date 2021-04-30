import PythonModule from "./PythonModule";

export default class PythonPackage {

    readonly name: string;
    readonly modules: PythonModule[];

    constructor(name: string, modules: PythonModule[]) {
        this.name = name;
        this.modules = modules;
    }
}