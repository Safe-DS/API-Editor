import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import Dropzone from 'react-dropzone'
import { useAppDispatch } from '../../../app/hooks'
import DialogCSS from '../../../Components/Dialogs/dialogs.module.css'
import { isValidJsonFile } from '../../../util/validation'
import { AnnotationsState, setAnnotations } from '../annotationSlice'

interface ImportAnnotationFileDialogProps {
    isVisible: boolean
    close: () => void
}

export default function ImportAnnotationFileDialog(props: ImportAnnotationFileDialogProps): JSX.Element {
    const [fileName, setFileName] = useState('')
    const [newAnnotationStore, setNewAnnotationStore] = useState<AnnotationsState>({
        enums: {},
        renamings: {},
    })
    const dispatch = useAppDispatch()

    const submit = () => {
        if (fileName) {
            dispatch(setAnnotations(newAnnotationStore))
        }
        props.close()
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
                    const readAnnotationJson = JSON.parse(reader.result) as AnnotationsState
                    setNewAnnotationStore(readAnnotationJson)
                }
            }
            reader.readAsText(acceptedFiles[0])
        }
    }

    return (
        <Modal onHide={props.close} show={props.isVisible} size={'lg'} className={DialogCSS.modalDialog}>
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
                        <Button variant="danger" onClick={props.close}>
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
