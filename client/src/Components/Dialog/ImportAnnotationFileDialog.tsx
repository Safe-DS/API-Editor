import React, {FormEvent, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {Setter} from "../../util/types";
import "../SelectionView/SelectionView.css";
import Dropzone from 'react-dropzone';
import {isValidJsonFile} from "../../util/validation";
import DialogCSS from "./dialog.module.css";
import AnnotationStore from "../../model/annotation/AnnotationStore";

interface ImportAnnotationFileDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
    setAnnotationStore: Setter<AnnotationStore>
}

export default function ImportAnnotationFileDialog(props: ImportAnnotationFileDialogProps): JSX.Element {

    const [fileName, setFileName] = useState("");

    const close = () => {
        props.setIsVisible(false);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        props.setIsVisible(false);
    };

    const onDrop = (acceptedFiles: File[]) => {
        if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
            if (acceptedFiles.length > 1) {
                acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]];
            }
            setFileName(acceptedFiles[0].name);
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const readAnnotationJson = JSON.parse(reader.result);
                    readAnnotationJson["renamings"] = new Map(Object.entries(readAnnotationJson["renamings"]));
                    readAnnotationJson["enums"] = new Map(Object.entries(readAnnotationJson["enums"]));
                    const result = AnnotationStore.fromJson(readAnnotationJson);
                    props.setAnnotationStore(result);
                }
            };
        }
    };

    return (
        <Modal onHide={close}
               show={props.isVisible}
               size={"lg"}
               className={DialogCSS.modalDialog}>
            <Modal.Header closeButton>
                <Modal.Title>Import annotation file</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>
                                Select an annotation file to upload.
                            </Form.Label>
                            <div className={DialogCSS.dropzone}>
                                <Dropzone onDrop={onDrop}>
                                    {({getRootProps, getInputProps}) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()}/>
                                                <p className={DialogCSS.dropzoneText}>
                                                    Drag and drop an annotation file here or click to select the
                                                    file.<br/>
                                                    (only *.json will be accepted)
                                                </p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            {fileName && <div><strong>Imported file: </strong>{fileName}</div>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                                onClick={close}>
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
