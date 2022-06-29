// noinspection DuplicatedCode

import { AnnotationStore, initialAnnotationStore } from './annotationSlice';
import { mergeAnnotationStores } from './mergeAnnotationStores';

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
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });

    test('should keep mine for conflicting annotations', () => {
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

    test('should keep mine for conflicting annotations', () => {
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

    test('should keep mine for conflicting annotations', () => {
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
