import React from 'react';
import {useAppDispatch} from '../../../app/hooks';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {upsertConstant} from '../annotationSlice';
import {TypeValueBatchForm, TypeValueBatchFormState} from "./TypeValueBatchForm";

interface ConstantBatchFormProps {
    target: PythonDeclaration[];
}

export const ConstantBatchForm: React.FC<ConstantBatchFormProps> = function ({target}) {
    const targetPaths = target.map(t => t.pathAsString());

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueBatchFormState) => {
        targetPaths.forEach(targetPath => {
            dispatch(
                upsertConstant({
                    target: targetPath,
                    ...data,
                }),
            );
        });
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueBatchForm
            target={target}
            annotationType="constant"
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
