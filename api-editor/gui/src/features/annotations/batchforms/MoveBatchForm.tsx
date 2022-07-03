import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { MoveAnnotation } from '../versioning/AnnotationStoreV2';
import { upsertMoveAnnotations } from '../annotationSlice';
import { hideAnnotationForm } from '../../ui/uiSlice';
import { AnnotationBatchForm } from './AnnotationBatchForm';
import { ConfirmAnnotations } from './ConfirmAnnotations';
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

interface MoveBatchFormProps {
    targets: PythonDeclaration[];
}

export const MoveBatchForm: React.FC<MoveBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter(
        (t) => t instanceof PythonClass || (t instanceof PythonFunction && t.isGlobal()),
    );
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: DestinationBatchFormState) => {
        const all: MoveAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
                destination: data.destination,
                comment: data.comment,
            });
        });
        dispatch(upsertMoveAnnotations(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <DestinationBatchForm
            targets={filteredTargets}
            annotationType="move"
            description="Move matched global declarations to another module."
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};

interface DestinationBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    description: string;
    onUpsertAnnotation: (data: DestinationBatchFormState) => void;
}

export interface DestinationBatchFormState {
    destination: string;
    comment: string;
}

export const DestinationBatchForm: React.FC<DestinationBatchFormProps> = function ({
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
    } = useForm<DestinationBatchFormState>({
        defaultValues: {
            destination: '',
            comment: '',
        },
    });

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    let [data, setData] = useState<DestinationBatchFormState>({ destination: '', comment: '' });

    // Event handlers ----------------------------------------------------------

    const handleSave = (annotationData: DestinationBatchFormState) => {
        onUpsertAnnotation({ ...annotationData });

        setConfirmWindowVisible(false);
        dispatch(hideAnnotationForm());
    };

    const handleConfirm = (newData: DestinationBatchFormState) => {
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
                <FormControl isInvalid={Boolean(errors?.destination)}>
                    <FormLabel>Destination module:</FormLabel>
                    <Input
                        {...register('destination', {
                            required: 'This is required.',
                        })}
                    />
                    <FormErrorMessage>
                        <FormErrorIcon /> {errors.destination?.message}
                    </FormErrorMessage>
                </FormControl>

                <FormControl>
                    <FormLabel>Comment:</FormLabel>
                    <Textarea {...register('comment')}/>
                </FormControl>

                <ChakraText>This will annotate classes and global functions.</ChakraText>
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
