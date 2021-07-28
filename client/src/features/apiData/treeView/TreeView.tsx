import { Box } from '@chakra-ui/react'
import React, { memo, useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { selectAllExpandedInTreeView, selectTreeViewScrollOffset, setTreeViewScrollOffset } from '../apiDataSlice'
import PythonClass from '../model/PythonClass'
import PythonDeclaration from '../model/PythonDeclaration'
import PythonFunction from '../model/PythonFunction'
import PythonModule from '../model/PythonModule'
import PythonPackage from '../model/PythonPackage'
import PythonParameter from '../model/PythonParameter'
import ClassNode from './ClassNode'
import FunctionNode from './FunctionNode'
import ModuleNode from './ModuleNode'
import ParameterNode from './ParameterNode'

interface ScrollOffset {
    scrollOffset: number
}

interface TreeViewProps {
    pythonPackage: PythonPackage
}

const TreeView: React.FC<TreeViewProps> = memo(({ pythonPackage }) => {
    const dispatch = useAppDispatch()
    const allExpanded = useAppSelector(selectAllExpandedInTreeView)
    const listRef = React.createRef<FixedSizeList>()

    const children = walkChildrenWithPreOrder(allExpanded, pythonPackage)
    const previousScrollOffset = useAppSelector(selectTreeViewScrollOffset)

    useEffect(() => {
        const current = listRef.current
        if (current) {
            return () => {
                try {
                    const newScrollOffset = (current.state as ScrollOffset).scrollOffset
                    if (newScrollOffset !== previousScrollOffset) {
                        dispatch(setTreeViewScrollOffset(newScrollOffset))
                    }
                } catch {
                    dispatch(setTreeViewScrollOffset(0))
                }
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, listRef])

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
                    ref={listRef}
                    initialScrollOffset={previousScrollOffset}
                >
                    {TreeNodeGenerator}
                </FixedSizeList>
            )}
        </AutoSizer>
    )
})

function walkChildrenWithPreOrder(
    allExpandedInTreeView: { [target: string]: true },
    declaration: PythonDeclaration,
): PythonDeclaration[] {
    return declaration.children().flatMap((it) => {
        if (allExpandedInTreeView[it.pathAsString()]) {
            return [it, ...walkChildrenWithPreOrder(allExpandedInTreeView, it)]
        } else {
            return [it]
        }
    })
}

const TreeNodeGenerator: React.FC<ListChildComponentProps> = memo(({ data, index, style }) => {
    const declaration = data[index]

    return (
        <Box style={style}>
            {declaration instanceof PythonModule && <ModuleNode pythonModule={declaration} />}
            {declaration instanceof PythonClass && <ClassNode pythonClass={declaration} />}
            {declaration instanceof PythonFunction && <FunctionNode pythonFunction={declaration} />}
            {declaration instanceof PythonParameter && <ParameterNode pythonParameter={declaration} />}
        </Box>
    )
})

export default TreeView
