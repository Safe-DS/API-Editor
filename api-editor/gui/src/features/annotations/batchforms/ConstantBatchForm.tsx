import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import { upsertConstant } from '../annotationSlice';
import { TypeValueBatchForm, TypeValueBatchFormState } from './TypeValueBatchForm';
import PythonParameter from '../../packageData/model/PythonParameter';

interface ConstantBatchFormProps {
    target: PythonDeclaration[];
}

export const ConstantBatchForm: React.FC<ConstantBatchFormProps> = function ({target}) {
    //only parameters can have constant annotations
    target = target.filter(t => t instanceof PythonParameter);
    const targetPaths = target.map(t => t.pathAsString());

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueBatchFormState) => {
        // const all = targetPaths.map(path => {
        //     ConstantAnnotation.create({
        //         path,
        //         defaultType: data.defaultType,
        //         defaultValue: data.defaultValue,
        //     });
        // });
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
