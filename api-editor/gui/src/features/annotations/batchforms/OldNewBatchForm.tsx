import {FormLabel, Input,} from '@chakra-ui/react';
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {useAppDispatch} from '../../../app/hooks';
import {PythonDeclaration} from '../../packageData/model/PythonDeclaration';
import {AnnotationBatchForm} from './AnnotationBatchForm';
import {hideAnnotationForm} from '../../ui/uiSlice';
import {ConfirmAnnotations} from "./ConfirmAnnotations";

interface OldNewBatchFormProps {
    targets: PythonDeclaration[];
    annotationType: string;
    onUpsertAnnotation: (data: OldNewBatchFormState) => void;

}

export interface OldNewBatchFormState {
    oldString: string;
    newString: string;
}

export const OldNewBatchForm: React.FC<OldNewBatchFormProps> = function ({
                                                                             targets,
                                                                             annotationType,
                                                                             onUpsertAnnotation,
                                                                         }) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
    } = useForm<OldNewBatchFormState>({
        defaultValues: {
            oldString: '',
            newString: '',
        },
    });

    let [confirmWindowVisible, setConfirmWindowVisible] = useState(false);
    let [data, setData] = useState<OldNewBatchFormState>({oldString: '', newString: ''});

    // Event handlers ----------------------------------------------------------

    const handleSave = (annotationData: OldNewBatchFormState) => {
        onUpsertAnnotation({...annotationData});

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
                heading={`Add @${annotationType} annotation`}
                onConfirm={handleSubmit(handleConfirm)}
                onCancel={handleCancel}
            >
                <FormLabel>String to be replaced:</FormLabel>
                <Input
                    {...register('oldString', {
                        required: 'This is required.',
                    })}
                />

                <FormLabel>Replacement String:</FormLabel>
                <Input
                    {...register('newString', {
                        required: 'This is required.',
                    })}
                />
                <FormLabel>This will annotate everything except Modules.</FormLabel>
            </AnnotationBatchForm>
            {confirmWindowVisible && (
                <ConfirmAnnotations
                    count={targets.length}
                    handleSave={() => handleSave(data)}
                    setConfirmVisible={setConfirmWindowVisible}
                />
            )}
        </>
    );
};
