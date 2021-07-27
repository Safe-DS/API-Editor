import {
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
import React, { useState } from 'react'
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
        currentUserAction: {
            target: '',
            type: 'none',
        },
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
        <Modal onClose={props.close} isOpen={props.isVisible} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Import annotation file</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>Select an annotation file to upload.</FormLabel>
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
