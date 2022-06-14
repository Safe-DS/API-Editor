import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { upsertConstant } from '../annotationSlice';
import { TypeValueBatchForm, TypeValueBatchFormState } from './TypeValueBatchForm';
import { PythonParameter } from '../../packageData/model/PythonParameter';

interface ConstantBatchFormProps {
    targets: PythonDeclaration[];
}

export const ConstantBatchForm: React.FC<ConstantBatchFormProps> = function ({ targets }) {
    //only parameters can have constant annotations
    const targetParameters = targets.filter((t) => t instanceof PythonParameter);
    const targetPaths = targetParameters.map((t) => t.id);

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
        targetPaths.forEach((targetPath) => {
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
        <TypeValueBatchForm targets={targets} annotationType="constant" onUpsertAnnotation={handleUpsertAnnotation} />
    );
};
