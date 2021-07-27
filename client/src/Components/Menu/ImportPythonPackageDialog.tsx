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
import * as idb from 'idb-keyval'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useAppDispatch } from '../../app/hooks'
import StyledDropzone from '../../common/StyledDropzone'
import { resetAnnotations } from '../../features/annotations/annotationSlice'
import PythonPackage from '../../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../../model/python/PythonPackageBuilder'
import { Setter } from '../../util/types'
import { isValidJsonFile } from '../../util/validation'

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
        <Modal onClose={props.close} isOpen={props.isVisible} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading>Import Python package</Heading>
                </ModalHeader>
                <ModalBody>
                    <FormControl>
                        <FormLabel>Select a Python package to upload.</FormLabel>
                        <StyledDropzone onDrop={slurpAndParse}>
                            <Text>Drag and drop a Python package here, or click to select the file.</Text>
                            <Text>(Only *.json will be accepted.)</Text>
                        </StyledDropzone>

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
