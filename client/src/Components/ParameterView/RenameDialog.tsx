import React, {FormEvent, useState} from "react";
import "./ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";

type showDialogState = {
    handleState: boolean, setDialogState: Setter<boolean>, currentRename: string,
    setRenameName: Setter<string>
}

export default function RenameDialog({
                                         handleState,
                                         setDialogState,
                                         currentRename,
                                         setRenameName
                                     }: showDialogState): JSX.Element {

    const [value, setValue] = useState(currentRename);

    const textValidator = function(value: string) {
        const nameRegex = new RegExp(/^[a-zA-Z]+[A-Za-z0-9\-_]*$/i);
        return !!value.match(nameRegex);
    };

    const [nameValid, setNameValid] = useState(false);

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
        if(textValidator(value)) {
            setNameValid(!nameValid);
        }
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value && textValidator(value)) {
            currentRename = value;
            setRenameName(value);
            setDialogState(false);
        } else {
            setValue(currentRename);
        }
    };

    const handleClose = () => {
        setValue(currentRename);
        setDialogState(false);
    };

    return (
        <Modal
            show={handleState}
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
                        <Form.Control onChange={onInput} value={value}
                                      placeholder={currentRename} type="text"
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
