import { AnnotationStore, initialAnnotationStore } from './annotationSlice';
import { mergeAnnotationStores } from './mergeAnnotationStores';

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
                    authors: [
                        "me"
                    ]
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: [
                        "them"
                    ]
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            pures: {
                a: {
                    target: 'a',
                    authors: [
                        "me"
                    ]
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
                    authors: [
                        "me"
                    ]
                },
            },
        };

        const theirs: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: [
                        "them"
                    ]
                },
            },
        };

        const expected: AnnotationStore = {
            ...initialAnnotationStore,
            removes: {
                a: {
                    target: 'a',
                    authors: [
                        "me"
                    ]
                },
            },
        };

        expect(mergeAnnotationStores(mine, theirs)).toEqual(expected);
    });
});
