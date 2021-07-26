import { isEmptyList } from '../../util/listOperations'
import { Optional } from '../../util/types'

export default abstract class PythonDeclaration {
    abstract readonly name: string

    abstract parent(): Optional<PythonDeclaration>

    abstract children(): PythonDeclaration[]

    path(): string[] {
        let current: Optional<PythonDeclaration> = this
        const result: string[] = []

        while (current !== null) {
            result.unshift(current.name)
            current = current.parent()
        }

        return result
    }

    pathAsString(): string {
        return this.path().join('/')
    }

    getByRelativePath(relativePath: string[]): Optional<PythonDeclaration> {
        if (isEmptyList(relativePath)) {
            return this
        }

        const [head, ...tail] = relativePath
        return (
            this.children()
                .find((it) => it.name === head)
                ?.getByRelativePath(tail) ?? null
        )
    }
}
