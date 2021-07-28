import { Box, Icon } from '@chakra-ui/react'
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

export default function TreeNode(props: TreeNodeProps): JSX.Element {
    const currentPathname = useLocation().pathname
    const history = useHistory()
    const dispatch = useAppDispatch()

    const showChildren = useAppSelector(selectIsExpandedInTreeView(props.declaration.pathAsString()))

    const level = levelOf(props.declaration)
    const paddingLeft = level === 0 ? '1rem' : `calc(0.5 * ${level} * (1.25em + 0.25rem) + 1rem)`
    const backgroundColor = isSelected(props.declaration, currentPathname) ? 'cornflowerblue' : undefined
    const color = isSelected(props.declaration, currentPathname) ? 'white' : undefined

    const handleClick = () => {
        dispatch(toggleExpandedInTreeView(props.declaration.pathAsString()))
        history.push(`/${props.declaration.pathAsString()}`)
    }

    return (
        <>
            <Box
                userSelect="none"
                _hover={{ cursor: 'pointer' }}
                color={color}
                backgroundColor={backgroundColor}
                paddingLeft={paddingLeft}
                onClick={handleClick}
            >
                <VisibilityIndicator
                    hasChildren={props.isExpandable}
                    showChildren={showChildren}
                    isSelected={isSelected(props.declaration, currentPathname)}
                />
                <Icon as={props.icon} marginRight={1} />
                {props.declaration.name}
            </Box>
            {showChildren && props.children}
        </>
    )
}

function levelOf(declaration: PythonDeclaration): number {
    return declaration.path().length - 2
}

function isSelected(declaration: PythonDeclaration, currentPathname: string): boolean {
    return `/${declaration.pathAsString()}` === currentPathname
}
