import { Box } from '@chakra-ui/react';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonClass from '../model/PythonClass';
import PythonDeclaration from '../model/PythonDeclaration';
import PythonFunction from '../model/PythonFunction';
import PythonModule from '../model/PythonModule';
import PythonPackage from '../model/PythonPackage';
import PythonParameter from '../model/PythonParameter';
import { selectAllExpandedInTreeView, selectTreeViewScrollOffset, setTreeViewScrollOffset } from '../packageDataSlice';
import {ClassNode} from './ClassNode';
import {FunctionNode} from './FunctionNode';
import {ModuleNode} from './ModuleNode';
import {ParameterNode} from './ParameterNode';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { UsageCountStore } from '../../usages/model/UsageCountStore';
import { AutoSizer } from '../../../common/AutoSizer';

interface ScrollOffset {
    scrollOffset: number;
}

interface TreeViewProps {
    pythonPackage: PythonPackage;
    filter: AbstractPythonFilter;
    usages: UsageCountStore;
}

interface AutoSizerProps {
    height: number;
}

export const TreeView: React.FC<TreeViewProps> = memo(({ pythonPackage, filter, usages }) => {
    const dispatch = useAppDispatch();
    const allExpanded = useAppSelector(selectAllExpandedInTreeView);

    let children = walkChildrenInPreorder(allExpanded, pythonPackage);
    const previousScrollOffset = useAppSelector(selectTreeViewScrollOffset);

    // Keep a reference to the last FixedSizeList before everything is dismounted
    const listRef = useRef<FixedSizeList>();
    const listRefWrapper = useCallback((node: any) => {
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
                    const newScrollOffset = (current.state as ScrollOffset).scrollOffset;
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
            {({ height }: AutoSizerProps) => (
                <FixedSizeList
                    itemSize={24}
                    itemCount={children.length}
                    itemData={{ children, filter, usages }}
                    itemKey={(index, data) => data.children[index]?.pathAsString()}
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
            return [it, ...walkChildrenInPreorder(allExpandedItemsInTreeView, it)];
        } else {
            return [it];
        }
    });
};

const TreeNodeGenerator: React.FC<ListChildComponentProps> = memo(({ data, index, style }) => {
    const declaration = data.children[index];
    const filter = data.filter;
    const usages = data.usages;

    return (
        <Box style={style}>
            {declaration instanceof PythonModule && (
                <ModuleNode pythonModule={declaration} filter={filter} usages={usages} />
            )}
            {declaration instanceof PythonClass && (
                <ClassNode pythonClass={declaration} filter={filter} usages={usages} />
            )}
            {declaration instanceof PythonFunction && (
                <FunctionNode pythonFunction={declaration} filter={filter} usages={usages} />
            )}
            {declaration instanceof PythonParameter && (
                <ParameterNode pythonParameter={declaration} filter={filter} usages={usages} />
            )}
        </Box>
    );
});
