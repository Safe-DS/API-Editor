import {faChevronCircleDown, faChevronCircleRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import BlankIcon from "./BlankIcon";
import VisibilityIndicatorCSS from "./VisibilityIndicator.module.css";

type VisibilityIndicatorProps = {
    className?: string,
    hasChildren: boolean,
    showChildren: boolean
}

export default function VisibilityIndicator(props: VisibilityIndicatorProps): JSX.Element {
    const className = classNames(VisibilityIndicatorCSS.visibilityIndicator, props.className);

    if (props.hasChildren) {
        return (
            <FontAwesomeIcon
                className={className}
                icon={props.showChildren ? faChevronCircleDown : faChevronCircleRight}
                fixedWidth
            />
        );
    } else {
        return <BlankIcon className={className}/>;
    }
}
