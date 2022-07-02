import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { EmptyBatchForm } from './EmptyBatchForm';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { RemoveAnnotation } from '../versioning/AnnotationStoreV2';
import {upsertRemoves} from "../annotationSlice";

interface RemoveBatchFormProps {
    targets: PythonDeclaration[];
}

export const RemoveBatchForm: React.FC<RemoveBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter((t) => t instanceof PythonClass || t instanceof PythonFunction);
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = () => {
        const all: RemoveAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
            });
        });
        dispatch(upsertRemoves(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <EmptyBatchForm
            targets={filteredTargets}
            annotationType="remove"
            description="Remove matched classes and functions."
            onUpsertAnnotation={handleUpsertAnnotation}
            targetLabel="This will annotate classes and functions."
        />
    );
};
