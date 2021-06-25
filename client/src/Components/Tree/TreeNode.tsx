import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, {useState} from "react";
import PythonDeclaration from "../../model/PythonDeclaration";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import TreeNodeCSS from "./TreeNode.module.css";

type TreeNodeProps = {
    children?: React.ReactNode,
    declaration: PythonDeclaration,
    icon: IconDefinition,
    hasChildren: boolean,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>,
    isWorthClicking: boolean
}

export default function TreeNode(props: TreeNodeProps): JSX.Element {
    const [showChildren, setShowChildren] = useState(false);

    const className = classNames({
        [TreeNodeCSS.selected]: isSelected(props.declaration, props.selection),
        "text-muted": !props.isWorthClicking
    });

    const level = levelOf(props.declaration);
    const padding = level === 0 ? "0" : `calc(${level} * (1.25em + 0.25rem))`;

    const handleClick = () => {
        setShowChildren(prevState => !prevState);
        props.setSelection(props.declaration);
    };

    return (
        <div className={TreeNodeCSS.treeNode}>
            <div className={className} style={{paddingLeft: padding}} onClick={handleClick}>
                <VisibilityIndicator
                    className={TreeNodeCSS.icon}
                    hasChildren={props.hasChildren}
                    showChildren={showChildren}
                />
                <FontAwesomeIcon
                    className={TreeNodeCSS.icon}
                    icon={props.icon}
                    fixedWidth
                />
                <span>{props.declaration.name}</span>
            </div>
            <div className={TreeNodeCSS.children}>
                {showChildren && props.children}
            </div>
        </div>
    );
}

function levelOf(declaration: PythonDeclaration): number {
    return declaration.path().length - 2;
}

function isSelected(declaration: PythonDeclaration, selection: PythonDeclaration): boolean {
    return declaration.path().join() === selection.path().join();
}
