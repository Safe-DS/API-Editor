import { Optional } from '../../../common/util/types';

export abstract class PythonDeclaration {
    abstract readonly id: string;
    abstract readonly name: string;
    abstract readonly isPublic: boolean;

    abstract parent(): Optional<PythonDeclaration>;

    abstract children(): PythonDeclaration[];

    getUniqueName(): string {
        return this.name;
    }

    *descendantsOrSelf(): Generator<PythonDeclaration> {
        yield this;
        for (const child of this.children()) {
            yield* child.descendantsOrSelf();
        }
    }
}
