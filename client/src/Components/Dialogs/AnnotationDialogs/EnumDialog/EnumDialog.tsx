import classNames from 'classnames'
import { Formik } from 'formik'
import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import EnumPair from '../../../../model/EnumPair'
import PythonEnum from '../../../../model/python/PythonEnum'
import { isEmptyList } from '../../../../util/listOperations'
import { Nullable, Setter } from '../../../../util/types'
import { isValidPythonIdentifier } from '../../../../util/validation'
import DialogCSS from '../../dialogs.module.css'
import EnumHandle from './EnumHandle'

type showDialogState = {
    dialogState: boolean
    setDialogState: Setter<boolean>
    enumDefinition: Nullable<PythonEnum>
    setEnumDefinition: Setter<Nullable<PythonEnum>>
}

export default function EnumDialog({
    dialogState,
    setDialogState,
    enumDefinition,
    setEnumDefinition,
}: showDialogState): JSX.Element {
    const [shouldValidate, setShouldValidate] = useState(false)
    const [name, setName] = useState(enumDefinition?.enumName ? enumDefinition?.enumName : '')
    const initialList: EnumPair[] = []
    const [listOfEnumPairs, setListOfEnumPairs] = useState<EnumPair[]>(initialList)
    const cssClasses = classNames(DialogCSS.modalDialog, DialogCSS.annotationDialog)

    const deepCloneOrEmpty = (from: EnumPair[], to: EnumPair[]) => {
        if (from.length > 0) {
            from.forEach(function (value) {
                to.push(new EnumPair(value.key, value.value))
            })
        } else {
            to.push(new EnumPair('', ''))
        }
    }

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value)
    }

    const onFormSubmit = () => {
        const validInputInstances =
            !isEmptyList(listOfEnumPairs) &&
            listOfEnumPairs.every(
                (it) => it.key.length > 0 && it.value.length > 0 && it.isValidValue() && it.isValidKey(),
            )

        if (name && isValidPythonIdentifier(name) && validInputInstances) {
            setEnumDefinition(new PythonEnum(name, listOfEnumPairs))
            setDialogState(false)
        } else {
            setShouldValidate(true)
        }
    }

    const handleClose = () => {
        setDialogState(false)
    }

    if (enumDefinition?.enumPairs) {
        deepCloneOrEmpty(enumDefinition?.enumPairs, initialList)
    } else {
        initialList.push(new EnumPair('', ''))
    }

    return (
        <Modal show={dialogState} onHide={handleClose} className={cssClasses}>
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
