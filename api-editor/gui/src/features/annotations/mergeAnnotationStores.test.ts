// noinspection DuplicatedCode

import { AnnotationStore, initialAnnotationStore } from './annotationSlice';
import { mergeAnnotationStores } from './mergeAnnotationStores';

// Attribute -------------------------------------------------------------------

describe('mergeAttributeAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                b: {
                    target: 'b',
                    defaultType: 'number',
                    defaultValue: 0,
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                },
                b: {
                    target: 'b',
                    defaultType: 'number',
                    defaultValue: 0,
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Boundary --------------------------------------------------------------------

describe('mergeBoundaryAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: true,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 0,
                        upperIntervalLimit: 1,
                        upperLimitType: 0,
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                b: {
                    target: 'b',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: true,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 0,
                        upperIntervalLimit: 1,
                        upperLimitType: 0,
                    },
                },
                b: {
                    target: 'b',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: true,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 0,
                        upperIntervalLimit: 1,
                        upperLimitType: 0,
                    },
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: true,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 0,
                        upperIntervalLimit: 1,
                        upperLimitType: 0,
                    },
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: true,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 0,
                        upperIntervalLimit: 1,
                        upperLimitType: 0,
                    },
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: false,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 1,
                        upperIntervalLimit: 100,
                        upperLimitType: 1,
                    },
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            boundaries: {
                a: {
                    target: 'a',
                    interval: {
                        isDiscrete: true,
                        lowerIntervalLimit: 0,
                        lowerLimitType: 0,
                        upperIntervalLimit: 1,
                        upperLimitType: 0,
                    },
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Called After ----------------------------------------------------------------

describe('mergeCalledAfterAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    c: {
                        target: 'a',
                        calledAfterName: 'c',
                    },
                },
                b: {
                    c: {
                        target: 'b',
                        calledAfterName: 'c',
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                    },
                },
                c: {
                    d: {
                        target: 'c',
                        calledAfterName: 'd',
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                    },
                    c: {
                        target: 'a',
                        calledAfterName: 'c',
                    },
                },
                b: {
                    c: {
                        target: 'b',
                        calledAfterName: 'c',
                    },
                },
                c: {
                    d: {
                        target: 'c',
                        calledAfterName: 'd',
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['me'],
                        reviewers: [],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['them'],
                        reviewers: ['them'],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['them'],
                        reviewers: ['them'],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['$autogen$'],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['them'],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['them'],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['me'],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['them'],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            calledAfters: {
                a: {
                    b: {
                        target: 'a',
                        calledAfterName: 'b',
                        authors: ['me'],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Complete --------------------------------------------------------------------

describe('mergeCompleteAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            completes: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            completes: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            completes: {
                a: {
                    target: 'a',
                },
                b: {
                    target: 'b',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            completes: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            completes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            completes: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Constant --------------------------------------------------------------------

describe('mergeConstantAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                b: {
                    target: 'b',
                    defaultType: 'number',
                    defaultValue: 0,
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                },
                b: {
                    target: 'b',
                    defaultType: 'number',
                    defaultValue: 0,
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Description -----------------------------------------------------------------

describe('mergeDescriptionAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                b: {
                    target: 'b',
                    newDescription: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                },
                b: {
                    target: 'b',
                    newDescription: 'bar',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptions: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Enum ------------------------------------------------------------------------

describe('mergeEnumAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                b: {
                    target: 'b',
                    enumName: 'bar',
                    pairs: [],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                },
                b: {
                    target: 'b',
                    enumName: 'bar',
                    pairs: [],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'bar',
                    pairs: [],
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'bar',
                    pairs: [],
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'bar',
                    pairs: [],
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'bar',
                    pairs: [],
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'bar',
                    pairs: [],
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            enums: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Group -----------------------------------------------------------------------

describe('mergeGroupAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    c: {
                        target: 'a',
                        groupName: 'c',
                        parameters: [],
                    },
                },
                b: {
                    c: {
                        target: 'b',
                        groupName: 'c',
                        parameters: [],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                    },
                },
                c: {
                    d: {
                        target: 'c',
                        groupName: 'd',
                        parameters: [],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                    },
                    c: {
                        target: 'a',
                        groupName: 'c',
                        parameters: [],
                    },
                },
                b: {
                    c: {
                        target: 'b',
                        groupName: 'c',
                        parameters: [],
                    },
                },
                c: {
                    d: {
                        target: 'c',
                        groupName: 'd',
                        parameters: [],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['me'],
                        reviewers: [],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['them'],
                        reviewers: ['them'],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['them'],
                        reviewers: ['them'],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['$autogen$'],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['them'],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['them'],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['me'],
                    },
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['them'],
                    },
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            groups: {
                a: {
                    b: {
                        target: 'a',
                        groupName: 'b',
                        parameters: [],
                        authors: ['me'],
                    },
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Move ------------------------------------------------------------------------

describe('mergeMoveAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                b: {
                    target: 'b',
                    destination: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'foo',
                },
                b: {
                    target: 'b',
                    destination: 'bar',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'foo',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moves: {
                a: {
                    target: 'a',
                    destination: 'foo',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Optional --------------------------------------------------------------------

describe('mergeOptionalAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                b: {
                    target: 'b',
                    defaultType: 'number',
                    defaultValue: 0,
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                },
                b: {
                    target: 'b',
                    defaultType: 'number',
                    defaultValue: 0,
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'string',
                    defaultValue: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Pure ------------------------------------------------------------------------

describe('mergePureAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                },
                b: {
                    target: 'b',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Remove ----------------------------------------------------------------------

describe('mergeRemoveAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                },
                b: {
                    target: 'b',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Rename ----------------------------------------------------------------------

describe('mergeRenameAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                b: {
                    target: 'b',
                    newName: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'foo',
                },
                b: {
                    target: 'b',
                    newName: 'bar',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'foo',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renamings: {
                a: {
                    target: 'a',
                    newName: 'foo',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Required --------------------------------------------------------------------

describe('mergeRequiredAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a'
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                b: {
                    target: 'b'
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a'
                },
                b: {
                    target: 'b'
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {},
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. attribute)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            attributes: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. constant)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            constants: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. optional)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            optionals: {
                a: {
                    target: 'a',
                    defaultType: 'number',
                    defaultValue: 0,
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts (vs. required)', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            requireds: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});

// Todo ------------------------------------------------------------------------

describe('mergeTodoAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                b: {
                    target: 'b',
                    newTodo: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                },
                b: {
                    target: 'b',
                    newTodo: 'bar',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor manually created annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todos: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});
