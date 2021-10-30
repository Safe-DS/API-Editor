import {
    Checkbox,
    CheckboxGroup,
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Input,
    VStack,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { pythonIdentifierPattern } from '../../../common/validation'
import PythonDeclaration from '../../packageData/model/PythonDeclaration'
import PythonFunction from '../../packageData/model/PythonFunction'
import PythonParameter from '../../packageData/model/PythonParameter'
import {
    GroupAnnotation,
    hideAnnotationForms,
    removeGroup,
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

const GroupForm: React.FC<GroupFormProps> = function({
                                                         target,
                                                         groupName,
                                                     }: GroupFormProps) {
    const targetPath = target.pathAsString()
    let currentGroups = useAppSelector(selectGroups(targetPath))
    let prevGroupAnnotation: GroupAnnotation | undefined
    if (groupName && currentGroups) {
        prevGroupAnnotation = currentGroups[groupName]
    }
    let otherGroupNames: string[] = []
    if (!!currentGroups) {
        otherGroupNames = Object.values(currentGroups)
            .filter(group => group.groupName !== prevGroupAnnotation?.groupName)
            .map(group => group.groupName)
    }

    let allParameters: PythonParameter[] = []

    if (target instanceof PythonFunction) {
        allParameters = target.children()
    }

    const buildAlreadyUsedName = (name: string, usedIn: string) => {
        return name + ' (already used in ' + usedIn + ')'
    }

    const getParameterName = (name: string) => {
        if (!currentGroups) {
            return name
        }

        for (let group of otherGroupNames) {
            if (currentGroups[group]?.parameters.some(parameter => parameter === name)) {
                if (!prevGroupAnnotation ||
                    (prevGroupAnnotation && currentGroups[group].groupName !== prevGroupAnnotation.groupName)
                ) {
                    return buildAlreadyUsedName(name, currentGroups[group].groupName)
                }
            }
        }
        return name
    }

    const updateOtherGroups = () => {
        if (!!currentGroups) {
            for (let groupName of otherGroupNames) {
                let needsChange = false
                let group = currentGroups[groupName]
                let currentAnnotationParameter = [...getValues('parameters')]
                let currentGroupParameter = [...group.parameters]
                for (let parameter of currentAnnotationParameter) {
                    const index = currentGroupParameter.indexOf(parameter)
                    if (index > -1) {
                        needsChange = true
                        currentGroupParameter.splice(index, 1)
                    }
                }
                if (currentGroupParameter.length < 1) {
                    dispatch(removeGroup(
                        { target: targetPath, groupName: group.groupName },
                    ))
                } else if (needsChange) {
                    dispatch(upsertGroup(
                        {
                            parameters: currentGroupParameter,
                            groupName: group.groupName,
                            target: group.target,
                        },
                    ))
                }
            }
        }
    }

    const checkedAtLeastOne = () => {
        return getValues('parameters') && getValues('parameters').length >= 1
    }

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch()
    const {
        control,
        getValues,
        handleSubmit,
        setFocus,
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

    const onSave = (data: GroupFormState) => {
        updateOtherGroups()
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
            <FormControl isInvalid={Boolean(errors?.groupName)}>
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
            <FormControl
                isInvalid={Boolean(errors?.parameters)}
            >
                <Controller
                    name='parameters'
                    control={control}
                    render={({ field: { ref, ...rest } }) => (
                        <CheckboxGroup
                            {...rest}
                            defaultValue={prevGroupAnnotation?.parameters || []}
                        >
                            <VStack alignItems='left'>
                                {allParameters.map((parameter) => (
                                    <Checkbox
                                        key={parameter.name}
                                        value={parameter.name}
                                    >
                                        {getParameterName(parameter.name)}
                                    </Checkbox>
                                ))}
                            </VStack>
                        </CheckboxGroup>
                    )}
                    rules = {{ validate: () => checkedAtLeastOne() }}
                />
                <FormErrorMessage>
                    <FormErrorIcon />
                    {
                        errors?.parameters &&
                        'At least one parameter needs to be selected.'
                    }
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    )
}

export default GroupForm
