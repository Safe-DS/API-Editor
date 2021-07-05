import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import RenameAnnotation from "../../model/annotation/RenameAnnotation";
import {Nullable, Setter} from "../../util/types";
import {isValidPythonIdentifier} from "../../util/validation";
import "../ParameterView/ParameterView.css";

interface RenameDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
    originalName: string
    renameAnnotation: Nullable<RenameAnnotation>
    setRenameAnnotation: Setter<Nullable<RenameAnnotation>>
}

export default function RenameDialog(props: RenameDialogProps): JSX.Element {
    const [currentUserInput, setCurrentUserInput] = useState(props.renameAnnotation?.newName ?? props.originalName);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setCurrentUserInput(event.target.value);

    const close = () => {
        props.setIsVisible(false);
    };

    const submit = () => {
        if (currentUserInput === props.originalName) {
            props.setRenameAnnotation(null);
            props.setIsVisible(false);
        } else if (isValidPythonIdentifier(currentUserInput)) {
            props.setRenameAnnotation(new RenameAnnotation(currentUserInput));
            props.setIsVisible(false);
        }
    };

    return (
        <Modal
            onHide={close}
            show={props.isVisible}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>
                                New name for &quot;{props.originalName}&quot;:
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
                        <Button variant="secondary" onClick={close}>
                            Close
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
