import React, {FormEvent, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./ParameterView.css";
import {Button, Container, Form, Modal, Row, Col} from "react-bootstrap";
import {Formik} from 'formik';
import {nameValidation} from "../../util/validation";
import EnumPair from "../../model/EnumPair";
import {faTrash} from "@fortawesome/free-solid-svg-icons";

type showDialogState = {
    dialogState: boolean, setDialogState: Setter<boolean>, currentName: string,
    setCurrentName: Setter<string>, enumList: EnumPair[], setEnumList: Setter<EnumPair[]>
}

export default function EnumDialog({
                                         dialogState,
                                         setDialogState,
                                         currentName,
                                         setCurrentName,
                                         setEnumList,
                                         enumList
                                     }: showDialogState): JSX.Element {

    const [nameValid, setNameValid] = useState(true);
    const [currentRenameValue, setCurrentRenameValue] = useState("");

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentRenameValue(event.target.value);
        setNameValid(nameValidation(event.target.value));
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
                <Modal.Title>Add @enum Annotation</Modal.Title>
            </Modal.Header>

            <Formik
                onSubmit={console.log}
                initialValues={{
                    currentEnumNameValue: ''
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
                                <br/>
                                <Container>
                                    <Row>
                                        <Col xs={5} className="no-left-padding">
                                            <Form.Control type="text" placeholder="text1">

                                            </Form.Control>
                                        </Col>
                                        <Col xs={5} className="no-right-padding">
                                            <Form.Control type="text" placeholder="text1">

                                            </Form.Control>
                                        </Col>
                                        <Col xs={2} className="delete-enum-item-icon">
                                            <FontAwesomeIcon
                                                className="indicator visibility-indicator"
                                                icon={faTrash}
                                            />
                                        </Col>
                                    </Row>
                                </Container>
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
