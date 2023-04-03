import { groupBy, isEmptyList } from './listOperations';
import { expect, test } from 'vitest';

test('isEmptyList returns true for empty lists', () => {
    expect(isEmptyList([])).toBeTruthy();
});

test('isEmptyLists returns false for non-empty lists', () => {
    expect(isEmptyList([1])).toBeFalsy();
});

test('groupBy with empty list', () => {
    const grouping = groupBy([], (it) => it);
    expect(grouping.size).toBe(0);
});

test('groupBy with non-empty list', () => {
    const list1 = [] as number[];
    const list2 = [1];
    const list3 = [2];
    const list4 = [1, 2];
    const grouping = groupBy([list1, list2, list3, list4], (it) => it.length);

    const keys = [...grouping.keys()];
    expect(keys).toHaveLength(3);
    expect(keys).toContain(0);
    expect(keys).toContain(1);
    expect(keys).toContain(2);

    expect(grouping.get(0)).toHaveLength(1);
    expect(grouping.get(0)).toContain(list1);

    expect(grouping.get(1)).toHaveLength(2);
    expect(grouping.get(1)).toContain(list2);
    expect(grouping.get(1)).toContain(list3);

    expect(grouping.get(2)).toHaveLength(1);
    expect(grouping.get(2)).toContain(list4);
});
