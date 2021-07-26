import {
    Button,
    FormControl,
    FormErrorIcon,
    FormErrorMessage,
    FormLabel,
    Heading,
    HStack,
    Input,
    Stack,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import '../../Components/SelectionView/SelectionView.module.css'
import PythonDeclaration from '../../model/python/PythonDeclaration'
import { pythonIdentifierPattern } from '../../util/validation'
import { hideAnnotationForms, selectRenaming, upsertRenaming } from './annotationSlice'

interface RenameFormProps {
    readonly target: PythonDeclaration
}

interface RenameFormInputs {
    newName: string
}

const RenameForm: React.FC<RenameFormProps> = (props) => {
    const target = props.target.pathAsString()
    const prevNewName = useAppSelector(selectRenaming(target))?.newName
    const oldName = props.target.name

    const dispatch = useAppDispatch()
    const {
        register,
        handleSubmit,
        setValue,
        setFocus,
        reset,
        formState: { errors },
    } = useForm<RenameFormInputs>()

    useEffect(() => {
        setValue('newName', prevNewName || oldName)
        setFocus('newName')
        reset()
    }, [setValue, prevNewName, oldName, setFocus, reset])

    const onSave = (data: RenameFormInputs) => {
        dispatch(
            upsertRenaming({
                target,
                newName: data.newName,
            }),
        )
        dispatch(hideAnnotationForms())
    }

    const onCancel = () => {
        dispatch(hideAnnotationForms())
    }

    return (
        <Stack p={4} spacing={4}>
            <Heading as="h3" size="lg">
                Add @rename Annotation
            </Heading>

            <FormControl isInvalid={Boolean(errors.newName)}>
                <FormLabel>New name for &quot;{oldName}&quot;:</FormLabel>
                <Input
                    {...register('newName', {
                        required: 'This is required.',
                        pattern: {
                            value: pythonIdentifierPattern,
                            message:
                                'Valid Python identifiers must start with a letter or underscore followed by letters, numbers, and underscores.',
                        },
                    })}
                />
                <FormErrorMessage>
                    <FormErrorIcon /> {errors.newName?.message}
                </FormErrorMessage>
            </FormControl>

            <HStack>
                <Button colorScheme="blue" onClick={handleSubmit(onSave)}>
                    Save
                </Button>
                <Button colorScheme="red" onClick={onCancel}>
                    Cancel
                </Button>
            </HStack>

            {/*<Modal.Body>*/}
            {/*    <Form noValidate>*/}
            {/*        <Modal.Body>*/}
            {/*            <Form.Group>*/}
            {/*                <Form.Label>New name for &quot;{oldName}&quot;:</Form.Label>*/}
            {/*                <Form.Control*/}
            {/*                    type="text"*/}
            {/*                    value={currentUserInput}*/}
            {/*                    onChange={handleChange}*/}
            {/*                    isInvalid={!isValidPythonIdentifier(currentUserInput)}*/}
            {/*                />*/}
            {/*                <Form.Control.Feedback type="invalid">*/}
            {/*                    Valid Python identifiers must start with a letter or underscore followed by letters,*/}
            {/*                    numbers and underscores.*/}
            {/*                </Form.Control.Feedback>*/}
            {/*            </Form.Group>*/}
            {/*        </Modal.Body>*/}
            {/*        <Modal.Footer></Modal.Footer>*/}
            {/*    </Form>*/}
            {/*</Modal.Body>*/}
        </Stack>
    )
}

export default RenameForm
