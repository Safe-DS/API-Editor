import {
    Grid,
    GridItem,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    UnorderedList,
} from '@chakra-ui/react';
import * as idb from 'idb-keyval';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import MenuBar from '../common/MenuBar';
import { Setter } from '../common/util/types';
import { AnnotationImportDialog } from '../features/annotations/AnnotationImportDialog';
import {
    AnnotationsState,
    GroupUserAction,
    initializeAnnotations,
    selectAnnotations,
    selectCurrentUserAction,
    selectShowAnnotationImportDialog,
} from '../features/annotations/annotationSlice';
import { BoundaryForm } from '../features/annotations/forms/BoundaryForm';
import { CalledAfterForm } from '../features/annotations/forms/CalledAfterForm';
import { ConstantForm } from '../features/annotations/forms/ConstantForm';
import { EnumForm } from '../features/annotations/forms/EnumForm';
import { GroupForm } from '../features/annotations/forms/GroupForm';
import { MoveForm } from '../features/annotations/forms/MoveForm';
import { OptionalForm } from '../features/annotations/forms/OptionalForm';
import { RenameForm } from '../features/annotations/forms/RenameForm';
import PythonPackage from '../features/packageData/model/PythonPackage';
import { parsePythonPackageJson, PythonPackageJson } from '../features/packageData/model/PythonPackageBuilder';
import { PackageDataImportDialog } from '../features/packageData/PackageDataImportDialog';
import {
    selectShowPackageDataImportDialog,
    toggleIsExpandedInTreeView,
} from '../features/packageData/packageDataSlice';
import { SelectionView } from '../features/packageData/selectionView/SelectionView';
import { TreeView } from '../features/packageData/treeView/TreeView';
import { useAppDispatch, useAppSelector } from './hooks';
import PythonFunction from '../features/packageData/model/PythonFunction';
import { AttributeForm } from '../features/annotations/forms/AttributeForm';
import { UsageCountJson, UsageCountStore } from '../features/usages/model/UsageCountStore';
import { selectShowUsageImportDialog } from '../features/usages/usageSlice';
import { UsageImportDialog } from '../features/usages/UsageImportDialog';
import { createFilterFromString } from '../features/packageData/model/filters/filterFactory';

