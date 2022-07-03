import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { RemoveAnnotation } from '../versioning/AnnotationStoreV2';
import { upsertRemoveAnnotations } from '../annotationSlice';
import { FormControl, FormLabel, Textarea } from '@chakra-ui/react';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';
import { useForm } from 'react-hook-form';

interface RemoveBatchFormProps {
    targets: PythonDeclaration[];
}

export const RemoveBatchForm: React.FC<RemoveBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter((t) => t instanceof PythonClass || t instanceof PythonFunction);
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: EmptyBatchFormState) => {
        const all: RemoveAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
                comment: data.comment,
            });
        });
        dispatch(upsertRemoveAnnotations(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <EmptyBatchForm
            targets={filteredTargets}
            annotationType="remove"
            description="Remove matched classes and functions."
            onUpsertAnnotation={handleUpsertAnnotation}
            targetLabel="This will annotate classes and functions."
        />
    );
};

interface EmptyBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    description: string;
    onUpsertAnnotation: (data: EmptyBatchFormState) => void;
    targetLabel: string;
}

export interface EmptyBatchFormState {
    comment: string;
}

export const EmptyBatchForm: React.FC<EmptyBatchFormProps> = function ({
    targets,
    annotationType,
    description,
    onUpsertAnnotation,
    targetLabel,
}) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
    } = useForm<EmptyBatchFormState>({
        defaultValues: {
            comment: '',
        },
    });

    const [data, setData] = useState<EmptyBatchFormState>({ comment: '' });

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);

    // Event handlers ----------------------------------------------------------

    const handleSave = (newData: EmptyBatchFormState) => {
        onUpsertAnnotation(newData);

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = (newData: EmptyBatchFormState) => {
        setData(newData);
        setConfirmWindowVisible(true);
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForm());
    };
    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <>
            <AnnotationBatchForm
                heading={`Add @${annotationType} Annotations`}
                description={description}
                onConfirm={handleSubmit(handleConfirm)}
                onCancel={handleCancel}
            >
                <FormControl>
                    <FormLabel>Comment:</FormLabel>
                    <Textarea {...register('comment')} />
                </FormControl>

                <FormLabel>{targetLabel}</FormLabel>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={targets}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
