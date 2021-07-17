import classNames from "classnames";
import {Formik} from 'formik';
import React, {FormEvent, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import EnumPair from "../../../model/EnumPair";
import PythonEnum from "../../../model/python/PythonEnum";
import {Nullable, Setter} from "../../../util/types";
import {isValidPythonIdentifier} from "../../../util/validation";
import DialogCSS from "../../Dialog/dialog.module.css";
import EnumHandle from "./EnumHandle";


type showDialogState = {
    dialogState: boolean, setDialogState: Setter<boolean>,
    enumDefinition: Nullable<PythonEnum>, setEnumDefinition: Setter<Nullable<PythonEnum>>
}

export default function EnumDialog({
                                       dialogState,
                                       setDialogState,
                                       enumDefinition,
                                       setEnumDefinition
                                   }: showDialogState): JSX.Element {

    const [nameValid, setNameValid] = useState(true);
    const [name, setName] = useState(enumDefinition?.enumName ? enumDefinition?.enumName : "");

    const deepCloneOrEmpty = (from: EnumPair[], to: EnumPair[]) => {
        if (from.length > 0) {
            from.forEach(function (value) {
                to.push(new EnumPair(value.key, value.value));
            });
        } else {
            to.push(new EnumPair("", ""));
        }
    };

    const initialList: EnumPair[] = [];//new EnumPair("","")

    if (enumDefinition?.enumPairs) {
        deepCloneOrEmpty(enumDefinition?.enumPairs, initialList);
    } else {
        initialList.push(new EnumPair("", ""));
    }

    const [listOfEnumPairs, setListOfEnumPairs] = useState<EnumPair[]>(initialList);

    const resetData = () => {
        setDialogState(false);
        setName(enumDefinition?.enumName ? enumDefinition?.enumName : "");
        setNameValid(true);
        initialList.splice(0, initialList.length);
        initialList.push(new EnumPair("", ""));

        setListOfEnumPairs(initialList);
    };

    const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setNameValid(isValidPythonIdentifier(event.target.value));
    };

    const onFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        let validInputInstances = true;

        listOfEnumPairs.forEach(function (value) {
            if (value.key.length < 1 || value.value.length < 1 || !value.isValidValue() || !value.isValidKey()) {
                validInputInstances = false;
            }
        });

        if (name && nameValid && validInputInstances) {//&& name != currentName
            setEnumDefinition(new PythonEnum(name, listOfEnumPairs));
            //reset below
            setDialogState(false);
            initialList.splice(0, initialList.length);
            initialList.push(new EnumPair("", ""));
            setListOfEnumPairs(initialList);
        }
    };

    const handleClose = () => {
        resetData();
    };

    const cssClasses = classNames(DialogCSS.modalDialog, DialogCSS.annotationDialog);

    return (
        <Modal
            show={dialogState}
            onHide={handleClose}
            className={cssClasses}
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
                                    Enum name:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={onInput}
                                    isInvalid={!nameValid}
                                />
                                <EnumHandle listOfEnumPairs={listOfEnumPairs} setListOfEnumPairs={setListOfEnumPairs}/>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleClose}>
                                Cancel
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
