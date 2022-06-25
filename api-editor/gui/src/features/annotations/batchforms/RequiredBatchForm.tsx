import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { RequiredAnnotation, addRequireds } from '../annotationSlice';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { EmptyBatchForm } from './EmptyBatchForm';

interface RequiredBatchFormProps {
    targets: PythonDeclaration[];
}

export const RequiredBatchForm: React.FC<RequiredBatchFormProps> = function ({ targets }) {
    //only parameters can have required annotations
    const filteredTargets = targets.filter((t) => t instanceof PythonParameter);
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = () => {
        const all: RequiredAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
            });
        });
        dispatch(addRequireds(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <EmptyBatchForm
            targets={filteredTargets}
            annotationType="required"
            onUpsertAnnotation={handleUpsertAnnotation}
            targetLabel="This will annotate parameters."
        />
    );
};
