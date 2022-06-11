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
import React, {useEffect, useState} from 'react';
import {MenuBar} from '../common/MenuBar';
import {AnnotationImportDialog} from '../features/annotations/AnnotationImportDialog';
import {
    initializeAnnotations,
    persistAnnotations,
    selectAnnotations
} from '../features/annotations/annotationSlice';
import {BoundaryForm} from '../features/annotations/forms/BoundaryForm';
import {CalledAfterForm} from '../features/annotations/forms/CalledAfterForm';
import {ConstantForm} from '../features/annotations/forms/ConstantForm';
import {EnumForm} from '../features/annotations/forms/EnumForm';
import {GroupForm} from '../features/annotations/forms/GroupForm';
import {MoveForm} from '../features/annotations/forms/MoveForm';
import {OptionalForm} from '../features/annotations/forms/OptionalForm';
import {RenameForm} from '../features/annotations/forms/RenameForm';
import {PackageDataImportDialog} from '../features/packageData/PackageDataImportDialog';
import {SelectionView} from '../features/packageData/selectionView/SelectionView';
import {TreeView} from '../features/packageData/treeView/TreeView';
import {useAppDispatch, useAppSelector} from './hooks';
import PythonFunction from '../features/packageData/model/PythonFunction';
import {AttributeForm} from '../features/annotations/forms/AttributeForm';
import {UsageImportDialog} from '../features/usages/UsageImportDialog';
import {
    BatchMode,
    GroupUserAction,
    initializeUI,
    persistUI, selectBatchMode,
    selectCurrentUserAction,
    selectFilter,
    selectShowAnnotationImportDialog,
    selectShowAPIImportDialog,
    selectShowUsageImportDialog,
    selectUI,
    setFilterString,
} from '../features/ui/uiSlice';
import {initializeUsages, persistUsages, selectUsages} from '../features/usages/usageSlice';
import {initializePythonPackage, selectPythonPackage} from '../features/packageData/apiSlice';
import {ConstantBatchForm} from "../features/annotations/batchforms/ConstantBatchForm";
import {getAllSelectedElements} from "../features/packageData/selectionView/ActionBar";

export const App: React.FC = function () {
    useIndexedDB();

    const annotationStore = useAppSelector(selectAnnotations);
    const pythonPackage = useAppSelector(selectPythonPackage);
    const usages = useAppSelector(selectUsages);
    const pythonFilter = useAppSelector(selectFilter);
    const filteredPythonPackage = pythonFilter.applyToPackage(pythonPackage, useAppSelector(selectAnnotations), usages);

    const [showInferErrorDialog, setShowInferErrorDialog] = useState(false);
    const [inferErrors, setInferErrors] = useState<string[]>([]);
    const displayInferErrors = (errors: string[]) => {
        setInferErrors(errors);
        setShowInferErrorDialog(true);
    };

    const currentUserAction = useAppSelector(selectCurrentUserAction);
    const userActionTarget = pythonPackage.getByRelativePathAsString(currentUserAction.target);
    const showAnnotationImportDialog = useAppSelector(selectShowAnnotationImportDialog);
    const showAPIImportDialog = useAppSelector(selectShowAPIImportDialog);
    const showUsagesImportDialog = useAppSelector(selectShowUsageImportDialog);
    const batchMode = useAppSelector(selectBatchMode);

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
                    <MenuBar pythonPackage={pythonPackage} displayInferErrors={displayInferErrors}/>
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
                        <AttributeForm target={userActionTarget || pythonPackage}/>
                    )}
                    {currentUserAction.type === 'boundary' && (
                        <BoundaryForm target={userActionTarget || pythonPackage}/>
                    )}
                    {currentUserAction.type === 'calledAfter' && userActionTarget instanceof PythonFunction && (
                        <CalledAfterForm target={userActionTarget}/>
                    )}
                    {currentUserAction.type === 'constant' && (
                        <ConstantForm target={userActionTarget || pythonPackage}/>
                    )}
                    {currentUserAction.type === 'enum' && <EnumForm target={userActionTarget || pythonPackage}/>}
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
                    {currentUserAction.type === 'move' && <MoveForm target={userActionTarget || pythonPackage}/>}
                    {currentUserAction.type === 'none' && (
                        <TreeView pythonPackage={filteredPythonPackage} filter={pythonFilter} usages={usages}/>
                    )}
                    {currentUserAction.type === 'optional' && (
                        <OptionalForm target={userActionTarget || pythonPackage}/>
                    )}
                    {currentUserAction.type === 'rename' && <RenameForm target={userActionTarget || pythonPackage}/>}
                </GridItem>
                <GridItem gridArea="rightPane" overflow="auto">
                    {batchMode === BatchMode.None && (
                        <SelectionView pythonPackage={pythonPackage} pythonFilter={pythonFilter} usages={usages}/>
                        )}
                    {batchMode === BatchMode.Constant && (
                        <ConstantBatchForm
                        target={getAllSelectedElements(userActionTarget || pythonPackage, pythonFilter, annotationStore, usages)}/>
                        )}
                </GridItem>

                {showAnnotationImportDialog && <AnnotationImportDialog/>}
                {showAPIImportDialog && <PackageDataImportDialog setFilter={setFilterString}/>}
                {showUsagesImportDialog && <UsageImportDialog/>}
            </Grid>
            <Modal
                isOpen={showInferErrorDialog}
                onClose={() => setShowInferErrorDialog(false)}
                scrollBehavior="inside"
                size="xl"
                isCentered
            >
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Infer errors</ModalHeader>
                    <ModalCloseButton/>
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

const useIndexedDB = function () {
    usePersistentAPIState();
    usePersistentAnnotations();
    usePersistentUsages();
    usePersistentUIState();
};

const usePersistentAnnotations = function () {
    const dispatch = useAppDispatch();
    const annotationStore = useAppSelector(selectAnnotations);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializeAnnotations());
            setIsInitialized(true);
        }
    }, [dispatch, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            dispatch(persistAnnotations(annotationStore));
        }
    }, [dispatch, annotationStore, isInitialized]);
};

const usePersistentAPIState = function () {
    const dispatch = useAppDispatch();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializePythonPackage());
            setIsInitialized(true);
        }
    }, [dispatch, isInitialized]);

    // Since there is currently no conversion of a PythonPackage to JSON, we persist the API state when we import it in
    // the corresponding dialog. We must not mutate the PythonPackage afterwards.
};

const usePersistentUIState = function () {
    const dispatch = useAppDispatch();
    const uiState = useAppSelector(selectUI);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializeUI());
            setIsInitialized(true);
        }
    }, [dispatch, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            dispatch(persistUI(uiState));
        }
    }, [dispatch, uiState, isInitialized]);
};

const usePersistentUsages = function () {
    const dispatch = useAppDispatch();
    const usages = useAppSelector(selectUsages);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializeUsages());
            setIsInitialized(true);
        }
    }, [dispatch, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            dispatch(persistUsages(usages));
        }
    }, [dispatch, usages, isInitialized]);
};
