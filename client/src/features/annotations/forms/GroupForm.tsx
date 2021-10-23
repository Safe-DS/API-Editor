import {
    Checkbox,
    CheckboxGroup,
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { pythonIdentifierPattern } from '../../../common/validation'
import PythonDeclaration from '../../packageData/model/PythonDeclaration'
import PythonFunction from '../../packageData/model/PythonFunction'
import PythonParameter from '../../packageData/model/PythonParameter'
import {
    GroupAnnotation,
    hideAnnotationForms,
    selectGroups,
    upsertGroup,
} from '../annotationSlice'
import AnnotationForm from './AnnotationForm'

interface GroupFormProps {
    readonly target: PythonDeclaration;
    readonly groupName?: string;
}

interface GroupFormState {
    groupName: string;
    parameters: string[];
}

const GroupForm: React.FC<GroupFormProps> = function({ target, groupName }: GroupFormProps) {
    const targetPath = target.pathAsString()
    let prevGroupAnnotation: GroupAnnotation | undefined;
    let currentGroups = useAppSelector(selectGroups(targetPath));
    if (groupName && currentGroups) {
        prevGroupAnnotation = currentGroups[groupName];
    }
    let allParameters: PythonParameter[] = []

    if (target instanceof PythonFunction) {
        allParameters = target.children()
    }

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch()
    const {
        handleSubmit,
        setFocus,
        setValue,
        register,
        reset,
        formState: { errors },
    } = useForm<GroupFormState>({
        defaultValues: {
            groupName: '',
            parameters: prevGroupAnnotation?.parameters || [],
        },
    })

    useEffect(() => {
        setFocus('groupName')
    }, [setFocus])

    useEffect(() => {
        reset({
            groupName: prevGroupAnnotation?.groupName || '',
        })
    }, [reset, prevGroupAnnotation])

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleParameterChange = (value: string[]) => {
        setValue('parameters', value);
    }

    const onSave = (data: GroupFormState) => {
        dispatch(
            upsertGroup({
                target: targetPath,
                ...data,
            }),
        )
        dispatch(hideAnnotationForms())
    }

    const onCancel = () => {
        dispatch(hideAnnotationForms())
    }

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <AnnotationForm
            heading={`${prevGroupAnnotation ? 'Edit' : 'Add'} @group annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.groupName)}>
                <FormLabel>Function &quot;{target.name}&quot;:</FormLabel>
                <Input
                    placeholder='Name of parameter object'
                    {...register('groupName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.groupName?.message}
                </FormErrorMessage>
            </FormControl>
            <CheckboxGroup
                defaultValue={prevGroupAnnotation?.parameters || []}
                onChange={handleParameterChange}
            >
                {allParameters.map((parameter) => (
                    <Checkbox
                        key={parameter.name}
                        value={parameter.name}
                    >
                        {parameter.name}
                    </Checkbox>
                ))}
            </CheckboxGroup>
        </AnnotationForm>
    )
}

export default GroupForm
