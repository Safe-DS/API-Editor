import {Map} from "immutable";
import {Nullable} from "../../util/types";
import PythonDeclaration from "../python/PythonDeclaration";
import EnumPair from "../EnumPair";
import PythonEnum from "../python/PythonEnum";

export default class AnnotationStore {
    private readonly renamings: RenameAnnotationStore;
    private readonly enums: EnumAnnotationStore;

    constructor(renamings: RenameAnnotationStore = Map(), enums: EnumAnnotationStore = Map()) {
        this.renamings = renamings;
        this.enums = enums;
    }

    getRenamingFor(declaration: PythonDeclaration): Nullable<string> {
        console.log(declaration.name);
        return this.renamings.get(declaration.pathAsString()) ?? null;
    }

    getEnumFor(enumDefinition: PythonEnum): Nullable<string> {
        return this.enums.get(enumDefinition.pathAsString()) ?? null;
    }

    setRenamingFor(declaration: PythonDeclaration, parameterName: Nullable<string>): AnnotationStore {
        if (parameterName === null || declaration.name === parameterName) {
            console.log(declaration.name);
            console.log(parameterName);
            return this.removeRenamingFor(declaration);
        }

        return new AnnotationStore(this.renamings.set(declaration.pathAsString(), parameterName));
    }

    setEnumFor(enumDefinition: PythonEnum, newName: Nullable<string>): AnnotationStore {
        if (newName === null || enumDefinition.enumName === newName) {
            return this.removeEnumFor(enumDefinition);
        }

        return new AnnotationStore(this.renamings.set(enumDefinition.pathAsString(), newName));
    }

    removeRenamingFor(declaration: PythonDeclaration): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(declaration.pathAsString()));
    }

    removeEnumFor(enumDefinition: PythonEnum): AnnotationStore {
        return new AnnotationStore(this.renamings.remove(enumDefinition.pathAsString()));
    }
}

export type RenameAnnotationStore = Map<string, string>
export type EnumAnnotationStore = Map<string, string>
