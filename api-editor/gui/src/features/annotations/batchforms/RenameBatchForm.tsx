import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { RenameAnnotation, upsertRenamings } from '../annotationSlice';
import { OldNewBatchForm, OldNewBatchFormState } from './OldNewBatchForm';
import { PythonClass } from '../../packageData/model/PythonClass';
import { PythonFunction } from '../../packageData/model/PythonFunction';
import { PythonParameter } from '../../packageData/model/PythonParameter';

interface RenameBatchFormProps {
    targets: PythonDeclaration[];
}

export const RenameBatchForm: React.FC<RenameBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter(
        (t) => t instanceof PythonClass || t instanceof PythonFunction || t instanceof PythonParameter,
    );

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = (data: OldNewBatchFormState) => {
        const all: RenameAnnotation[] = [];
        filteredTargets.forEach((t) => {
            if (t.name !== t.name.replace(data.oldString, data.newString)) {
                all.push({
                    target: t.id,
                    newName: t.name.replace(data.oldString, data.newString),
                });
            }
        });
        dispatch(upsertRenamings(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <OldNewBatchForm
            targets={filteredTargets}
            annotationType="rename"
            onUpsertAnnotation={handleUpsertAnnotation}
        />
    );
};
