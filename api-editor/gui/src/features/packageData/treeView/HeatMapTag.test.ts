import {HeatMapInterpolation, redRatio} from "./HeatMapTag";

describe('redRatio', () => {
    test.each`
        actual | max   | expectedResult
        ${0}   | ${0}  | ${0}
        ${0}   | ${10} | ${0}
        ${1}   | ${1}  | ${1}
        ${10}  | ${10} | ${1}
    `(
        'linear interpolation edge case (actual: $actual, max: $max)', ({actual, max, expectedResult}) => {
            expect(redRatio(actual, max, HeatMapInterpolation.LINEAR)).toBe(expectedResult);
        });

    test('linear interpolation (actual: 1, max: 2)', () => {
        const result = redRatio(1, 2, HeatMapInterpolation.LINEAR)
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(1);
    });

    test.each`
        actual | max   | expectedResult
        ${0}   | ${0}  | ${0}
        ${0}   | ${10} | ${0}
        ${1}   | ${1}  | ${1}
        ${10}  | ${10} | ${1}
    `(
        'logarithmic interpolation edge case (actual: $actual, max: $max)', ({actual, max, expectedResult}) => {
            expect(redRatio(actual, max, HeatMapInterpolation.LOGARITHMIC)).toBe(expectedResult);
        });

    test('logarithmic interpolation (actual: 1, max: 2)', () => {
        const result = redRatio(1, 2, HeatMapInterpolation.LINEAR)
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(1);
    });
})
