import { Formik } from 'formik'
import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../../../../app/hooks'
import DialogCSS from '../../../../Components/Dialogs/dialogs.module.css'
import { isEmptyList } from '../../../../util/listOperations'
import { Setter } from '../../../../util/types'
import { isValidEnumInstanceName, isValidPythonIdentifier } from '../../../../util/validation'
import { EnumPair, selectEnum, upsertEnum } from '../../annotationSlice'
import EnumHandle from './EnumHandle'

type showDialogState = {
    target: string
    dialogState: boolean
    setDialogState: Setter<boolean>
}

export default function EnumDialog(props: showDialogState): JSX.Element {
    const enumDefinition = useAppSelector(selectEnum(props.target))
    const [shouldValidate, setShouldValidate] = useState(false)
    const [name, setName] = useState(enumDefinition?.enumName ? enumDefinition?.enumName : '')
    const initialList: EnumPair[] = []
    const [listOfEnumPairs, setListOfEnumPairs] = useState<EnumPair[]>(initialList)
    const deepCloneOrEmpty = (from: EnumPair[], to: EnumPair[]) => {
        if (from.length > 0) {
            from.forEach(function (value) {
                to.push({ ...value })
            })
        } else {
            to.push({ stringValue: '', instanceName: '' })
        }
    }

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }

    const dispatch = useAppDispatch()

    const onFormSubmit = () => {
        const validInputInstances =
            !isEmptyList(listOfEnumPairs) &&
            listOfEnumPairs.every(
                (it) =>
                    it.stringValue.length > 0 && it.instanceName.length > 0 && isValidEnumInstanceName(it.instanceName),
            )

        if (name && isValidPythonIdentifier(name) && validInputInstances) {
            dispatch(
                upsertEnum({
                    target: props.target,
                    enumName: name,
                    enumPairs: listOfEnumPairs,
                }),
            )
            props.setDialogState(false)
        } else {
            setShouldValidate(true)
        }
    }

    const handleClose = () => {
        props.setDialogState(false)
    }

    if (enumDefinition?.enumPairs) {
        deepCloneOrEmpty(enumDefinition?.enumPairs, initialList)
    } else {
        initialList.push({ stringValue: '', instanceName: '' })
    }

    return (
        <Modal show={props.dialogState} onHide={handleClose} className={DialogCSS.annotationDialog}>
            <Modal.Header closeButton>
                <Modal.Title>Add @enum Annotation</Modal.Title>
            </Modal.Header>

            <Formik
                onSubmit={console.log}
                initialValues={{
                    currentEnumNameValue: '',
                }}
            >
                {() => (
                    <Form noValidate>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>Enum name:</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={onInput}
                                    isInvalid={(!isValidPythonIdentifier(name) && !!name) || (!name && shouldValidate)}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Valid Python identifiers must start with a letter or underscore followed by letters,
                                    numbers and underscores.
                                </Form.Control.Feedback>
                                <EnumHandle
                                    listOfEnumPairs={listOfEnumPairs}
                                    setListOfEnumPairs={setListOfEnumPairs}
                                    shouldValidate={shouldValidate}
                                    setShouldValidate={setShouldValidate}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="button" onClick={onFormSubmit}>
                                Submit
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    )
}
