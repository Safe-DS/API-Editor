import {
    Box,
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
import React, { useEffect, useState } from 'react';
import { MenuBar } from '../features/menuBar/MenuBar';
import { AnnotationImportDialog } from '../features/annotations/AnnotationImportDialog';
import {
    initializeAnnotations,
    persistAnnotations,
    selectAnnotationSlice,
    selectAnnotationStore,
    selectUsernameIsValid,
} from '../features/annotations/annotationSlice';
import { BoundaryForm } from '../features/annotations/forms/BoundaryForm';
import { CalledAfterForm } from '../features/annotations/forms/CalledAfterForm';
import { DescriptionForm } from '../features/annotations/forms/DescriptionForm';
import { EnumForm } from '../features/annotations/forms/EnumForm';
import { GroupForm } from '../features/annotations/forms/GroupForm';
import { MoveForm } from '../features/annotations/forms/MoveForm';
import { RenameForm } from '../features/annotations/forms/RenameForm';
import { TodoForm } from '../features/annotations/forms/TodoForm';
import { PackageDataImportDialog } from '../features/packageData/PackageDataImportDialog';
import { SelectionView } from '../features/packageData/selectionView/SelectionView';
import { TreeView } from '../features/packageData/treeView/TreeView';
import { useAppDispatch, useAppSelector } from './hooks';
import { PythonFunction } from '../features/packageData/model/PythonFunction';
import { UsageImportDialog } from '../features/usages/UsageImportDialog';
import {
    BatchMode,
    GroupUserAction,
    initializeUI,
    persistUI,
    selectBatchMode,
    selectCurrentUserAction,
    selectFilter,
    selectShowAddFilterDialog,
    selectShowAnnotationImportDialog,
    selectShowAPIImportDialog,
    selectShowStatistics,
    selectShowUsageImportDialog,
    selectUI,
} from '../features/ui/uiSlice';
import { initializeUsages, persistUsages, selectUsages } from '../features/usages/usageSlice';
import { initializePythonPackage, selectRawPythonPackage } from '../features/packageData/apiSlice';
import { PythonClass } from '../features/packageData/model/PythonClass';
import { PythonParameter } from '../features/packageData/model/PythonParameter';
import { Footer } from '../features/footer/Footer';
import { RenameBatchForm } from '../features/annotations/batchforms/RenameBatchForm';
import { ValueBatchForm } from '../features/annotations/batchforms/ValueBatchForm';
import { RemoveBatchForm } from '../features/annotations/batchforms/RemoveBatchForm';
import { MoveBatchForm } from '../features/annotations/batchforms/MoveBatchForm';
import { PythonPackage } from '../features/packageData/model/PythonPackage';
import { AbstractPythonFilter } from '../features/filter/model/AbstractPythonFilter';
import { UsageCountStore } from '../features/usages/model/UsageCountStore';
import { PythonDeclaration } from '../features/packageData/model/PythonDeclaration';
import { SaveFilterDialog } from '../features/filter/SaveFilterDialog';
import { StatisticsView } from '../features/statistics/StatisticsView';
import { useAnnotationToasts } from '../features/achievements/AnnotationToast';
import { ValueForm } from '../features/annotations/forms/ValueForm';
import {AnnotationStore, CalledAfterTarget} from '../features/annotations/versioning/AnnotationStoreV2';
import {RemoveForm} from "../features/annotations/forms/RemoveForm";
import {PureForm} from "../features/annotations/forms/PureForm";

export const App: React.FC = function () {
    useIndexedDB();

    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const annotationStore = useAppSelector(selectAnnotationStore);
    const usages = useAppSelector(selectUsages);
    const filter = useAppSelector(selectFilter);

    const [showInferErrorDialog, setShowInferErrorDialog] = useState(false);
    const [inferErrors, setInferErrors] = useState<string[]>([]);
    const displayInferErrors = (errors: string[]) => {
        setInferErrors(errors);
        setShowInferErrorDialog(true);
    };

    const currentUserAction = useAppSelector(selectCurrentUserAction);
    const userActionTarget = rawPythonPackage.getDeclarationById(currentUserAction.target);
    const showAnnotationImportDialog = useAppSelector(selectShowAnnotationImportDialog);
    const showAPIImportDialog = useAppSelector(selectShowAPIImportDialog);
    const showUsagesImportDialog = useAppSelector(selectShowUsageImportDialog);
    const batchMode = useAppSelector(selectBatchMode);
    const showAddFilterDialog = useAppSelector(selectShowAddFilterDialog);
    const showStatistics = useAppSelector(selectShowStatistics);
    const isValidUsername = useAppSelector(selectUsernameIsValid);

    useAnnotationToasts();

    return (
        <>
            <Grid
                autoColumns="0fr 1fr 0fr"
                autoRows="0fr 1fr 0fr"
                templateAreas='"menu menu menu" "leftPane middlePane rightPane" "footer footer footer"'
                w="100vw"
                h="100vh"
            >
                <GridItem gridArea="menu" colSpan={3}>
                    <MenuBar displayInferErrors={displayInferErrors} />
                </GridItem>
                <GridItem
                    gridArea="leftPane"
                    overflow="auto"
                    minW="20vw"
                    w="30vw"
                    maxW="50vw"
                    borderRight={1}
                    layerStyle="subtleBorder"
                    resize="horizontal"
                >
                    {currentUserAction.type === 'boundary' && (
                        <BoundaryForm target={userActionTarget || rawPythonPackage} />
                    )}
                    {currentUserAction.type === 'calledAfter' && userActionTarget instanceof PythonFunction && (
                        <CalledAfterForm target={userActionTarget} calledAfterName={
                            (currentUserAction as CalledAfterTarget)?.calledAfterName
                                ? (currentUserAction as CalledAfterTarget)?.calledAfterName
                                : ''
                        }/>
                    )}
                    {currentUserAction.type === 'description' &&
                        (userActionTarget instanceof PythonClass ||
                            userActionTarget instanceof PythonFunction ||
                            userActionTarget instanceof PythonParameter) && (
                            <DescriptionForm target={userActionTarget} />
                        )}
                    {currentUserAction.type === 'enum' && <EnumForm target={userActionTarget || rawPythonPackage} />}
                    {currentUserAction.type === 'group' && (
                        <GroupForm
                            target={userActionTarget || rawPythonPackage}
                            groupName={
                                (currentUserAction as GroupUserAction)?.groupName
                                    ? (currentUserAction as GroupUserAction)?.groupName
                                    : ''
                            }
                        />
                    )}
                    {currentUserAction.type === 'move' && <MoveForm target={userActionTarget || rawPythonPackage} />}
                    {currentUserAction.type === 'none' && <TreeView />}
                    {currentUserAction.type === 'pure' && <PureForm target={userActionTarget || rawPythonPackage} />}
                    {currentUserAction.type === 'remove' && <RemoveForm target={userActionTarget || rawPythonPackage} />}
                    {currentUserAction.type === 'rename' && (
                        <RenameForm target={userActionTarget || rawPythonPackage} />
                    )}
                    {currentUserAction.type === 'todo' && <TodoForm target={userActionTarget || rawPythonPackage} />}
                    {currentUserAction.type === 'value' && <ValueForm target={userActionTarget || rawPythonPackage} />}
                </GridItem>
                <GridItem gridArea="middlePane" overflow="auto" display="flex">
                    <Box flexGrow={1} overflowY="auto" width="100%">
                        {(batchMode === BatchMode.None || !isValidUsername) && <SelectionView />}

                        {batchMode === BatchMode.Rename && isValidUsername && (
                            <RenameBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Move && isValidUsername && (
                            <MoveBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Remove && isValidUsername && (
                            <RemoveBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Value && isValidUsername && (
                            <ValueBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}
                    </Box>
                </GridItem>
                {showStatistics && (
                    <GridItem
                        gridArea="rightPane"
                        overflow="auto"
                        w="20vw"
                        borderLeft={1}
                        layerStyle="subtleBorder"
                        resize="horizontal"
                    >
                        <Box padding={4}>
                            <StatisticsView />
                        </Box>
                    </GridItem>
                )}
                <GridItem gridArea="footer" colSpan={3}>
                    <Footer />
                </GridItem>

                {showAnnotationImportDialog && <AnnotationImportDialog />}
                {showAPIImportDialog && <PackageDataImportDialog />}
                {showUsagesImportDialog && <UsageImportDialog />}
                {showAddFilterDialog && <SaveFilterDialog />}
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
const useIndexedDB = function () {
    usePersistentAPIState();
    usePersistentAnnotations();
    usePersistentUsages();
    usePersistentUIState();
};

const usePersistentAnnotations = function () {
    const dispatch = useAppDispatch();
    const annotationSlice = useAppSelector(selectAnnotationSlice);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializeAnnotations());
            setIsInitialized(true);
        }
    }, [dispatch, isInitialized]);

    useEffect(() => {
        if (isInitialized) {
            dispatch(persistAnnotations(annotationSlice));
        }
    }, [dispatch, annotationSlice, isInitialized]);
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

export const getMatchedElements = function (
    pythonPackage: PythonPackage,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): PythonDeclaration[] {
    return [...pythonPackage.descendantsOrSelf()].filter((it) => filter.shouldKeepDeclaration(it, annotations, usages));
};
