import React from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { PythonDeclaration } from '../../packageData/model/PythonDeclaration';
import { RemoveAnnotation, upsertRemoves } from '../annotationSlice';
import { PythonModule } from '../../packageData/model/PythonModule';
import { EmptyBatchForm } from './EmptyBatchForm';
import { PythonPackage } from '../../packageData/model/PythonPackage';

interface RemoveBatchFormProps {
    targets: PythonDeclaration[];
}

export const RemoveBatchForm: React.FC<RemoveBatchFormProps> = function ({ targets }) {
    const filteredTargets = targets.filter((t) => !(t instanceof PythonModule || t instanceof PythonPackage));
    const targetPaths = filteredTargets.map((t) => t.id);

    // Hooks -----------------------------------------------------------------------------------------------------------
    const dispatch = useAppDispatch();

    // Event handlers --------------------------------------------------------------------------------------------------

    const handleUpsertAnnotation = () => {
        const all: RemoveAnnotation[] = [];
        targetPaths.forEach((targetPath) => {
            all.push({
                target: targetPath,
            });
        });
        dispatch(upsertRemoves(all));
    };

    // Rendering -------------------------------------------------------------------------------------------------------

    return (
        <EmptyBatchForm targets={filteredTargets} annotationType="remove" onUpsertAnnotation={handleUpsertAnnotation} />
    );
};
