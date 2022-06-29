// noinspection DuplicatedCode

import { AnnotationStore, initialAnnotationStore } from './annotationSlice';
import { mergeAnnotationStores } from './mergeAnnotationStores';

// Attribute -------------------------------------------------------------------

// Boundary --------------------------------------------------------------------
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

    test('should keep reviewed annotation for conflicting annotations if exactly one is reviewed', () => {
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

    test('should keep mine for conflicting annotations if both or neither are reviewed', () => {
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

    test('should keep mine for conflicting annotations', () => {
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
// Description -----------------------------------------------------------------
// Enum ------------------------------------------------------------------------
// Group -----------------------------------------------------------------------
// Move ------------------------------------------------------------------------
// Optional --------------------------------------------------------------------
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

    test('should keep reviewed annotation for conflicting annotations if exactly one is reviewed', () => {
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

    test('should keep mine for conflicting annotations if both or neither are reviewed', () => {
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
// Rename ----------------------------------------------------------------------
// Required --------------------------------------------------------------------
// Todo ------------------------------------------------------------------------

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

    test('should keep reviewed annotation for conflicting annotations if exactly one is reviewed', () => {
        const mine: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['me'],
                    reviewers: []
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them']
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: ['them'],
                    reviewers: ['them']
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should keep mine for conflicting annotations if both or neither are reviewed', () => {
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
