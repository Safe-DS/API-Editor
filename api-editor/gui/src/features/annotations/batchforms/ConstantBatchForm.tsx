import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { ConstantAnnotation, upsertConstants } from '../annotationSlice';
import { TypeValueBatchForm, TypeValueBatchFormState } from './TypeValueBatchForm';
import { PythonParameter } from '../../packageData/model/PythonParameter';

interface ConstantBatchFormProps {
    targets: PythonDeclaration[];
}

export const ConstantBatchForm: React.FC<ConstantBatchFormProps> = function ({ targets }) {
    //only parameters can have constant annotations
    const filteredTargets = targets.filter((t) => t instanceof PythonParameter);
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueBatchFormState) => {
        const all: ConstantAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
                defaultType: data.defaultType,
                defaultValue: data.defaultValue,
            });
        });
        dispatch(upsertConstants(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueBatchForm
            targets={filteredTargets}
            annotationType="constant"
            description="Delete matched parameters and replace references to them with a constant value."
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
