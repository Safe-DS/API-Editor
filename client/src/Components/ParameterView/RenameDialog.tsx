import {Formik} from 'formik';
import React, {FormEvent, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {Setter} from "../../util/types";
import {nameValidation} from "../../util/validation";
import "./ParameterView.css";

interface showDialogState {
    dialogState: boolean,
    setDialogState: Setter<boolean>,
    currentName: string,
    setCurrentName: Setter<string>,
    currentRenameValue: string,
    setCurrentRenameValue: Setter<string>,
    onSubmit: (name: string)=>void
}

export default function RenameDialog({
                                         dialogState,
                                         setDialogState,
                                         currentName,
                                         setCurrentName,
                                         currentRenameValue,
                                         setCurrentRenameValue,
                                         onSubmit
                                     }: showDialogState): JSX.Element {

    const [nameValid, setNameValid] = useState(true);

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentRenameValue(event.target.value);
        setNameValid(nameValidation(event.target.value));
    };

    const resetData = () => {
        setDialogState(false);
        setNameValid(true);
        setCurrentRenameValue(currentName);
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (currentRenameValue && currentRenameValue !== currentName && nameValid) {
            onSubmit(currentRenameValue);
            currentName = currentRenameValue;
            setCurrentName(currentRenameValue);
            resetData();
        }
    };

    const handleClose = () => {
        resetData();
    };

    return (
        <Modal
            show={dialogState}
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>

            <Formik
                onSubmit={console.log}
                initialValues={{
                    currentRenameValue: currentName
                }}
            >
                {() => (

                    <Form noValidate>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label>
                                    New Name:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={currentName}
                                    value={currentRenameValue}
                                    onChange={onInput}
                                    isInvalid={!nameValid}
                                />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" onClick={onFormSubmit}>
                                Submit
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
