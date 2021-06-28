import React, {FormEvent, useState} from "react";
import "../ParameterView.css";
import {Button, Container, Form, Modal, Col, Row} from "react-bootstrap";
import {Formik} from 'formik';
import {enumValueValidation, nameValidation} from "../../../util/validation";
import EnumPair from "../../../model/EnumPair";
import EnumPairRow from "./EnumPairRow";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faTrash} from "@fortawesome/free-solid-svg-icons";

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
    const [name, setName] = useState("");
    const [enumValueValid, setEnumValueValid] = useState(true);
    const [enumValue, setEnumValue] = useState("");
    const [enumInstanceNameValid, setEnumInstanceNameValid] = useState(true);
    const [enumInstanceName, setEnumInstanceName] = useState("");

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setNameValid(nameValidation(event.target.value));
    };

    const onInputEnumInstanceName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnumInstanceName(event.target.value);
        setEnumInstanceNameValid(nameValidation(event.target.value));
    };

    const onInputEnumValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEnumValue(event.target.value);
        setEnumValueValid(enumValueValidation(event.target.value));
    };

    const pair1 = new EnumPair("hello", "world1");
    const pair2 = new EnumPair("hello", "world2");
    const pair3 = new EnumPair("hello", "world3");
    const listOfEnumPairs = [pair1, pair2, pair3];
    const listOfEnumPairs2: EnumPair[] = [];
    const listItems = listOfEnumPairs.map((pair, index) =>
        <EnumPairRow pair={pair} key={String(index)}/>);


    const resetData = () => {
        setDialogState(false);

        setName("");
        setNameValid(true);

        setEnumValue("");
        setNameValid(true);

        setEnumInstanceName("");
        setEnumInstanceNameValid(true);

        setEnumInstanceName("");
        setEnumInstanceNameValid(true);
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (enumValue && enumValue != currentName && nameValid) {
            currentName = enumValue;
            setCurrentName(enumValue);
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
            size="lg"
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
                                    value={name}
                                    onChange={onInput}
                                    isInvalid={!nameValid}
                                />
                                <Container>
                                    <Row className="enum-pair-row">
                                        <Col xs={5} className="no-left-padding">String/Value:</Col>
                                        <Col xs={5} className="right">Name of enum:</Col>
                                        <Col xs={2} className="delete-enum-item-icon"><FontAwesomeIcon icon={faPlus}/></Col>
                                    </Row>
                                    <Row className="enum-pair-row">
                                        <Col xs={5} className="no-left-padding">
                                            <Form.Control
                                                type="text"
                                                placeholder="Parameter String/Value"//{currentName}
                                                value={enumValue}
                                                onChange={onInputEnumValue}
                                                isInvalid={!enumValueValid}
                                            />
                                        </Col>
                                        <Col xs={5} className="no-right-padding">
                                            <Form.Control
                                                type="text"
                                                placeholder="Enum Name"//{currentName}
                                                value={enumInstanceName}
                                                onChange={onInputEnumInstanceName}
                                                isInvalid={!enumInstanceNameValid}
                                            />
                                        </Col>
                                        <Col xs={2} className="delete-enum-item-icon"><FontAwesomeIcon icon={faTrash}/></Col>
                                    </Row>
                                    {listItems.length > 0 && listItems}
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
