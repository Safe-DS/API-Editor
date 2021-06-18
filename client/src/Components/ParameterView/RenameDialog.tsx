import React, {useState} from "react";
import "./ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";

type showDialogState = { handleState: boolean, setDialogState: any, currentRename?: string, setRenameName: any }

const RenameDialog = ({handleState, setDialogState, currentRename, setRenameName}: showDialogState) => {

    const handleClose = () => setDialogState(false);

    const [value, setValue] = useState(currentRename),
        onInput = ({target: {value}}: any) => setValue(value),
        onFormSubmit = (e: any) => {
            e.preventDefault();
            if (!!value) {
                handleClose();
                setRenameName(value);
            }
        }

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
};

export default RenameDialog;