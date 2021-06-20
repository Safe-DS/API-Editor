import React, {FormEvent, useState} from "react";
import "./ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";

type showDialogState = {
    handleState: boolean, setDialogState: Setter<boolean>, currentRename?: string,
    setRenameName: Setter<string>
}

export default function RenameDialog({
                                         handleState,
                                         setDialogState,
                                         currentRename,
                                         setRenameName
                                     }: showDialogState): JSX.Element {

    const handleClose = () => setDialogState(false);

    const [value, setValue] = useState(currentRename);
    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value);
    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value) {
            handleClose();
            setRenameName(value);
        }
    };

    return (
        <Modal
            show={handleState}
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onFormSubmit}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>
                            New Name:
                        </Form.Label>
                        <Form.Control onChange={onInput} value={value} placeholder={currentRename} type="text"/>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
