import React, {FormEvent, useState} from "react";
import "./ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";
import { Formik } from 'formik';

type showDialogState = {
    dialogState: boolean, setDialogState: Setter<boolean>, currentName: string,
    setCurrentName: Setter<string>
}

export default function RenameDialog({
                                         dialogState,
                                         setDialogState,
                                         currentName, //entweder param name oder rename aus annotation
                                         setCurrentName
                                     }: showDialogState): JSX.Element {

    const textValidator = function(value: string) {
        const nameRegex = new RegExp(/^[a-zA-Z]+[A-Za-z0-9\-_]*$/i);
        return !!value.match(nameRegex);
    };

    const [nameValid, setNameValid] = useState(true);//wird sich ändern sobald man tippt. bei submit wird leerer name abgefangen

    const [currentRenameValue, setCurrentRenameValue] = useState("");



    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentRenameValue(event.target.value);
        //Komisch, dass wenn man hier drunter currentRenameValue nutzt immer der vorletzte stand des strings genutzt wird
        setNameValid( textValidator(event.target.value) );
    };

    const resetData = () => {
        setDialogState(false);
        setCurrentRenameValue("");
        setNameValid(true);
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (currentRenameValue && currentRenameValue != currentName && nameValid) {
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
                    currentRenameValue: ''
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
