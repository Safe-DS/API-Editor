import { PythonDeclaration } from './PythonDeclaration';
import { PythonModule } from './PythonModule';
import { Optional } from '../../../common/util/types';
import { PythonClass } from './PythonClass';
import { PythonFunction } from './PythonFunction';
import { PythonParameter } from './PythonParameter';
import { EXPECTED_API_SCHEMA_VERSION } from '../apiSlice';
import {PythonPackageJson} from "./APIJsonData";

interface PythonPackageShallowCopy {
    distribution?: string;
    name?: string;
    version?: string;
    modules?: PythonModule[];
}

export class PythonPackage extends PythonDeclaration {
    readonly id: string;
    readonly isPublic: boolean = true;

    constructor(
        readonly distribution: string,
        readonly name: string,
        readonly version: string,
        readonly modules: PythonModule[] = [],
        private readonly idToDeclaration: Map<string, PythonDeclaration> = new Map(),
    ) {
        super();

        this.id = name;
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

    preferredQualifiedName(): string {
        return this.name;
    }

    getDeclarationById(id: string): Optional<PythonDeclaration> {
        if (this.idToDeclaration.has(id)) {
            return this.idToDeclaration.get(id);
        }
    }

    shallowCopy({
        distribution = this.distribution,
        name = this.name,
        version = this.version,
        modules = this.modules,
    }: PythonPackageShallowCopy = {}): PythonPackage {
        return new PythonPackage(distribution, name, version, modules, this.idToDeclaration);
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

    getParameters(): PythonParameter[] {
        let result: PythonParameter[] = [];
        for (const pythonFunction of this.getFunctions()) {
            let children = pythonFunction.children();
            for (const child of children) {
                result.push(child);
            }
        }
        return result;
    }

    toJson(): PythonPackageJson {
        return {
            schemaVersion: EXPECTED_API_SCHEMA_VERSION,
            distribution: this.distribution,
            package: this.name,
            version: this.version,
            modules: this.modules.map((it) => it.toJson()),
            classes: this.getClasses().map((it) => it.toJson()),
            functions: this.getFunctions().map((it) => it.toJson()),
        };
    }
}
