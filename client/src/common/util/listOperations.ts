export const isEmptyList = function <T>(inputList: T[]): boolean {
    return inputList.length === 0;
};

export const groupBy = function <K, V>(
    inputList: V[],
    grouper: (value: V) => K,
): Map<K, V[]> {
    const result = new Map<K, V[]>();

    inputList.forEach((it) => {
        const key = grouper(it);

        if (!result.get(key)) {
            result.set(key, []);
        }

        result.get(key)?.push(it);
    });

    return result;
};
