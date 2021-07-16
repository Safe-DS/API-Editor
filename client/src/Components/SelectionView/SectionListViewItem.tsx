import React from "react";
import {isEmptyList} from "../../util/listOperations";

interface ClassViewItemProps {
    title: string,
    inputElements: string[] | string
}

export default function SectionListViewItem(props: ClassViewItemProps): JSX.Element {

    if (typeof props.inputElements === "string") {
        props.inputElements = [props.inputElements];
    }

    return (
        <>
            <h2>{props.title}</h2>
            {
                !isEmptyList(props.inputElements) ?
                    props.inputElements.map((listElement, index) => (
                        <div className="pl-1rem" key={index}>{listElement}</div>
                    )) :
                    <span className="text-muted"
                          style={{paddingLeft: '1rem'}}>There are no {props.title.toLowerCase()}.</span>
            }
        </>
    );
}
