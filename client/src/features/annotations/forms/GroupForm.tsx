import {
    Checkbox,
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
    hideAnnotationForms,
    selectGroups,
    upsertGroup,
} from '../annotationSlice'
import AnnotationForm from './AnnotationForm'

interface GroupFormProps {
    readonly target: PythonDeclaration;
}

interface GroupFormState {
    groupName: string;
    parameters: string[];
}

const GroupForm: React.FC<GroupFormProps> = function({ target }) {
    const targetPath = target.pathAsString()
    const prevGroupName = useAppSelector(selectGroups(targetPath))?.groupName
    let allParameters: PythonParameter[] = []

    if (target instanceof PythonFunction) {
        allParameters = target.children()
    }

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch()
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<GroupFormState>({
        defaultValues: {
            groupName: '',
            parameters: [],
        },
    })

    useEffect(() => {
        setFocus('groupName')
    }, [setFocus])

    useEffect(() => {
        reset({
            groupName: prevGroupName || '',
        })
    }, [reset, prevGroupName])

    // Event handlers --------------------------------------------------------------------------------------------------

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
            heading={`${prevGroupName ? 'Edit' : 'Add'} @group annotation`}
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
            {allParameters.map((parameter) => (
                <Checkbox value={parameter.name}>{parameter.name}</Checkbox>
            ))}
        </AnnotationForm>
    )
}

export default GroupForm
