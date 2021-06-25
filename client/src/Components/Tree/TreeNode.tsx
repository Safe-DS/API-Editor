import React, {MouseEventHandler} from "react";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import TreeNodeCSS from "./TreeNode.module.css";

type TreeNodeProps = {
    children?: React.ReactNode,
    className?: string,
    icon: IconDefinition,
    hasChildren: boolean,
    level: number,
    name: string,
    onClick: MouseEventHandler<HTMLElement>,
    showChildren: boolean
}

export default function TreeNode(props: TreeNodeProps): JSX.Element {
    return (
        <div className={TreeNodeCSS.treeNode}>
            <div className={props.className ?? ""} onClick={props.onClick}>
                <VisibilityIndicator hasChildren={props.hasChildren} childrenVisible={props.showChildren}/>
                <FontAwesomeIcon icon={props.icon}/>
                {" "}
                <span>{props.name}</span>
            </div>
            <div>
                {props.showChildren && props.children}
            </div>
        </div>
    );
}
