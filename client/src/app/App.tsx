import { Grid, GridItem } from '@chakra-ui/react'
import * as idb from 'idb-keyval'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import MenuBar from '../common/MenuBar'
import { Setter } from '../common/util/types'
import AnnotationImportDialog from '../features/annotations/AnnotationImportDialog'
import {
    AnnotationsState,
    initializeAnnotations,
    selectAnnotations,
    selectCurrentUserAction,
    selectShowAnnotationImportDialog,
} from '../features/annotations/annotationSlice'
import EnumForm from '../features/annotations/forms/EnumForm'
import RenameForm from '../features/annotations/forms/RenameForm'
import ApiDataImportDialog from '../features/apiData/ApiDataImportDialog'
import { selectShowApiDataImportDialog, toggleIsExpandedInTreeView } from '../features/apiData/apiDataSlice'
import { PythonFilter } from '../features/apiData/model/PythonFilter'
import PythonPackage from '../features/apiData/model/PythonPackage'
import { parsePythonPackageJson, PythonPackageJson } from '../features/apiData/model/PythonPackageBuilder'
import SelectionView from '../features/apiData/selectionView/SelectionView'
import TreeView from '../features/apiData/treeView/TreeView'
import { useAppDispatch, useAppSelector } from './hooks'

const App: React.FC = () => {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(new PythonPackage('empty'))
    const currentUserAction = useAppSelector(selectCurrentUserAction)
    const currentPathName = useLocation().pathname

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getPythonPackageFromIndexedDB(setPythonPackage)
    }, [])

    const annotationStore = useAppSelector(selectAnnotations)

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(initializeAnnotations())
    }, [dispatch])

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        setAnnotationsInIndexedDB(annotationStore)
    }, [annotationStore])

    useEffect(() => {
        const parts = currentPathName.split('/').slice(1)

        for (let i = 2; i < parts.length; i++) {
            dispatch(toggleIsExpandedInTreeView(parts.slice(0, i).join('/')))
        }

        // eslint-disable-next-line
    }, [])

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

async function getPythonPackageFromIndexedDB(setPythonPackage: Setter<PythonPackage>) {
    const storedPackage = (await idb.get('package')) as PythonPackageJson
    if (storedPackage) {
        setPythonPackage(parsePythonPackageJson(storedPackage))
    }
}

async function setAnnotationsInIndexedDB(annotationStore: AnnotationsState) {
    await idb.set('annotations', annotationStore)
}

export default App
