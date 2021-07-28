import { HStack, Icon, Text } from '@chakra-ui/react'
import React from 'react'
import { IconType } from 'react-icons/lib'
import { useLocation } from 'react-router'
import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { ChildrenProp } from '../../../common/util/types'
import { selectIsExpandedInTreeView, toggleExpandedInTreeView } from '../apiDataSlice'
import PythonDeclaration from '../model/PythonDeclaration'
import VisibilityIndicator from './VisibilityIndicator'

interface TreeNodeProps extends ChildrenProp {
    declaration: PythonDeclaration
    icon: IconType
    isExpandable: boolean
}

const TreeNode: React.FC<TreeNodeProps> = ({ children, declaration, icon, isExpandable }) => {
    const currentPathname = useLocation().pathname
    const history = useHistory()
    const dispatch = useAppDispatch()

    const showChildren = useAppSelector(selectIsExpandedInTreeView(declaration.pathAsString()))

    const level = levelOf(declaration)
    const paddingLeft = level === 0 ? '1rem' : `${1 + 0.75 * level}rem`
    const backgroundColor = isSelected(declaration, currentPathname) ? 'cornflowerblue' : undefined
    const color = isSelected(declaration, currentPathname) ? 'white' : undefined

    const handleClick = () => {
        dispatch(toggleExpandedInTreeView(declaration.pathAsString()))
        history.push(`/${declaration.pathAsString()}`)
    }

    return (
        <>
            <HStack
                userSelect="none"
                cursor="pointer"
                color={color}
                backgroundColor={backgroundColor}
                paddingLeft={paddingLeft}
                onClick={handleClick}
            >
                <VisibilityIndicator
                    hasChildren={isExpandable}
                    showChildren={showChildren}
                    isSelected={isSelected(declaration, currentPathname)}
                />
                <Icon as={icon} />
                <Text>{declaration.name}</Text>
            </HStack>
            {showChildren && children}
        </>
    )
}

function levelOf(declaration: PythonDeclaration): number {
    return declaration.path().length - 2
}

function isSelected(declaration: PythonDeclaration, currentPathname: string): boolean {
    return `/${declaration.pathAsString()}` === currentPathname
}

export default TreeNode
