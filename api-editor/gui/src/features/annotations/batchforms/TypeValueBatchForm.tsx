import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    NumberDecrementStepper,
    NumberIncrementStepper,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Text,
} from '@chakra-ui/react';
import React, {useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useAppDispatch} from '../../../app/hooks';
import {booleanPattern, numberPattern} from '../../../common/validation';
import PythonDeclaration from '../../packageData/model/PythonDeclaration';
import {DefaultType, DefaultValue, hideAnnotationForms} from '../annotationSlice';
import {AnnotationBatchForm} from './AnnotationBatchForm';

interface TypeValueBatchFormProps {
    target: PythonDeclaration[];
    annotationType: string;
    onUpsertAnnotation: (data: TypeValueBatchFormState) => void;
}

export interface TypeValueBatchFormState {
    defaultType: DefaultType;
    defaultValue: DefaultValue;
}

export const TypeValueBatchForm: React.FC<TypeValueBatchFormProps> = function ({
                                                                                   target,
                                                                                   annotationType,
                                                                                   onUpsertAnnotation,
                                                                               }) {
    const dispatch = useAppDispatch();

    const {
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
        formState: {errors},
    } = useForm<TypeValueBatchFormState>({
        defaultValues: {
            defaultType: 'string',
            defaultValue: '',
        },
    });

    const watchDefaultType = watch('defaultType');

    let [confirmVisible, setConfirmVisible] = useState(false);
    let [data, setData] = useState<TypeValueBatchFormState>({defaultType: 'string', defaultValue: ''});

    // Event handlers ----------------------------------------------------------

    const handleTypeChange = (newType: DefaultType) => {
        setValue('defaultType', newType);
        reset({
            defaultType: newType,
            defaultValue: '',
        });
    };

    const handleSave = (data: TypeValueBatchFormState) => {
        let toUpsert = {...data};
        if (data.defaultType === 'boolean') {
            toUpsert = {...data, defaultValue: data.defaultValue === 'true'};
        } else if (data.defaultType === 'none') {
            toUpsert = {...data, defaultValue: null};
        }
        onUpsertAnnotation(toUpsert);
        setConfirmVisible(false);
        hideAnnotationForms();
    };

    const handleConfirm = (newData: TypeValueBatchFormState) => {
        setData(newData);
        setConfirmVisible(true);
    };

    const handleCancel = () => {
        dispatch(hideAnnotationForms());
    };
    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <>
            <AnnotationBatchForm
                heading={`Add @${annotationType} annotation`}
                onConfirm={handleSubmit(handleConfirm)}
                onCancel={handleCancel}
            >
                <FormLabel>Type of default value of selected elements:</FormLabel>
                <RadioGroup defaultValue={'string'} onChange={handleTypeChange}>
                    <Stack direction="column">
                        <Radio value="string">String</Radio>
                        <Radio value="number">Number</Radio>
                        <Radio value="boolean">Boolean</Radio>
                        <Radio value="none">None</Radio>
                    </Stack>
                </RadioGroup>

                {watchDefaultType !== 'none' && (
                    <FormControl isInvalid={Boolean(errors?.defaultValue)}>
                        <FormLabel>Default value for selected elements:</FormLabel>
                        {watchDefaultType === 'string' && (
                            <Input
                                {...register('defaultValue', {
                                    required: 'This is required.',
                                })}
                            />
                        )}
                        {watchDefaultType === 'number' && (
                            <NumberInput>
                                <NumberInputField
                                    {...register('defaultValue', {
                                        required: 'This is required.',
                                        pattern: numberPattern,
                                    })}
                                />
                                <NumberInputStepper>
                                    <NumberIncrementStepper/>
                                    <NumberDecrementStepper/>
                                </NumberInputStepper>
                            </NumberInput>
                        )}
                        {watchDefaultType === 'boolean' && (
                            <Select
                                {...register('defaultValue', {
                                    required: 'This is required.',
                                    pattern: booleanPattern,
                                })}
                            >
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </Select>
                        )}
                        <FormErrorMessage>
                            <FormErrorIcon/> {errors.defaultValue?.message}
                        </FormErrorMessage>
                    </FormControl>
                )}
            </AnnotationBatchForm>
            {confirmVisible && (
                <ConfirmAnnotations count={target.length} handleSave={() => handleSave(data)}
                                    setConfirmVisible={setConfirmVisible}/>)}
        </>
    );
};

interface ConfirmAnnotationsProps {
    count: number;
    handleSave: () => void;
    setConfirmVisible: (visible: boolean) => void;
}

const ConfirmAnnotations: React.FC<ConfirmAnnotationsProps> = function ({count, handleSave, setConfirmVisible}) {
    const handleCancel = () => {
        setConfirmVisible(false);
        hideAnnotationForms();
    };

    const useCancelRef = useRef(null);

    return (
        <AlertDialog isOpen={true} leastDestructiveRef={useCancelRef} onClose={handleCancel}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <Heading>Annotate selected items</Heading>
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        <Text>This will annotate ${count} items, are you sure?</Text>
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={useCancelRef} onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button colorScheme="green" onClick={handleSave} ml={3}>
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}