export const App: React.FC = function () {
    const dispatch = useAppDispatch();
    const currentUserAction = useAppSelector(selectCurrentUserAction);
    const currentPathName = useLocation().pathname;

    // Initialize package data
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(new PythonPackage('empty', 'empty', '0.0.1'));

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getPythonPackageFromIndexedDB(setPythonPackage);
    }, []);

    // Initialize usages
    const [usages, setUsages] = useState<UsageCountStore>(new UsageCountStore());

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getUsagesFromIndexedDB(setUsages);
    }, []);

    // Initialize annotations
    const annotationStore = useAppSelector(selectAnnotations);

    useEffect(() => {
        dispatch(initializeAnnotations());
    }, [dispatch]);

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        setAnnotationsInIndexedDB(annotationStore);
    }, [annotationStore]);

    useEffect(() => {
        const parts = currentPathName.split('/').slice(1);

        for (let i = 2; i < parts.length; i++) {
            dispatch(toggleIsExpandedInTreeView(parts.slice(0, i).join('/')));
        }

        // eslint-disable-next-line
    }, []);

    const [filter, setFilter] = useState('is:public');
    const pythonFilter = createFilterFromString(filter);
    const filteredPythonPackage = pythonFilter.applyToPackage(pythonPackage, useAppSelector(selectAnnotations), usages);

    const userActionTarget = pythonPackage.getByRelativePathAsString(currentUserAction.target);

    const showAnnotationImportDialog = useAppSelector(selectShowAnnotationImportDialog);
    const showPackageDataImportDialog = useAppSelector(selectShowPackageDataImportDialog);
    const showUsagesImportDialog = useAppSelector(selectShowUsageImportDialog);

    const [showInferErrorDialog, setShowInferErrorDialog] = useState(false);
    const [inferErrors, setInferErrors] = useState<string[]>([]);
    const displayInferErrors = (errors: string[]) => {
        setInferErrors(errors);
        setShowInferErrorDialog(true);
    };

    return (
        <>
            <Grid
                autoColumns="0fr 1fr"
                autoRows="0fr 1fr"
                templateAreas='"menu menu" "leftPane rightPane"'
                w="100vw"
                h="100vh"
            >
                <GridItem gridArea="menu" colSpan={2}>
                    <MenuBar
                        pythonPackage={pythonPackage}
                        filter={filter}
                        setFilter={setFilter}
                        displayInferErrors={displayInferErrors}
                    />
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
                    {currentUserAction.type === 'attribute' && (
                        <AttributeForm target={userActionTarget || pythonPackage} />
                    )}
                    {currentUserAction.type === 'boundary' && (
                        <BoundaryForm target={userActionTarget || pythonPackage} />
                    )}
                    {currentUserAction.type === 'calledAfter' && userActionTarget instanceof PythonFunction && (
                        <CalledAfterForm target={userActionTarget} />
                    )}
                    {currentUserAction.type === 'constant' && (
                        <ConstantForm target={userActionTarget || pythonPackage} />
                    )}
                    {currentUserAction.type === 'enum' && <EnumForm target={userActionTarget || pythonPackage} />}
                    {currentUserAction.type === 'group' && (
                        <GroupForm
                            target={userActionTarget || pythonPackage}
                            groupName={
                                (currentUserAction as GroupUserAction)?.groupName
                                    ? (currentUserAction as GroupUserAction)?.groupName
                                    : ''
                            }
                        />
                    )}
                    {currentUserAction.type === 'move' && <MoveForm target={userActionTarget || pythonPackage} />}
                    {currentUserAction.type === 'none' && (
                        <TreeView pythonPackage={filteredPythonPackage} filter={pythonFilter} usages={usages} />
                    )}
                    {currentUserAction.type === 'optional' && (
                        <OptionalForm target={userActionTarget || pythonPackage} />
                    )}
                    {currentUserAction.type === 'rename' && <RenameForm target={userActionTarget || pythonPackage} />}
                </GridItem>
                <GridItem gridArea="rightPane" overflow="auto">
                    <SelectionView pythonPackage={pythonPackage} pythonFilter={pythonFilter} usages={usages} />
                </GridItem>

                {showAnnotationImportDialog && <AnnotationImportDialog />}
                {showPackageDataImportDialog && (
                    <PackageDataImportDialog setPythonPackage={setPythonPackage} setFilter={setFilter} />
                )}
                {showUsagesImportDialog && <UsageImportDialog setUsages={setUsages} />}
            </Grid>
            <Modal
                isOpen={showInferErrorDialog}
                onClose={() => setShowInferErrorDialog(false)}
                scrollBehavior="inside"
                size="xl"
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Infer errors</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody paddingLeft={10} paddingBottom={6}>
                        <UnorderedList spacing={5}>
                            {inferErrors.map((error, index) => (
                                <ListItem key={error + index}>{error}</ListItem>
                            ))}
                        </UnorderedList>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

const getPythonPackageFromIndexedDB = async function (setPythonPackage: Setter<PythonPackage>) {
    const storedPackage = (await idb.get('package')) as PythonPackageJson;
    if (storedPackage) {
        setPythonPackage(parsePythonPackageJson(storedPackage));
    }
};

const getUsagesFromIndexedDB = async function (setUsages: Setter<UsageCountStore>) {
    const storedUsages = (await idb.get('usages')) as UsageCountJson;
    if (storedUsages) {
        setUsages(UsageCountStore.fromJson(storedUsages));
    }
};

const setAnnotationsInIndexedDB = async function (annotationStore: AnnotationsState) {
    await idb.set('annotations', annotationStore);
};
