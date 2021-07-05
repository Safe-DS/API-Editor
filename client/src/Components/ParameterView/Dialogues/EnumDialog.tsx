import React, {FormEvent, useState} from "react";
import "../ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";
import {Formik} from 'formik';
import {nameValidation} from "../../../util/validation";
import EnumPair from "../../../model/EnumPair";
import EnumHandle from "./EnumHandle";


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

    const rowIfEmpty = new EnumPair("", "");
    //Test Data
    const pair1 = new EnumPair("hello1", "world1");
    const pair2 = new EnumPair("hello2", "world2");
    const pair3 = new EnumPair("hello3", "world3");

    let initialList: EnumPair[] = [rowIfEmpty];

    if(enumList.length > 0){
        initialList = enumList;
    }


    const [listOfEnumPairs, setListOfEnumPairs] = useState<EnumPair[]>(initialList);//[pair1, pair2, pair3]

    //End of Test Data

    //instead of TestData:
    //const listOfEnumPairs = enumList;

    const [nameValid, setNameValid] = useState(true);
    const [name, setName] = useState(currentName);


    const resetData = () => {
        setDialogState(false);

        setName(currentName);
        setNameValid(true);
        setListOfEnumPairs(enumList);
    };

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setNameValid(nameValidation(event.target.value));
    };

    //ToDo check if all enum inputs are valid
    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        let validInputInstances = true;

        listOfEnumPairs.forEach(function(value){
            if(!value.validValue || !value.validKey || value.key.length < 1 || value.value.length < 1){
                validInputInstances = false;
                value.validValue = false;
                value.validKey = false;
            }
        });

        if (name && nameValid && validInputInstances) {//&& name != currentName
            console.log(name);
            setCurrentName(name);
            setEnumList(listOfEnumPairs);
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
                                    Enum Annotation Name:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    //placeholder={currentName}
                                    value={name}
                                    onChange={onInput}
                                    isInvalid={!nameValid}
                                />
                                <EnumHandle listOfEnumPairs={listOfEnumPairs} setListOfEnumPairs={setListOfEnumPairs}/>

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
