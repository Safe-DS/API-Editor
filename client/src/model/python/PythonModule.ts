import {Nullable} from "../../util/types";
import PythonFunction from "./PythonFunction";
import PythonClass from "./PythonClass";
import PythonFromImport from "./PythonFromImport";
import PythonImport from "./PythonImport";
import PythonPackage from "./PythonPackage";
import PythonDeclaration from "./PythonDeclaration";

export default class PythonModule extends PythonDeclaration {
    readonly name: string;
    readonly imports: PythonImport[];
    readonly fromImports: PythonFromImport[];
    readonly classes: PythonClass[];
    readonly functions: PythonFunction[];
    containingPackage: Nullable<PythonPackage>;

    constructor(

        name: string,
        imports: PythonImport[] = [],
        fromImports: PythonFromImport[] = [],
        classes: PythonClass[] = [],
        functions: PythonFunction[] = []
    ) {
        super();

        this.name = name;
        this.imports = imports;
        this.fromImports = fromImports;
        this.classes = classes;
        this.functions = functions;
        this.containingPackage = null;

        this.classes.forEach(it => {
            it.containingModule = this;
        });

        this.functions.forEach(it => {
            it.containingModuleOrClass = this;
        });
    }

    parent(): Nullable<PythonPackage> {
        return this.containingPackage;
    }

    children(): PythonDeclaration[] {
        return [...this.classes, ...this.functions];
    }

    toString(): string {
        return `Module "${this.name}"`;
    }
}
