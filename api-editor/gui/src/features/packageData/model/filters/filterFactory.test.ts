import { createFilterFromString } from './filterFactory';
import { ConjunctiveFilter } from './ConjunctiveFilter';
import VisibilityFilter, { Visibility } from './VisibilityFilter';
import { NegatedFilter } from './NegatedFilter';

describe('createFilterFromString', () => {
    test('handles an empty string', () => {
        const completeFilter = createFilterFromString('');
        expect(completeFilter).toBeInstanceOf(ConjunctiveFilter);
        expect((completeFilter as ConjunctiveFilter).filters).toEqual([]);
    });

    test('handles a single positive token', () => {
        const completeFilter = createFilterFromString('is:public');
        expect(completeFilter).toBeInstanceOf(ConjunctiveFilter);
        expect((completeFilter as ConjunctiveFilter).filters).toHaveLength(1);

        const positiveFilter = (completeFilter as ConjunctiveFilter).filters[0];
        expect(positiveFilter).toBeInstanceOf(VisibilityFilter);
        expect((positiveFilter as VisibilityFilter).visibility).toEqual(Visibility.Public);
    });

    test('handles a single negated token', () => {
        const completeFilter = createFilterFromString('!is:public');
        expect(completeFilter).toBeInstanceOf(ConjunctiveFilter);
        expect((completeFilter as ConjunctiveFilter).filters).toHaveLength(1);

        const negatedFilter = (completeFilter as ConjunctiveFilter).filters[0];
        expect(negatedFilter).toBeInstanceOf(NegatedFilter);

        const positiveFilter = (negatedFilter as NegatedFilter).filter;
        expect(positiveFilter).toBeInstanceOf(VisibilityFilter);
        expect((positiveFilter as VisibilityFilter).visibility).toEqual(Visibility.Public);
    });

    test('handles multiple tokens', () => {
        const completeFilter = createFilterFromString('is:public !is:public');
        expect(completeFilter).toBeInstanceOf(ConjunctiveFilter);
        expect((completeFilter as ConjunctiveFilter).filters).toHaveLength(2);

        // First token
        const positiveFilter1 = (completeFilter as ConjunctiveFilter).filters[0];
        expect(positiveFilter1).toBeInstanceOf(VisibilityFilter);
        expect((positiveFilter1 as VisibilityFilter).visibility).toEqual(Visibility.Public);

        // Second token
        const negatedFilter2 = (completeFilter as ConjunctiveFilter).filters[1];
        expect(negatedFilter2).toBeInstanceOf(NegatedFilter);

        const positiveFilter2 = (negatedFilter2 as NegatedFilter).filter;
        expect(positiveFilter2).toBeInstanceOf(VisibilityFilter);
        expect((positiveFilter2 as VisibilityFilter).visibility).toEqual(Visibility.Public);
    });
});
