import React from 'react'
import { Optional } from '../../../common/util/types'

interface ClassViewProps {
    title: string
    value: Optional<string>
}

export default function TitleValueViewPair(props: ClassViewProps): JSX.Element {
    return (
        <>
            {props.value && <>{props.title + ': ' + props.value}</>}
            <br />
        </>
    )
}
