import { AnnotationStore as AnnotationStoreV1 } from './AnnotationStoreV1';
import { AnnotationStore as AnnotationStoreV2 } from './AnnotationStoreV2';
import { migrateAnnotationStoreToCurrentVersion } from './migrations';
import { expect, test } from 'vitest';

const v1: AnnotationStoreV1 = {
    schemaVersion: 1,
    attributes: {
        test: {
            target: 'test',
            defaultType: 'string',
            defaultValue: 'test',
            authors: [],
            reviewers: [],
            isRemoved: true,
        },
    },
    constants: {
        test2: {
            target: 'test2',
            defaultType: 'string',
            defaultValue: 'test',
            authors: [],
            reviewers: [],
            isRemoved: true,
        },
    },
    optionals: {
        test2: {
            target: 'test2',
            defaultType: 'string',
            defaultValue: 'test',
            authors: [],
            reviewers: [],
            isRemoved: false,
        },
    },
    requireds: {
        test3: {
            target: 'test3',
            authors: [],
            reviewers: [],
            isRemoved: true,
        },
    },
    removes: {
        test4: {
            target: 'test4',
            authors: [],
        },
    },
};

const v2: AnnotationStoreV2 = {
    schemaVersion: 2,
    boundaryAnnotations: {},
    calledAfterAnnotations: {},
    completeAnnotations: {},
    descriptionAnnotations: {},
    enumAnnotations: {},
    expertAnnotations: {},
    groupAnnotations: {},
    moveAnnotations: {},
    pureAnnotations: {},
    removeAnnotations: {
        test4: {
            target: 'test4',
            authors: [],
        },
    },
    renameAnnotations: {},
    todoAnnotations: {},
    valueAnnotations: {
        test: {
            target: 'test',
            authors: [],
            reviewers: [],
            isRemoved: true,
            variant: 'optional',
            defaultValueType: 'string',
            defaultValue: 'test',
        },
        test2: {
            target: 'test2',
            authors: [],
            reviewers: [],
            isRemoved: false,
            variant: 'optional',
            defaultValueType: 'string',
            defaultValue: 'test',
        },
        test3: {
            target: 'test3',
            authors: [],
            reviewers: [],
            isRemoved: true,
            variant: 'required',
        },
    },
};

test('migrate v1 to v2', () => {
    expect(migrateAnnotationStoreToCurrentVersion(v1)).toStrictEqual(v2);
});

test('migrate v2 to v2', () => {
    expect(migrateAnnotationStoreToCurrentVersion(v2)).toStrictEqual(v2);
});
