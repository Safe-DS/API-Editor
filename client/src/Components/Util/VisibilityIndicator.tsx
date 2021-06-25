import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronCircleDown, faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import React from "react";

type VisibilityIndicatorProps = {
    hasChildren: boolean,
    childrenVisible: boolean
}

export default function VisibilityIndicator(
    {hasChildren = true, childrenVisible = false}: VisibilityIndicatorProps
): JSX.Element {
    if (hasChildren) {
        return (
            <FontAwesomeIcon
                className="indicator visibility-indicator"
                icon={childrenVisible ? faChevronCircleDown : faChevronCircleRight}
            />
        );
    } else {
        return <></>;
    }
}
