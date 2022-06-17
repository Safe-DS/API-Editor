import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { OptionalAnnotation, upsertOptionals } from '../annotationSlice';
import { TypeValueBatchForm, TypeValueBatchFormState } from './TypeValueBatchForm';
import { PythonParameter } from '../../packageData/model/PythonParameter';

interface OptionalBatchFormProps {
    targets: PythonDeclaration[];
}

export const OptionalBatchForm: React.FC<OptionalBatchFormProps> = function ({ targets }) {
    //only parameters can have optional annotations
    const filteredTargets = targets.filter((t) => t instanceof PythonParameter);
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueBatchFormState) => {
        const all: OptionalAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
                defaultType: data.defaultType,
                defaultValue: data.defaultValue,
            });
        });
        dispatch(upsertOptionals(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueBatchForm
            targets={filteredTargets}
            annotationType="optional"
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
