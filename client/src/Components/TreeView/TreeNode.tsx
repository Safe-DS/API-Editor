import { Box, Icon } from '@chakra-ui/react'
import classNames from 'classnames'
import React, { useState } from 'react'
import { IconType } from 'react-icons/lib'
import { useLocation } from 'react-router'
import { useHistory } from 'react-router-dom'
import PythonDeclaration from '../../model/python/PythonDeclaration'
import { ChildrenProp } from '../../util/types'
import VisibilityIndicator from '../Util/VisibilityIndicator'

interface TreeNodeProps extends ChildrenProp {
    declaration: PythonDeclaration
    icon: IconType
    isExpandable: boolean
    isWorthClicking: boolean
}

export default function TreeNode(props: TreeNodeProps): JSX.Element {
    const currentPathname = useLocation().pathname
    const [showChildren, setShowChildren] = useState(selfOrChildIsSelected(props.declaration, currentPathname))
    const history = useHistory()

    const className = classNames({
        selected: isSelected(props.declaration, currentPathname),
        'text-muted': !props.isWorthClicking,
    })

    const level = levelOf(props.declaration)
    const paddingLeft = level === 0 ? '1rem' : `calc(0.5 * ${level} * (1.25em + 0.25rem) + 1rem)`

    const handleClick = () => {
        setShowChildren((prevState) => !prevState)
        history.push(`/${props.declaration.pathAsString()}`)
    }

    return (
        <Box userSelect="none" _hover={{ cursor: 'pointer' }}>
            <Box className={className} paddingLeft={paddingLeft} onClick={handleClick}>
                <VisibilityIndicator
                    hasChildren={props.isExpandable}
                    showChildren={showChildren}
                    isSelected={isSelected(props.declaration, currentPathname)}
                />
                <Icon as={props.icon} marginRight={1} />
                {props.declaration.name}
            </Box>
            <Box>{showChildren && props.children}</Box>
        </Box>
    )
}

function levelOf(declaration: PythonDeclaration): number {
    return declaration.path().length - 2
}

function isSelected(declaration: PythonDeclaration, currentPathname: string): boolean {
    return `/${declaration.pathAsString()}` === currentPathname
}

function selfOrChildIsSelected(declaration: PythonDeclaration, currentPathname: string): boolean {
    const declarationPath = `/${declaration.pathAsString()}`
    const currentPath = currentPathname

    // The slash prevents /sklearn/sklearn from opening when the path is /sklearn/sklearn.base
    return currentPath === declarationPath || currentPath.startsWith(`${declarationPath}/`)
}
