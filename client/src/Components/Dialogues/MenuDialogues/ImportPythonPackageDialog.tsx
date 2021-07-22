import React, {FormEvent, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {Setter} from "../../../util/types";
import {useHistory} from "react-router-dom";
import "../../SelectionView/SelectionView.css";
import Dropzone from 'react-dropzone';
import {isValidJsonFile} from "../../../util/validation";
import DialogCSS from "../dialog.module.css";
import PythonPackage from "../../../model/python/PythonPackage";
import {parsePythonPackageJson} from "../../../model/python/PythonPackageBuilder";
import AnnotationStore from "../../../model/annotation/AnnotationStore";

interface ImportPythonPackageDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>,
    setPythonPackage: Setter<PythonPackage>
    setAnnotationStore: Setter<AnnotationStore>
}

export default function ImportPythonPackageDialog(props: ImportPythonPackageDialogProps): JSX.Element {

    const [fileName, setFileName] = useState("");
    const [newPythonPackage, setNewPythonPackage] = useState<PythonPackage>();
    const history = useHistory();

    const close = () => {
        props.setIsVisible(false);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        props.setIsVisible(false);
        if (newPythonPackage) {
            props.setPythonPackage(newPythonPackage);
            history.push("/");
        }
    };

    const slurpAndParse = (acceptedFiles: File[]) => {
        if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
            if (acceptedFiles.length > 1) {
                acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]];
            }
            setFileName(acceptedFiles[0].name);
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setNewPythonPackage(parsePythonPackageJson(JSON.parse(reader.result)));
                    props.setAnnotationStore(new AnnotationStore());
                }
            };
            reader.readAsText(acceptedFiles[0]);
        }
    };

    return (
        <Modal onHide={close}
               show={props.isVisible}
               size={"lg"}
               className={DialogCSS.modalDialog}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Import Python package
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>
                                Select a Python package to upload.
                            </Form.Label>
                            <div className={DialogCSS.dropzone}>
                                <Dropzone onDrop={slurpAndParse}>
                                    {({getRootProps, getInputProps}) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p className={DialogCSS.dropzoneText}>
                                                    Drag and drop a Python package here, or click to select the
                                                    file.<br/>
                                                    (Only *.json will be accepted.)
                                                </p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            {fileName && <div><strong>Imported package name: </strong>{fileName}</div>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={close}>
                            Cancel
                        </Button>
                        <Button variant="primary"
                                type="submit"
                                onClick={submit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
