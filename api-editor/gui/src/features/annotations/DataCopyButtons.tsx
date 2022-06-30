import { Button, ButtonGroup, Tooltip, useClipboard } from '@chakra-ui/react';
import React from 'react';
import { FaClipboard } from 'react-icons/fa';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { selectUsages } from '../usages/usageSlice';
import { buildMinimalAPIJson } from '../packageData/minimalAPIBuilder';
import { details, jsonCode } from '../../common/util/stringOperations';
import { buildMinimalUsagesStoreJson } from '../usages/minimalUsageStoreBuilder';

interface MinimalDataButtonsProps {
    target: string;
}

export const DataCopyButtons: React.FC<MinimalDataButtonsProps> = function ({ target }) {
    const pythonPackage = useAppSelector(selectRawPythonPackage);
    const declaration = pythonPackage.getDeclarationById(target);
    const usages = useAppSelector(selectUsages);
    const { onCopy: onCopyAPI } = useClipboard(
        details(jsonCode(buildMinimalAPIJson(declaration)), `Minimal API Data for \`${target}\``),
    );
    const { onCopy: onCopyUsages } = useClipboard(
        details(jsonCode(buildMinimalUsagesStoreJson(usages, declaration)), `Minimal Usage Store for \`${target}\``),
    );
    const { onCopy: onCopyQualifiedName } = useClipboard(declaration?.preferredQualifiedName() ?? '');

    return (
        <ButtonGroup size="sm" variant="outline" isAttached>
            <Tooltip label="Copy the minimal API data to the clipboard. Paste this into the corresponding field in the issue form.">
                <Button
                    leftIcon={<FaClipboard />}
                    onClick={() => {
                        onCopyAPI();
                    }}
                >
                    API
                </Button>
            </Tooltip>
            <Tooltip label="Copy the minimal usage store to the clipboard. Paste this into the corresponding field in the issue form.">
                <Button
                    leftIcon={<FaClipboard />}
                    onClick={() => {
                        onCopyUsages();
                    }}
                >
                    Usages
                </Button>
            </Tooltip>
            <Tooltip label="Copy the qualified name of this declaration to the clipboard.">
                <Button
                    leftIcon={<FaClipboard />}
                    onClick={() => {
                        onCopyQualifiedName();
                    }}
                >
                    Qualified Name
                </Button>
            </Tooltip>
        </ButtonGroup>
    );
};
