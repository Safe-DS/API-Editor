import { Box } from '@chakra-ui/react'
import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import { useAppSelector } from '../../../app/hooks'
import { selectAllExpandedInTreeView } from '../apiDataSlice'
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

interface TreeViewProps {
    pythonPackage: PythonPackage
}

const TreeView: React.FC<TreeViewProps> = ({ pythonPackage }) => {
    const allExpandedInTreeView = useAppSelector(selectAllExpandedInTreeView)
    const children = walkChildrenWithPreOrder(allExpandedInTreeView, pythonPackage)

    return (
        <AutoSizer disableWidth>
            {({ height }) => (
                <FixedSizeList
                    itemSize={24}
                    itemCount={children.length}
                    itemData={children}
                    overscanCount={10}
                    width="100%"
                    height={height}
                    style={{
                        resize: 'horizontal',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {TreeNodeGenerator}
                </FixedSizeList>
            )}
        </AutoSizer>
    )
}

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

const TreeNodeGenerator: React.FC<ListChildComponentProps> = ({ data, index, style }) => {
    const declaration = data[index]

    return (
        <Box style={style}>
            {declaration instanceof PythonModule && <ModuleNode pythonModule={declaration} />}
            {declaration instanceof PythonClass && <ClassNode pythonClass={declaration} />}
            {declaration instanceof PythonFunction && <FunctionNode pythonFunction={declaration} />}
            {declaration instanceof PythonParameter && <ParameterNode pythonParameter={declaration} />}
        </Box>
    )
}

export default TreeView
