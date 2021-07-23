import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import Dropzone from 'react-dropzone'
import AnnotationStore, { AnnotationJson } from '../../../model/annotation/AnnotationStore'
import EnumPair from '../../../model/EnumPair'
import PythonEnum from '../../../model/python/PythonEnum'
import { Setter } from '../../../util/types'
import { isValidJsonFile } from '../../../util/validation'
import '../../SelectionView/SelectionView.css'
import DialogCSS from '../dialogs.module.css'

interface ImportAnnotationFileDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
    setAnnotationStore: Setter<AnnotationStore>
}

export default function ImportAnnotationFileDialog(props: ImportAnnotationFileDialogProps): JSX.Element {
    const [fileName, setFileName] = useState('')
    const [newAnnotationStore, setNewAnnotationStore] = useState(new AnnotationStore())

    const close = () => {
        props.setIsVisible(false)
    }

    const submit = () => {
        if (fileName) {
            props.setAnnotationStore(newAnnotationStore)
        }
        props.setIsVisible(false)
    }

    const onDrop = (acceptedFiles: File[]) => {
        if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
            if (acceptedFiles.length > 1) {
                acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]]
            }
            setFileName(acceptedFiles[0].name)
            const reader = new FileReader()
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    const readAnnotationJson = JSON.parse(reader.result) as AnnotationJson

                    readAnnotationJson.renamings = new Map(Object.entries(readAnnotationJson.renamings))

                    const enumEntries: [string, PythonEnum][] = Object.entries(readAnnotationJson.enums)
                    readAnnotationJson.enums = new Map(
                        enumEntries.map(([key, value]) => [
                            key,
                            new PythonEnum(
                                value.enumName,
                                value.enumPairs.map((pair) => new EnumPair(pair.key, pair.value)),
                            ),
                        ]),
                    )

                    setNewAnnotationStore(AnnotationStore.fromJson(readAnnotationJson))
                }
            }
            reader.readAsText(acceptedFiles[0])
        }
    }

    return (
        <Modal onHide={close} show={props.isVisible} size={'lg'} className={DialogCSS.modalDialog}>
            <Modal.Header closeButton>
                <Modal.Title>Import annotation file</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Select an annotation file to upload.</Form.Label>
                            <div className={DialogCSS.dropzone}>
                                <Dropzone onDrop={onDrop}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p className={DialogCSS.dropzoneText}>
                                                    Drag and drop an annotation file here or click to select the file.
                                                    <br />
                                                    (only *.json will be accepted)
                                                </p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            {fileName && (
                                <div>
                                    <strong>Imported file: </strong>
                                    {fileName}
                                </div>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={close}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="button" onClick={submit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    )
}
