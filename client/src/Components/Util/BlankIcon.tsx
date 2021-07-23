import classNames from 'classnames'
import React from 'react'
import { ClassNameProp } from '../../util/types'
import BlankIconCSS from './BlankIcon.module.css'

export default function BlankIcon(props: ClassNameProp): JSX.Element {
    const className = classNames('fa', 'fa-fw', BlankIconCSS.blankIcon, props.className)

    return <i className={className}>&nbsp;</i>
}
