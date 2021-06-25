import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronCircleDown, faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import VisibilityIndicatorCSS from "./VisibilityIndicator.module.css";

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
                className={VisibilityIndicatorCSS.visibilityIndicator}
                icon={childrenVisible ? faChevronCircleDown : faChevronCircleRight}
            />
        );
    } else {
        return <></>;
    }
}
