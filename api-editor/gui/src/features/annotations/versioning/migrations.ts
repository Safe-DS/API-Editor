import { AnnotationStore as AnnotationStoreV1 } from './AnnotationStoreV1';
import { AnnotationStore as AnnotationStoreV2, migrateAnnotationStoreV1ToV2 } from './AnnotationStoreV2';
import { VersionedAnnotationStore } from './VersionedAnnotationStore';

export const migrateAnnotationStoreToCurrentVersion = function <OldAnnotationStore extends VersionedAnnotationStore>(
    oldAnnotationStore: OldAnnotationStore,
): AnnotationStoreV2 {
    switch (oldAnnotationStore.schemaVersion) {
        case 1:
            return migrateAnnotationStoreV1ToV2(oldAnnotationStore as unknown as AnnotationStoreV1);
        case 2:
            return oldAnnotationStore as unknown as AnnotationStoreV2;
            default:
                throw new Error(`Unsupported annotation store schema version: ${oldAnnotationStore.schemaVersion}`);
    }
};
