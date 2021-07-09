import React from "react";
import {Nullable} from "../../util/types";

interface ClassViewProps {
    title: string,
    value: Nullable<string>,
}

export default function TitleValueViewPair(props: ClassViewProps): JSX.Element {

    return (
        <>
            {props.value && <p>{props.title + ": " + props.value}</p>}
        </>
    );
}
