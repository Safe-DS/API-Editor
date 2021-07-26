import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from '@chakra-ui/react'
import * as idb from 'idb-keyval'
import React, { useState } from 'react'
import Dropzone from 'react-dropzone'
import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../../../app/hooks'
import { resetAnnotations } from '../../../features/annotations/annotationSlice'
import PythonPackage from '../../../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../../../model/python/PythonPackageBuilder'
import { Setter } from '../../../util/types'
import { isValidJsonFile } from '../../../util/validation'
import DialogCSS from '../dialogs.module.css'

interface ImportPythonPackageDialogProps {
    isVisible: boolean
    close: () => void
    setPythonPackage: Setter<PythonPackage>
    setFilter: Setter<string>
}

export default function ImportPythonPackageDialog(props: ImportPythonPackageDialogProps): JSX.Element {
    const [fileName, setFileName] = useState('')
    const [newPythonPackage, setNewPythonPackage] = useState<string>()
    const history = useHistory()
    const dispatch = useAppDispatch()

    const submit = async () => {
        props.close()
        if (newPythonPackage) {
            const parsedPythonPackage = JSON.parse(newPythonPackage) as PythonPackageJson
            props.setPythonPackage(parsePythonPackageJson(parsedPythonPackage))
            props.setFilter('')
            history.push('/')

            await idb.set('package', parsedPythonPackage)
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
                    dispatch(resetAnnotations())
                }
            }
            reader.readAsText(acceptedFiles[0])
        }
    }

    return (
        <Modal onClose={props.close} isOpen={props.isVisible} size={'lg'}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Import Python package</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>Select a Python package to upload.</FormLabel>
                        <Box className={DialogCSS.dropzone}>
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
                        </Box>
                        {fileName && (
                            <Box>
                                <strong>Imported package name: </strong>
                                {fileName}
                            </Box>
                        )}
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button colorScheme="red" onClick={props.close}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={submit}>
                            Submit
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
