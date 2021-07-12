import React from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {Setter} from "../../util/types";
import "../ParameterView/ParameterView.css";

interface ImportAnnotationFileDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
}

export default function ImportAnnotationFileDialog(props: ImportAnnotationFileDialogProps): JSX.Element {

    const close = () => {
        props.setIsVisible(false);
    };

    const submit = () => {
        console.log("TODO");
    };

    return (
        <Modal
            onHide={close}
            show={props.isVisible}
        >
            <Modal.Header closeButton>
                <Modal.Title>Import annotation file</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>
                                Please upload a new annotation file.
                            </Form.Label>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={close}>
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
