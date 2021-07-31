export function isEmptyList<T>(inputList: T[]): boolean {
    return inputList.length === 0;
}

export function groupBy<K, V>(inputList: V[], grouper: (value: V) => K): Map<K, V[]> {
    const result = new Map<K, V[]>();

    inputList.forEach((it) => {
        const key = grouper(it);

        if (!result.get(key)) {
            result.set(key, []);
        }

        result.get(key)?.push(it);
    });

    return result;
}
