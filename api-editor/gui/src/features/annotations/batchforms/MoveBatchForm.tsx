import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { PythonClass } from '../../packageData/model/PythonClass';
import { DestinationBatchForm, DestinationBatchFormState } from './DestinationBatchForm';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { MoveAnnotation } from '../versioning/AnnotationStoreV2';
import { upsertMovesAnnotation } from '../annotationSlice';

interface MoveBatchFormProps {
    targets: PythonDeclaration[];
}

export const MoveBatchForm: React.FC<MoveBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter(
        (t) => t instanceof PythonClass || (t instanceof PythonFunction && t.isGlobal()),
    );
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: DestinationBatchFormState) => {
        const all: MoveAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
                destination: data.destination,
            });
        });
        dispatch(upsertMovesAnnotation(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <DestinationBatchForm
            targets={filteredTargets}
            annotationType="move"
            description="Move matched global declarations to another module."
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
