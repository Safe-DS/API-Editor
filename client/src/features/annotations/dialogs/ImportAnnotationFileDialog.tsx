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
    Text,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useAppDispatch } from '../../../app/hooks'
import StyledDropzone from '../../../common/StyledDropzone'
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
        unuseds: {},
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
                        <StyledDropzone onDrop={onDrop}>
                            <Text>Drag and drop an annotation file here or click to select the file.</Text>
                            <Text>(only *.json will be accepted)</Text>
                        </StyledDropzone>

                        {fileName && (
                            <Box>
                                <strong>Imported file: </strong>
                                {fileName}
                            </Box>
                        )}
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={4}>
                        <Button colorScheme="blue" onClick={submit}>
                            Submit
                        </Button>
                        <Button colorScheme="red" onClick={props.close}>
                            Cancel
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
