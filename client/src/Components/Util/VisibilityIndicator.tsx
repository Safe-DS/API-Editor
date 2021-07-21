import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import React from 'react'
import { ClassNameProp } from '../../util/types'
import BlankIcon from './BlankIcon'
import VisibilityIndicatorCSS from './VisibilityIndicator.module.css'

interface VisibilityIndicatorProps extends ClassNameProp {
    hasChildren: boolean
    showChildren: boolean
    isSelected?: boolean
}

export default function VisibilityIndicator({
    className,
    hasChildren,
    showChildren,
    isSelected = false,
}: VisibilityIndicatorProps): JSX.Element {
    const cssClasses = classNames(className, {
        [VisibilityIndicatorCSS.closed]: !isSelected && !showChildren,
    })

    if (hasChildren) {
        return (
            <FontAwesomeIcon className={cssClasses} icon={showChildren ? faChevronDown : faChevronRight} fixedWidth />
        )
    } else {
        return <BlankIcon className={className} />
    }
}
