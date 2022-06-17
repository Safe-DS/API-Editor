import { FormLabel } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';

interface EmptyBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    onUpsertAnnotation: () => void;
}

export const EmptyBatchForm: React.FC<EmptyBatchFormProps> = function ({
    targets,
    annotationType,
    onUpsertAnnotation,
}) {
    const dispatch = useAppDispatch();

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);

    // Event handlers ----------------------------------------------------------

    const handleSave = () => {
        onUpsertAnnotation();

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = () => {
        setConfirmWindowVisible(true);
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForm());
    };
    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <>
            <AnnotationBatchForm
                heading={`Add @${annotationType} annotation`}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            >
                <FormLabel>This will annotate everything except modules.</FormLabel>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    count={targets.length}
                    handleSave={() => handleSave()}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
