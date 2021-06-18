import PythonFunction from "./PythonFunction";
import PythonClass from "./PythonClass";
import PythonFromImport from "./PythonFromImport";
import PythonImport from "./PythonImport";

export default class PythonModule {

    readonly name: string;
    readonly imports: PythonImport[];
    readonly fromImports: PythonFromImport[];
    readonly classes: PythonClass[];
    readonly functions: PythonFunction[];

    constructor(
        name: string,
        imports: PythonImport[] = [],
        fromImports: PythonFromImport[] = [],
        classes: PythonClass[] = [],
        functions: PythonFunction[] = []
    ) {
        this.name = name;
        this.imports = imports;
        this.fromImports = fromImports;
        this.classes = classes;
        this.functions = functions;
    }

    toString() {
        return `Module "${this.name}"`
    }
}