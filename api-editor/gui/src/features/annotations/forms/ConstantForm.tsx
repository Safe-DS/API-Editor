import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import { selectConstant, upsertConstant } from '../annotationSlice';
import {TypeValueForm, TypeValueFormState } from './TypeValueForm';

interface ConstantFormProps {
    target: PythonDeclaration;
}

const ConstantForm: React.FC<ConstantFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();

    // Hooks -----------------------------------------------------------------------------------------------------------
    const constantDefinition = useAppSelector(selectConstant(targetPath));
    const previousDefaultType = constantDefinition?.defaultType;
    const previousDefaultValue = constantDefinition?.defaultValue;
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueFormState) => {
        dispatch(
            upsertConstant({
                target: targetPath,
                ...data,
            }),
        );
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueForm
            target={target}
            annotationType="constant"
            previousDefaultType={previousDefaultType}
            previousDefaultValue={previousDefaultValue}
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};

export default ConstantForm;
