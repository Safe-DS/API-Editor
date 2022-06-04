import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import { selectOptional, upsertOptional } from '../annotationSlice';
import {TypeValueForm, TypeValueFormState } from './TypeValueForm';

interface OptionalFormProps {
    target: PythonDeclaration;
}

export const OptionalForm: React.FC<OptionalFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();

    // Hooks -----------------------------------------------------------------------------------------------------------
    const optionalDefinition = useAppSelector(selectOptional(targetPath));
    const previousDefaultType = optionalDefinition?.defaultType;
    const previousDefaultValue = optionalDefinition?.defaultValue;
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueFormState) => {
        dispatch(
            upsertOptional({
                target: targetPath,
                ...data,
            }),
        );
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueForm
            target={target}
            annotationType="optional"
            previousDefaultType={previousDefaultType}
            previousDefaultValue={previousDefaultValue}
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
