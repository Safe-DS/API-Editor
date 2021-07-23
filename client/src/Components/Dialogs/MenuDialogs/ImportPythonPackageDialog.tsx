import * as idb from 'idb-keyval'
import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import Dropzone from 'react-dropzone'
import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../../../app/hooks'
import { enqueueNotification } from '../../../features/notifications/notificationSlice'
import AnnotationStore from '../../../model/annotation/AnnotationStore'
import PythonPackage from '../../../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../../../model/python/PythonPackageBuilder'
import { Setter } from '../../../util/types'
import { isValidJsonFile } from '../../../util/validation'
import DialogCSS from '../dialogs.module.css'

interface ImportPythonPackageDialogProps {
    isVisible: boolean
    setIsVisible: Setter<boolean>
    setPythonPackage: Setter<PythonPackage>
    setAnnotationStore: Setter<AnnotationStore>
    setFilter: Setter<string>
}

export default function ImportPythonPackageDialog(props: ImportPythonPackageDialogProps): JSX.Element {
    const [fileName, setFileName] = useState('')
    const [newPythonPackage, setNewPythonPackage] = useState<string>()
    const history = useHistory()
    const dispatch = useAppDispatch()

    const close = () => {
        props.setIsVisible(false)
    }

    const submit = async () => {
        props.setIsVisible(false)
        if (newPythonPackage) {
            const parsedPythonPackage = JSON.parse(newPythonPackage) as PythonPackageJson
            props.setPythonPackage(parsePythonPackageJson(parsedPythonPackage))
            props.setFilter('')
            history.push('/')

            try {
                await idb.set('package', parsedPythonPackage)
            } catch (e) {
                dispatch(
                    enqueueNotification({
                        severity: 'error',
                        message: 'Failed to store package in database.',
                    }),
                )
            }
        }
    }

    const slurpAndParse = (acceptedFiles: File[]) => {
        if (isValidJsonFile(acceptedFiles[acceptedFiles.length - 1].name)) {
            if (acceptedFiles.length > 1) {
                acceptedFiles = [acceptedFiles[acceptedFiles.length - 1]]
            }
            setFileName(acceptedFiles[0].name)
            const reader = new FileReader()
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setNewPythonPackage(reader.result)
                    props.setAnnotationStore(new AnnotationStore())
                }
            }
            reader.readAsText(acceptedFiles[0])
        }
    }

    return (
        <Modal onHide={close} show={props.isVisible} size={'lg'} className={DialogCSS.modalDialog}>
            <Modal.Header closeButton>
                <Modal.Title>Import Python package</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Select a Python package to upload.</Form.Label>
                            <div className={DialogCSS.dropzone}>
                                <Dropzone onDrop={slurpAndParse}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section>
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <p className={DialogCSS.dropzoneText}>
                                                    Drag and drop a Python package here, or click to select the file.
                                                    <br />
                                                    (Only *.json will be accepted.)
                                                </p>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </div>
                            {fileName && (
                                <div>
                                    <strong>Imported package name: </strong>
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
