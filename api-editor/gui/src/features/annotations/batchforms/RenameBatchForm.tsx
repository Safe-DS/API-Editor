import React from 'react';
import {useAppDispatch} from '../../../app/hooks';
import {PythonDeclaration} from '../../packageData/model/PythonDeclaration';
import {RenameAnnotation, upsertRenamings} from '../annotationSlice';
import {PythonModule} from "../../packageData/model/PythonModule";
import {OldNewBatchForm, OldNewBatchFormState} from "./OldNewBatchForm";
import {PythonPackage} from "../../packageData/model/PythonPackage";

interface RenameBatchFormProps {
    targets: PythonDeclaration[];
}

export const RenameBatchForm: React.FC<RenameBatchFormProps> = function ({targets}) {
    const filteredTargets = targets.filter(t => !(t instanceof PythonModule || t instanceof PythonPackage));

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: OldNewBatchFormState) => {
        const all: RenameAnnotation[] = [];
        filteredTargets.forEach(t => {
            all.push({
                target: t.id,
                newName: t.name.replace(data.oldString, data.newString),
            });
        });
        dispatch(upsertRenamings(all))
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <OldNewBatchForm targets={filteredTargets} annotationType="rename" onUpsertAnnotation={handleUpsertAnnotation}/>
    );
};
