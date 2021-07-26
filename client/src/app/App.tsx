import { Grid, GridItem, useBoolean } from '@chakra-ui/react'
import * as idb from 'idb-keyval'
import React, { useEffect, useState } from 'react'
import ImportPythonPackageDialog from '../Components/Dialogs/MenuDialogs/ImportPythonPackageDialog'
import MenuBar from '../Components/Menu/MenuBar'
import SelectionView from '../Components/SelectionView/SelectionView'
import TreeView from '../Components/TreeView/TreeView'
import { initializeAnnotations } from '../features/annotations/annotationSlice'
import ImportAnnotationFileDialog from '../features/annotations/dialogs/ImportAnnotationFileDialog'
import { PythonFilter } from '../model/python/PythonFilter'
import PythonPackage from '../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../model/python/PythonPackageBuilder'
import { useAppDispatch, useAppSelector } from './hooks'

export default function App(): JSX.Element {
    const [showImportAnnotationFileDialog, setShowImportAnnotationFileDialog] = useBoolean(false)
    const [showImportPythonPackageDialog, setShowImportPythonPackageDialog] = useBoolean(false)
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(new PythonPackage('empty'))

    useEffect(() => {
        const getPythonPackageFromIndexedDB = async () => {
            const storedPackage = (await idb.get('package')) as PythonPackageJson
            if (storedPackage) {
                setPythonPackage(parsePythonPackageJson(storedPackage))
            }
        }

        getPythonPackageFromIndexedDB()
    })

    const annotationStore = useAppSelector((state) => state.annotations)

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(initializeAnnotations())
    }, [dispatch])

    useEffect(() => {
        const setAnnotationsInIndexedDB = async () => {
            await idb.set('annotations', annotationStore)
        }

        setAnnotationsInIndexedDB()
    }, [annotationStore])

    const [filter, setFilter] = useState('')
    const pythonFilter = PythonFilter.fromFilterBoxInput(filter)
    const filteredPythonPackage = pythonPackage.filter(pythonFilter)

    return (
        <Grid
            autoColumns="0fr 1fr"
            autoRows="0fr 1fr"
            templateAreas='"menu menu" "leftPane rightPane"'
            w="100vw"
            h="100vh"
        >
            <GridItem gridArea="menu" colSpan={2}>
                <MenuBar
                    setPythonPackage={setPythonPackage}
                    filter={filter}
                    setFilter={setFilter}
                    openImportAnnotationFileDialog={setShowImportAnnotationFileDialog.on}
                    openImportPythonPackageDialog={setShowImportPythonPackageDialog.on}
                />
            </GridItem>
            <GridItem
                gridArea="leftPane"
                overflow="auto"
                minW="20vw"
                maxW="80vw"
                borderRight={1}
                layerStyle="subtleBorder"
                resize="horizontal"
            >
                <TreeView pythonPackage={filteredPythonPackage} />
            </GridItem>
            <GridItem gridArea="rightPane" overflow="auto">
                <SelectionView pythonPackage={pythonPackage} />
            </GridItem>

            {showImportAnnotationFileDialog && (
                <ImportAnnotationFileDialog
                    isVisible={showImportAnnotationFileDialog}
                    close={setShowImportAnnotationFileDialog.off}
                />
            )}
            {showImportPythonPackageDialog && (
                <ImportPythonPackageDialog
                    isVisible={showImportPythonPackageDialog}
                    close={setShowImportPythonPackageDialog.off}
                    setPythonPackage={setPythonPackage}
                    setFilter={setFilter}
                />
            )}
        </Grid>
    )
}
