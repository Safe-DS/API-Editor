import classNames from "classnames";
import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {Nullable, Setter} from "../../util/types";
import {isValidPythonIdentifier} from "../../util/validation";
import "../SelectionView/SelectionView.css";
import DialogCSS from "./dialog.module.css";

interface RenameDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
    oldName: string
    newName: Nullable<string>
    setNewName: Setter<Nullable<string>>
}

export default function RenameDialog(props: RenameDialogProps): JSX.Element {
    const [currentUserInput, setCurrentUserInput] = useState(props.newName ?? props.oldName);
    const cssClasses = classNames(DialogCSS.modalDialog, DialogCSS.annotationDialog);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setCurrentUserInput(event.target.value);

    const close = () => {
        props.setIsVisible(false);
    };

    const submit = () => {
        const name = isValidPythonIdentifier(currentUserInput);
        if (name) {
            props.setNewName(currentUserInput);
            props.setIsVisible(false);
        }
    };

    return (
        <Modal
            onHide={close}
            show={props.isVisible}
            className={cssClasses}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>
                                New name for &quot;{props.oldName}&quot;:
                            </Form.Label>
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
    );
}
