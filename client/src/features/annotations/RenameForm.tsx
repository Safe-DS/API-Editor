import { FormControl, FormErrorIcon, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { pythonIdentifierPattern } from '../../common/validation'
import PythonDeclaration from '../../model/python/PythonDeclaration'
import AnnotationForm from './AnnotationForm'
import { hideAnnotationForms, selectRenaming, upsertRenaming } from './annotationSlice'

interface RenameFormProps {
    readonly target: PythonDeclaration
}

interface RenameFormState {
    newName: string
}

const RenameForm: React.FC<RenameFormProps> = (props) => {
    const target = props.target.pathAsString()
    const prevNewName = useAppSelector(selectRenaming(target))?.newName
    const oldName = props.target.name

    // Hooks -----------------------------------------------------------------------------------------------------------

    const dispatch = useAppDispatch()
    const {
        register,
        handleSubmit,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<RenameFormState>({
        defaultValues: {
            newName: '',
        },
    })

    useEffect(() => {
        setFocus('newName')
    }, [setFocus])

    useEffect(() => {
        reset({
            newName: prevNewName || oldName,
        })
    }, [reset, prevNewName, oldName])

    // Event handlers --------------------------------------------------------------------------------------------------

    const onSave = (data: RenameFormState) => {
        dispatch(
            upsertRenaming({
                target,
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
            heading={`${prevNewName ? 'Edit' : 'Add'} @rename annotation`}
            onSave={handleSubmit(onSave)}
            onCancel={onCancel}
        >
            <FormControl isInvalid={Boolean(errors.newName)}>
                <FormLabel>New name for &quot;{oldName}&quot;:</FormLabel>
                <Input
                    {...register('newName', {
                        required: 'This is required.',
                        pattern: pythonIdentifierPattern,
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newName?.message}
                </FormErrorMessage>
            </FormControl>
        </AnnotationForm>
    )
}

export default RenameForm
