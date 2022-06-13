import { isEmptyList } from '../../../common/util/listOperations';
import { Optional } from '../../../common/util/types';

export abstract class PythonDeclaration {
    abstract readonly name: string;

    abstract parent(): Optional<PythonDeclaration>;

    abstract children(): PythonDeclaration[];

    getUniqueName(): string {
        return this.name;
    }

    isPublicDeclaration(): boolean {
        return true;
    }

    path(): string[] {
        let current: Optional<PythonDeclaration> = this;
        const result: string[] = [];

        while (current !== null && current !== undefined) {
            result.unshift(current.getUniqueName());
            current = current.parent();
        }

        return result;
    }

    pathAsString(): string {
        return this.path().join('/');
    }

    getByRelativePath(relativePath: string[]): Optional<PythonDeclaration> {
        if (isEmptyList(relativePath)) {
            return this;
        }

        const [head, ...tail] = relativePath;
        return (
            this.children()
                .find((it) => it.getUniqueName() === head)
                ?.getByRelativePath(tail) ?? null
        );
    }

    getByRelativePathAsString(relativePath: string): Optional<PythonDeclaration> {
        return this.getByRelativePath(relativePath.split('/').slice(1));
    }
}
