import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonParameter } from '../../packageData/model/PythonParameter';
import { RenameAnnotation } from '../versioning/AnnotationStoreV2';
import { upsertRenameAnnotations } from '../annotationSlice';
import {
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
    Text as ChakraText,
    Textarea,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { ConfirmAnnotations } from './ConfirmAnnotations';

interface RenameBatchFormProps {
    targets: PythonDeclaration[];
}

export const RenameBatchForm: React.FC<RenameBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter(
        (t) => t instanceof PythonClass || t instanceof PythonFunction || t instanceof PythonParameter,
    );

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: OldNewBatchFormState) => {
        const all: RenameAnnotation[] = [];
        filteredTargets.forEach((t) => {
            if (t.name !== t.name.replace(data.oldString, data.newString)) {
                all.push({
                    target: t.id,
                    newName: t.name.replace(data.oldString, data.newString),
                    comment: data.comment,
                });
            }
        });
        dispatch(upsertRenameAnnotations(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <OldNewBatchForm
            targets={filteredTargets}
            annotationType="rename"
            description="Substitute parts of the names of matched declarations."
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};

interface OldNewBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    description: string;
    onUpsertAnnotation: (data: OldNewBatchFormState) => void;
}

export interface OldNewBatchFormState {
    oldString: string;
    newString: string;
    comment: string;
}

export const OldNewBatchForm: React.FC<OldNewBatchFormProps> = function ({
    targets,
    annotationType,
    description,
    onUpsertAnnotation,
}) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<OldNewBatchFormState>({
        defaultValues: {
            oldString: '',
            newString: '',
            comment: '',
        },
    });

    const [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    const [data, setData] = useState<OldNewBatchFormState>({ oldString: '', newString: '', comment: '' });

    const filteredTargets = targets.filter((t) => t.name !== t.name.replace(data.oldString, data.newString));

    // Event handlers ----------------------------------------------------------

    const handleSave = (annotationData: OldNewBatchFormState) => {
        onUpsertAnnotation({ ...annotationData });

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = (newData: OldNewBatchFormState) => {
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
                <FormControl isInvalid={Boolean(errors.oldString)}>
                    <FormLabel>String to be replaced:</FormLabel>
                    <Input
                        {...register('oldString', {
                            required: 'This is required.',
                        })}
                    />
                    <FormErrorMessage>
                        <FormErrorIcon /> {errors.oldString?.message}
                    </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={Boolean(errors.newString)}>
                    <FormLabel>Replacement String:</FormLabel>
                    <Input {...register('newString')} />
                    <FormErrorMessage>
                        <FormErrorIcon /> {errors.newString?.message}
                    </FormErrorMessage>
                </FormControl>

                <FormControl>
                    <FormLabel>Comment:</FormLabel>
                    <Textarea {...register('comment')} />
                </FormControl>

                <ChakraText>This will annotate classes, functions, and parameters.</ChakraText>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    targets={filteredTargets}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
