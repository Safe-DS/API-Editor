// noinspection DuplicatedCode

import { mergeAnnotationStores } from './mergeAnnotationStores';
import { AnnotationStore } from './versioning/AnnotationStoreV2';
import { initialAnnotationStore } from './annotationSlice';
import {expect, test, describe} from 'vitest';

// Boundary --------------------------------------------------------------------

describe('mergeBoundaryAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            boundaryAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            calledAfterAnnotations: {
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
            completeAnnotations: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            completeAnnotations: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            completeAnnotations: {
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
            completeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            completeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            completeAnnotations: {
                a: {
                    target: 'a',
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
            descriptionAnnotations: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptionAnnotations: {
                b: {
                    target: 'b',
                    newDescription: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptionAnnotations: {
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
            descriptionAnnotations: {
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
            descriptionAnnotations: {
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
            descriptionAnnotations: {
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
            descriptionAnnotations: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptionAnnotations: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptionAnnotations: {
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
            descriptionAnnotations: {
                a: {
                    target: 'a',
                    newDescription: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            descriptionAnnotations: {
                a: {
                    target: 'a',
                    newDescription: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            descriptionAnnotations: {
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
            enumAnnotations: {
                a: {
                    target: 'a',
                    enumName: 'foo',
                    pairs: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            enumAnnotations: {
                b: {
                    target: 'b',
                    enumName: 'bar',
                    pairs: [],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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
            enumAnnotations: {
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

// Pure ------------------------------------------------------------------------

describe('mergeExpertAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
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
            expertAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
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
            expertAnnotations: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
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
            expertAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            expertAnnotations: {
                a: {
                    target: 'a',
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            groupAnnotations: {
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
            moveAnnotations: {
                a: {
                    target: 'a',
                    destination: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moveAnnotations: {
                b: {
                    target: 'b',
                    destination: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moveAnnotations: {
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
            moveAnnotations: {
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
            moveAnnotations: {
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
            moveAnnotations: {
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
            moveAnnotations: {
                a: {
                    target: 'a',
                    destination: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moveAnnotations: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moveAnnotations: {
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
            moveAnnotations: {
                a: {
                    target: 'a',
                    destination: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            moveAnnotations: {
                a: {
                    target: 'a',
                    destination: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            moveAnnotations: {
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

// Pure ------------------------------------------------------------------------

describe('mergePureAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
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
            pureAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
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
            pureAnnotations: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
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
            pureAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pureAnnotations: {
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
            removeAnnotations: {
                a: {
                    target: 'a',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
                b: {
                    target: 'b',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
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
            removeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
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
            removeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
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
            removeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
                a: {
                    target: 'a',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removeAnnotations: {
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
            renameAnnotations: {
                a: {
                    target: 'a',
                    newName: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renameAnnotations: {
                b: {
                    target: 'b',
                    newName: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renameAnnotations: {
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
            renameAnnotations: {
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
            renameAnnotations: {
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
            renameAnnotations: {
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
            renameAnnotations: {
                a: {
                    target: 'a',
                    newName: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renameAnnotations: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renameAnnotations: {
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
            renameAnnotations: {
                a: {
                    target: 'a',
                    newName: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            renameAnnotations: {
                a: {
                    target: 'a',
                    newName: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            renameAnnotations: {
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

// Todo ------------------------------------------------------------------------

describe('mergeTodoAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
                b: {
                    target: 'b',
                    newTodo: 'bar',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
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
            todoAnnotations: {
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
            todoAnnotations: {
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
            todoAnnotations: {
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
            todoAnnotations: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
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
            todoAnnotations: {
                a: {
                    target: 'a',
                    newTodo: 'foo',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
                a: {
                    target: 'a',
                    newTodo: 'bar',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            todoAnnotations: {
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

// Value -----------------------------------------------------------------------

describe('mergeValueAnnotations', () => {
    test('should keep non-conflicting annotations', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'required',
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                b: {
                    target: 'b',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'required',
                },
                b: {
                    target: 'b',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor reviewed annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'required',
                    authors: ['me'],
                    reviewers: [],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
                    authors: ['them'],
                    reviewers: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
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
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'required',
                    authors: ['$autogen$'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
                    authors: ['them'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should favor my annotations in case of conflicts', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'required',
                    authors: ['me'],
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'optional',
                    defaultValueType: 'string',
                    defaultValue: 'test',
                    authors: ['them'],
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            valueAnnotations: {
                a: {
                    target: 'a',
                    variant: 'required',
                    authors: ['me'],
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});
