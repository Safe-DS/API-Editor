import React from "react";
import classNames from "classnames";
import BlankIconCSS from "./BlankIcon.module.css";

type BlankIconProps = {
    className?: string
}

export default function BlankIcon(props: BlankIconProps): JSX.Element {
    const className = classNames("fa", "fa-fw", BlankIconCSS.blankIcon, props.className);

    return <i className={className}>&nbsp;</i>;
}
