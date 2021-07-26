import { Box } from '@chakra-ui/react'
import classNames from 'classnames'
import React from 'react'
import { ClassNameProp } from '../../util/types'

export default function BlankIcon(props: ClassNameProp): JSX.Element {
    const className = classNames('fa', 'fa-fw', props.className)

    return (
        <Box display="inline-block">
            <i className={className}>&nbsp;</i>
        </Box>
    )
}
