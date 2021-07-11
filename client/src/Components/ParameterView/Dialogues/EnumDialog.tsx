import React, {FormEvent, useState} from "react";
import "../ParameterView.css";
import {Button, Form, Modal} from "react-bootstrap";
import {Formik} from 'formik';
import {isValidPythonIdentifier} from "../../../util/validation";
import EnumPair from "../../../model/EnumPair";
import EnumHandle from "./EnumHandle";
import {Setter} from "../../../util/types";


type showDialogState = {
    dialogState: boolean, setDialogState: Setter<boolean>, currentName: string,
    setCurrentName: Setter<string>, enumList: EnumPair[]
}

export default function EnumDialog({
                                       dialogState,
                                       setDialogState,
                                       currentName,
                                       setCurrentName,
                                       enumList
                                   }: showDialogState): JSX.Element {

    const [nameValid, setNameValid] = useState(true);
    const [name, setName] = useState(currentName);

    const initialList: EnumPair[] = [];

    const deepCloneOrEmpty = (from: EnumPair[],to: EnumPair[] ) => {
        if(from.length > 0){
            from.forEach(function(value){
                to.push(new EnumPair(value.key, value.value));
            });
        }
        else{
            to.push(new EnumPair("", ""));
        }
    };

    deepCloneOrEmpty(enumList, initialList);
    const [listOfEnumPairs, setListOfEnumPairs] = useState<EnumPair[]>(initialList);

    

    const resetData = () => {
        setDialogState(false);
        setName(currentName);
        setNameValid(true);

        initialList.splice(0, initialList.length);
        deepCloneOrEmpty(enumList, initialList);
        setListOfEnumPairs(initialList);
    };

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setNameValid(isValidPythonIdentifier(event.target.value));
    };

    //ToDo check if all enum inputs are valid
    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        let validInputInstances = true;

        listOfEnumPairs.forEach(function(value){
            if(value.key.length < 1 || value.value.length < 1 || !value.isValidValue() || !value.isValidKey() ){
                validInputInstances = false;
            }
        });

        if (name && nameValid && validInputInstances) {//&& name != currentName
            setCurrentName(name);
            enumList.splice(0, enumList.length);
            deepCloneOrEmpty(listOfEnumPairs, enumList);
            //setEnumList(listOfEnumPairs);
            setDialogState(false);
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
