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
import { MenuBar } from '../common/MenuBar';
import { AnnotationImportDialog } from '../features/annotations/AnnotationImportDialog';
import {
    AnnotationStore,
    initializeAnnotations,
    persistAnnotations,
    selectAnnotations,
} from '../features/annotations/annotationSlice';
import { BoundaryForm } from '../features/annotations/forms/BoundaryForm';
import { CalledAfterForm } from '../features/annotations/forms/CalledAfterForm';
import { ConstantForm } from '../features/annotations/forms/ConstantForm';
import { DescriptionForm } from '../features/annotations/forms/DescriptionForm';
import { EnumForm } from '../features/annotations/forms/EnumForm';
import { GroupForm } from '../features/annotations/forms/GroupForm';
import { MoveForm } from '../features/annotations/forms/MoveForm';
import { OptionalForm } from '../features/annotations/forms/OptionalForm';
import { RenameForm } from '../features/annotations/forms/RenameForm';
import { TodoForm } from '../features/annotations/forms/TodoForm';
import { PackageDataImportDialog } from '../features/packageData/PackageDataImportDialog';
import { SelectionView } from '../features/packageData/selectionView/SelectionView';
import { TreeView } from '../features/packageData/treeView/TreeView';
import { useAppDispatch, useAppSelector } from './hooks';
import { PythonFunction } from '../features/packageData/model/PythonFunction';
import { AttributeForm } from '../features/annotations/forms/AttributeForm';
import { UsageImportDialog } from '../features/usages/UsageImportDialog';
import {
    BatchMode,
    GroupUserAction,
    initializeUI,
    persistUI,
    selectBatchMode,
    selectCurrentUserAction,
    selectFilter,
    selectShowAnnotationImportDialog,
    selectShowAPIImportDialog,
    selectShowUsageImportDialog,
    selectUI,
} from '../features/ui/uiSlice';
import { initializeUsages, persistUsages, selectUsages } from '../features/usages/usageSlice';
import { initializePythonPackage, selectRawPythonPackage } from '../features/packageData/apiSlice';
import { PythonClass } from '../features/packageData/model/PythonClass';
import { PythonParameter } from '../features/packageData/model/PythonParameter';
import { ConstantBatchForm } from '../features/annotations/batchforms/ConstantBatchForm';
import { ActionBar } from '../features/packageData/selectionView/ActionBar';
import { useLocation } from 'react-router-dom';
import { RenameBatchForm } from '../features/annotations/batchforms/RenameBatchForm';
import { RequiredBatchForm } from '../features/annotations/batchforms/RequiredBatchForm';
import { OptionalBatchForm } from '../features/annotations/batchforms/OptionalBatchForm';
import { RemoveBatchForm } from '../features/annotations/batchforms/RemoveBatchForm';
import { MoveBatchForm } from '../features/annotations/batchforms/MoveBatchForm';
import { PythonPackage } from '../features/packageData/model/PythonPackage';
import { AbstractPythonFilter } from '../features/packageData/model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../features/usages/model/UsageCountStore';
import { PythonDeclaration } from '../features/packageData/model/PythonDeclaration';

export const App: React.FC = function () {
    useIndexedDB();

    const rawPythonPackage = useAppSelector(selectRawPythonPackage);
    const annotationStore = useAppSelector(selectAnnotations);
    const usages = useAppSelector(selectUsages);
    const filter = useAppSelector(selectFilter);

    const [showInferErrorDialog, setShowInferErrorDialog] = useState(false);
    const [inferErrors, setInferErrors] = useState<string[]>([]);
    const displayInferErrors = (errors: string[]) => {
        setInferErrors(errors);
        setShowInferErrorDialog(true);
    };

    const declaration = rawPythonPackage.getDeclarationById(useLocation().pathname.split('/').splice(1).join('/'));
    const currentUserAction = useAppSelector(selectCurrentUserAction);
    const userActionTarget = rawPythonPackage.getDeclarationById(currentUserAction.target);
    const showAnnotationImportDialog = useAppSelector(selectShowAnnotationImportDialog);
    const showAPIImportDialog = useAppSelector(selectShowAPIImportDialog);
    const showUsagesImportDialog = useAppSelector(selectShowUsageImportDialog);
    const batchMode = useAppSelector(selectBatchMode);

    return (
        <>
            <Grid
                autoColumns="0fr 1fr 0fr"
                autoRows="0fr 1fr"
                templateAreas='"menu menu" "leftPane rightPane" "footer footer"'
                w="100vw"
                h="100vh"
            >
                <GridItem gridArea="menu" colSpan={2}>
                    <MenuBar displayInferErrors={displayInferErrors} />
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
                        <AttributeForm target={userActionTarget || rawPythonPackage} />
                    )}
                    {currentUserAction.type === 'boundary' && (
                        <BoundaryForm target={userActionTarget || rawPythonPackage} />
                    )}
                    {currentUserAction.type === 'calledAfter' && userActionTarget instanceof PythonFunction && (
                        <CalledAfterForm target={userActionTarget} />
                    )}
                    {currentUserAction.type === 'constant' && (
                        <ConstantForm target={userActionTarget || rawPythonPackage} />
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
                    {currentUserAction.type === 'optional' && (
                        <OptionalForm target={userActionTarget || rawPythonPackage} />
                    )}
                    {currentUserAction.type === 'rename' && (
                        <RenameForm target={userActionTarget || rawPythonPackage} />
                    )}
                    {currentUserAction.type === 'todo' && <TodoForm target={userActionTarget || rawPythonPackage} />}
                </GridItem>
                <GridItem gridArea="rightPane" overflow="auto">
                    <Box flexGrow={1} overflowY="auto" width="100%">
                        {batchMode === BatchMode.None && <SelectionView />}

                        {batchMode === BatchMode.Constant && (
                            <ConstantBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Rename && (
                            <RenameBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Move && (
                            <MoveBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Required && (
                            <RequiredBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Optional && (
                            <OptionalBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}

                        {batchMode === BatchMode.Remove && (
                            <RemoveBatchForm
                                targets={getMatchedElements(rawPythonPackage, filter, annotationStore, usages)}
                            />
                        )}
                    </Box>
                </GridItem>
                <GridItem gridArea="footer" colSpan={2}>
                    {currentUserAction.type === 'none' && <ActionBar declaration={declaration} />}
                </GridItem>

                {showAnnotationImportDialog && <AnnotationImportDialog />}
                {showAPIImportDialog && <PackageDataImportDialog />}
                {showUsagesImportDialog && <UsageImportDialog />}
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

export const getMatchedElements = function (
    pythonPackage: PythonPackage,
    filter: AbstractPythonFilter,
    annotations: AnnotationStore,
    usages: UsageCountStore,
): PythonDeclaration[] {
    return [...pythonPackage.descendantsOrSelf()].filter((it) => filter.shouldKeepDeclaration(it, annotations, usages));
};
