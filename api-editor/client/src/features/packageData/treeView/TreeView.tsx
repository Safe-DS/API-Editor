import { Box } from '@chakra-ui/react';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonClass from '../model/PythonClass';
import PythonDeclaration from '../model/PythonDeclaration';
import PythonFunction from '../model/PythonFunction';
import PythonModule from '../model/PythonModule';
import PythonPackage from '../model/PythonPackage';
import PythonParameter from '../model/PythonParameter';
import {
    selectAllExpandedInTreeView,
    selectShowPrivateDeclarations,
    selectTreeViewScrollOffset,
    setTreeViewScrollOffset,
} from '../packageDataSlice';
import ClassNode from './ClassNode';
import FunctionNode from './FunctionNode';
import ModuleNode from './ModuleNode';
import ParameterNode from './ParameterNode';

interface ScrollOffset {
    scrollOffset: number;
}

interface TreeViewProps {
    pythonPackage: PythonPackage;
}

const TreeView: React.FC<TreeViewProps> = memo(({ pythonPackage }) => {
    const dispatch = useAppDispatch();
    const allExpanded = useAppSelector(selectAllExpandedInTreeView);

    let children = walkChildrenInPreorder(allExpanded, pythonPackage);
    if (!useAppSelector(selectShowPrivateDeclarations)) {
        children = children.filter((it) => it.isPublicDeclaration());
    }
    const previousScrollOffset = useAppSelector(selectTreeViewScrollOffset);

    // Keep a reference to the last FixedSizeList before everything is dismounted
    const listRef = useRef<FixedSizeList>();
    const listRefWrapper = useCallback((node) => {
        if (node) {
            listRef.current = node;
        }
    }, []);

    // Store the scroll offset when the component is dismounted
    useEffect(
        () => () => {
            const current = listRef.current;
            if (current) {
                try {
                    const newScrollOffset = (current.state as ScrollOffset)
                        .scrollOffset;
                    dispatch(setTreeViewScrollOffset(newScrollOffset));
                } catch {
                    dispatch(setTreeViewScrollOffset(0));
                }
            }
        },

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <AutoSizer disableWidth>
            {({ height }) => (
                <FixedSizeList
                    itemSize={24}
                    itemCount={children.length}
                    itemData={children}
                    itemKey={(index, data) => data[index]?.pathAsString()}
                    width="100%"
                    height={height}
                    style={{
                        resize: 'horizontal',
                        whiteSpace: 'nowrap',
                    }}
                    ref={listRefWrapper}
                    initialScrollOffset={previousScrollOffset}
                >
                    {TreeNodeGenerator}
                </FixedSizeList>
            )}
        </AutoSizer>
    );
});

const walkChildrenInPreorder = function (
    allExpandedItemsInTreeView: { [target: string]: true },
    declaration: PythonDeclaration,
): PythonDeclaration[] {
    return declaration.children().flatMap((it) => {
        if (allExpandedItemsInTreeView[it.pathAsString()]) {
            return [
                it,
                ...walkChildrenInPreorder(allExpandedItemsInTreeView, it),
            ];
        } else {
            return [it];
        }
    });
};

const TreeNodeGenerator: React.FC<ListChildComponentProps> = memo(
    ({ data, index, style }) => {
        const declaration = data[index];

        return (
            <Box style={style}>
                {declaration instanceof PythonModule && (
                    <ModuleNode pythonModule={declaration} />
                )}
                {declaration instanceof PythonClass && (
                    <ClassNode pythonClass={declaration} />
                )}
                {declaration instanceof PythonFunction && (
                    <FunctionNode pythonFunction={declaration} />
                )}
                {declaration instanceof PythonParameter && (
                    <ParameterNode pythonParameter={declaration} />
                )}
            </Box>
        );
    },
);

export default TreeView;
