import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import DialogCSS from '../../../Components/Dialogs/dialogs.module.css'
import '../../../Components/SelectionView/SelectionView.module.css'
import PythonDeclaration from '../../../model/python/PythonDeclaration'
import { Setter } from '../../../util/types'
import { isValidPythonIdentifier } from '../../../util/validation'
import { selectRenaming, upsertRenaming } from '../annotationSlice'

interface RenameDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
    target: PythonDeclaration
}

export default function RenameDialog(props: RenameDialogProps): JSX.Element {
    const target = props.target.pathAsString()
    const newName = useAppSelector(selectRenaming(target))?.newName
    const oldName = props.target.name
    const [currentUserInput, setCurrentUserInput] = useState(newName ?? oldName)
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setCurrentUserInput(event.target.value)
    const dispatch = useAppDispatch()
    const close = () => {
        props.setIsVisible(false)
    }

    const submit = () => {
        if (isValidPythonIdentifier(currentUserInput)) {
            dispatch(
                upsertRenaming({
                    target,
                    newName: currentUserInput,
                }),
            )
            props.setIsVisible(false)
        }
    }

    return (
        <Modal onHide={close} show={props.isVisible} className={DialogCSS.annotationDialog}>
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>New name for &quot;{oldName}&quot;:</Form.Label>
                            <Form.Control
                                type="text"
                                value={currentUserInput}
                                onChange={handleChange}
                                isInvalid={!isValidPythonIdentifier(currentUserInput)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Valid Python identifiers must start with a letter or underscore followed by letters,
                                numbers and underscores.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={close}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="button" onClick={submit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    )
}
