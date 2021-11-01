import { Grid, GridItem } from '@chakra-ui/react';
import * as idb from 'idb-keyval';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import MenuBar from '../common/MenuBar';
import { Optional, Setter } from '../common/util/types';
import AnnotationImportDialog from '../features/annotations/AnnotationImportDialog';
import {
    AnnotationsState,
    initializeAnnotations,
    selectAnnotations,
    selectCurrentUserAction,
    selectShowAnnotationImportDialog,
} from '../features/annotations/annotationSlice';
import BoundaryForm from '../features/annotations/forms/BoundaryForm';
import CalledAfterForm from '../features/annotations/forms/CalledAfterForm';
import ConstantForm from '../features/annotations/forms/ConstantForm';
import EnumForm from '../features/annotations/forms/EnumForm';
import OptionalForm from '../features/annotations/forms/OptionalForm';
import RenameForm from '../features/annotations/forms/RenameForm';
import PythonClass from '../features/packageData/model/PythonClass';
import PythonDeclaration from '../features/packageData/model/PythonDeclaration';
import { PythonFilter } from '../features/packageData/model/PythonFilter';
import PythonFunction from '../features/packageData/model/PythonFunction';
import PythonModule from '../features/packageData/model/PythonModule';
import PythonPackage from '../features/packageData/model/PythonPackage';
import {
    parsePythonPackageJson,
    PythonPackageJson,
} from '../features/packageData/model/PythonPackageBuilder';
import PackageDataImportDialog from '../features/packageData/PackageDataImportDialog';
import {
    selectShowPackageDataImportDialog,
    toggleIsExpandedInTreeView,
} from '../features/packageData/packageDataSlice';
import SelectionView from '../features/packageData/selectionView/SelectionView';
import TreeView from '../features/packageData/treeView/TreeView';
import { useAppDispatch, useAppSelector } from './hooks';

const App: React.FC = function () {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(
        new PythonPackage('empty'),
    );
    const currentUserAction = useAppSelector(selectCurrentUserAction);
    const currentPathName = useLocation().pathname;

    useEffect(() => {
        // noinspection JSIgnoredPromiseFromCall
        getPythonPackageFromIndexedDB(setPythonPackage);
    }, []);

    const annotationStore = useAppSelector(selectAnnotations);

    const dispatch = useAppDispatch();
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

    const [filter, setFilter] = useState('');
    const pythonFilter = PythonFilter.fromFilterBoxInput(filter);
    const filteredPythonPackage = pythonPackage.filter(pythonFilter);

    const userActionTarget = pythonPackage.getByRelativePathAsString(
        currentUserAction.target,
    );

    const getContainingModule = (target: Optional<PythonDeclaration>): Optional<PythonModule> => {
        if(target instanceof PythonFunction) {
            if(target?.parent() instanceof PythonClass) {
                return (target?.parent() as PythonClass)?.parent();
            }
            if(target?.parent() instanceof PythonModule) {
                return target?.parent() as PythonModule;
            }
        }
        else {
            return null;
        }
    };

    const showAnnotationImportDialog = useAppSelector(
        selectShowAnnotationImportDialog,
    );
    const showPackageDataImportDialog = useAppSelector(
        selectShowPackageDataImportDialog,
    );

    return (
        <Grid
            autoColumns="0fr 1fr"
            autoRows="0fr 1fr"
            templateAreas='"menu menu" "leftPane rightPane"'
            w="100vw"
            h="100vh"
        >
            <GridItem gridArea="menu" colSpan={2}>
                <MenuBar filter={filter} setFilter={setFilter} />
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
                {currentUserAction.type === 'boundary' && (
                    <BoundaryForm target={userActionTarget || pythonPackage} />
                )}
                {currentUserAction.type === 'calledAfter' && (
                    <CalledAfterForm
                        target={userActionTarget || pythonPackage}
                        selectOptions={
                            getContainingModule(userActionTarget)
                                ?.getNestedContainedFunctionNames()
                        }
                    />
                )}
                {currentUserAction.type === 'constant' && (
                    <ConstantForm target={userActionTarget || pythonPackage} />
                )}
                {currentUserAction.type === 'enum' && (
                    <EnumForm target={userActionTarget || pythonPackage} />
                )}
                {currentUserAction.type === 'none' && (
                    <TreeView pythonPackage={filteredPythonPackage} />
                )}
                {currentUserAction.type === 'optional' && (
                    <OptionalForm target={userActionTarget || pythonPackage} />
                )}
                {currentUserAction.type === 'rename' && (
                    <RenameForm target={userActionTarget || pythonPackage} />
                )}
            </GridItem>
            <GridItem gridArea="rightPane" overflow="auto">
                <SelectionView pythonPackage={pythonPackage} />
            </GridItem>

            {showAnnotationImportDialog && <AnnotationImportDialog />}
            {showPackageDataImportDialog && (
                <PackageDataImportDialog
                    setPythonPackage={setPythonPackage}
                    setFilter={setFilter}
                />
            )}
        </Grid>
    );
};

const getPythonPackageFromIndexedDB = async function (
    setPythonPackage: Setter<PythonPackage>,
) {
    const storedPackage = (await idb.get('package')) as PythonPackageJson;
    if (storedPackage) {
        setPythonPackage(parsePythonPackageJson(storedPackage));
    }
};

const setAnnotationsInIndexedDB = async function (
    annotationStore: AnnotationsState,
) {
    await idb.set('annotations', annotationStore);
};

export default App;
