import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import Dropzone from 'react-dropzone';
import {Setter} from "../../util/types";
import {isValidJsonFile} from "../../util/validation";
import "../SelectionView/SelectionView.css";
import DialogCSS from "./dialog.module.css";

interface ImportAnnotationFileDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
}

export default function ImportAnnotationFileDialog(props: ImportAnnotationFileDialogProps): JSX.Element {

    const [fileName, setFileName] = useState("");
    /* not yet needed, but important for storing the file later
    const [file, setFile] = useState<File[]>([]); */

    const close = () => {
        props.setIsVisible(false);
    };

    const submit = () => {
        console.log("TODO");
    };

    return (
        <Modal
            onHide={close}
            show={props.isVisible}
            size={"lg"}
            className={DialogCSS.modalDialog}
        >
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
                                <Dropzone onDrop={acceptedFiles => {
                                    if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
                                        if (acceptedFiles.length > 1) {
                                            acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]];
                                        }
                                        setFileName(acceptedFiles[0].name);
                                        /* not yet needed, but important for storing the file later
                                        setFile([acceptedFiles[0]]);*/
                                    }
                                }}>
                                    {({getRootProps, getInputProps}) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p className={DialogCSS.dropzoneText}>Drag and drop an annotation files
                                                    here, or click to select the
                                                    file<br/>(only *.json will be accepted)</p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            {fileName && <div><strong>Imported file: </strong>{fileName}</div>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={close}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="button" onSubmit={submit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
