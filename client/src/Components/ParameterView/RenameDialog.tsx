import React from "react";
import "./ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";

type showDialogState = {handleState: boolean, setDialogState: any}

const RenameDialog = ({handleState, setDialogState}: showDialogState) => {

    const handleClose = () => setDialogState(false);

    const state = {
        val: ""
    };

    const onSubmit = () => {
        console.log(state.val);
    };

    return(

        <Modal
            show={handleState}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>
                            New Name:
                        </Form.Label>
                        <Form.Control placeholder="New Name" type="text"/>

                    </Form.Group>
                </Form>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={onSubmit}>Submit</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RenameDialog;