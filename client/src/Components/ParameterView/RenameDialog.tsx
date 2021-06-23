import React, {FormEvent, useState} from "react";
import "./ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";
//import { Formik } from 'formik';

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

   // const [nameValid, setNameValid] = useState(false);

    const [currentRenameValue, setCurrentRenameValue] = useState("");



    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentRenameValue(event.target.value);
        /*if(textValidator(currentRenameValue)) {
            setNameValid(!nameValid);
        }*/
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (currentRenameValue && currentRenameValue != currentName && textValidator(currentRenameValue)) {
            currentName = currentRenameValue;
            setCurrentName(currentRenameValue);
            setDialogState(false);
            setCurrentRenameValue("");
        } //else {
            //setCurrentRenameValue(currentName);
        //}
    };

    const handleClose = () => {
        setCurrentRenameValue("");
        setDialogState(false);
    };

    return (
        <Modal
            show={dialogState}
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>Add @rename Annotation</Modal.Title>
            </Modal.Header>
                <Form>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>
                                New Name:
                            </Form.Label>
                            <Form.Control onChange={onInput} value={currentRenameValue}
                                          placeholder={currentName} type="text"
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
        </Modal>
    );
}
