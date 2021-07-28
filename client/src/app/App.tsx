import { Grid, GridItem } from '@chakra-ui/react'
import * as idb from 'idb-keyval'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import MenuBar from '../Components/Menu/MenuBar'
import SelectionView from '../Components/SelectionView/SelectionView'
import TreeView from '../Components/TreeView/TreeView'
import AnnotationImportDialog from '../features/annotations/AnnotationImportDialog'
import {
    initializeAnnotations,
    selectCurrentUserAction,
    selectShowAnnotationImportDialog,
} from '../features/annotations/annotationSlice'
import EnumForm from '../features/annotations/forms/EnumForm'
import RenameForm from '../features/annotations/forms/RenameForm'
import ApiDataImportDialog from '../features/apiData/ApiDataImportDialog'
import { selectShowApiDataImportDialog } from '../features/apiData/apiDataSlice'
import { PythonFilter } from '../model/python/PythonFilter'
import PythonPackage from '../model/python/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../model/python/PythonPackageBuilder'
import { useAppDispatch, useAppSelector } from './hooks'

const App: React.FC = () => {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(new PythonPackage('empty'))
    const currentUserAction = useAppSelector(selectCurrentUserAction)
    const history = useHistory()
    // const [treeView]

    useEffect(() => {
        const getPythonPackageFromIndexedDB = async () => {
            const storedPackage = (await idb.get('package')) as PythonPackageJson
            if (storedPackage) {
                setPythonPackage(parsePythonPackageJson(storedPackage))
            }
        }

        getPythonPackageFromIndexedDB()
    }, [])

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

    const userActionTarget = pythonPackage.getByRelativePathAsString(currentUserAction.target)

    const showApiDataImportDialog = useAppSelector(selectShowApiDataImportDialog)
    const showAnnotationImportDialog = useAppSelector(selectShowAnnotationImportDialog)

    return (
        <Grid
            autoColumns="0fr 1fr"
            autoRows="0fr 1fr"
            templateAreas='"menu menu" "leftPane rightPane"'
            w="100vw"
            h="100vh"
        >
            <GridItem gridArea="menu" colSpan={2}>
                <MenuBar setPythonPackage={setPythonPackage} filter={filter} setFilter={setFilter} />
            </GridItem>
            <GridItem
                gridArea="leftPane"
                overflow="auto"
                minW="20vw"
                w="40vw"
                maxW="80vw"
                borderRight={1}
                layerStyle="subtleBorder"
                resize="horizontal"
            >
                {currentUserAction.type === 'none' && <TreeView pythonPackage={filteredPythonPackage} />}
                {currentUserAction.type === 'enum' && <EnumForm target={userActionTarget || pythonPackage} />}
                {currentUserAction.type === 'rename' && <RenameForm target={userActionTarget || pythonPackage} />}
            </GridItem>
            <GridItem gridArea="rightPane" overflow="auto">
                <SelectionView pythonPackage={pythonPackage} />
            </GridItem>

            {showAnnotationImportDialog && <AnnotationImportDialog />}
            {showApiDataImportDialog && (
                <ApiDataImportDialog setPythonPackage={setPythonPackage} setFilter={setFilter} />
            )}
        </Grid>
    )
}

export default App
