import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import { selectAttribute, upsertAttribute } from '../annotationSlice';
import { TypeValueForm, TypeValueFormState } from './TypeValueForm';

interface AttributeFormProps {
    target: PythonDeclaration;
}

export const AttributeForm: React.FC<AttributeFormProps> = function ({ target }) {
    const targetPath = target.pathAsString();

    // Hooks -----------------------------------------------------------------------------------------------------------
    const previousAnnotation = useAppSelector(selectAttribute(targetPath));
    const previousDefaultType = previousAnnotation?.defaultType;
    const previousDefaultValue = previousAnnotation?.defaultValue;
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: TypeValueFormState) => {
        dispatch(
            upsertAttribute({
                target: targetPath,
                ...data,
            }),
        );
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <TypeValueForm
            target={target}
            annotationType="attribute"
            previousDefaultType={previousDefaultType}
            previousDefaultValue={previousDefaultValue}
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
