import React from "react";
import {Nullable} from "../../util/types";

interface ClassViewProps {
    title: string,
    value: Nullable<string>,
}

export default function TitleValueViewPair(props: ClassViewProps): JSX.Element {

    return (
        <>
            {props.value && <>{props.title + ": " + props.value}</>}
            <br/>
        </>
    );
}
