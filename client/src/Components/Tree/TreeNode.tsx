import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, {useState} from "react";
import PythonDeclaration from "../../model/PythonDeclaration";
import {ChildrenProp, Setter} from "../../util/types";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import TreeNodeCSS from "./TreeNode.module.css";

interface TreeNodeProps extends ChildrenProp {
    declaration: PythonDeclaration
    icon: IconDefinition
    isExpandable: boolean
    isWorthClicking: boolean
    selection: PythonDeclaration
    setSelection: Setter<PythonDeclaration>
}

export default function TreeNode(props: TreeNodeProps): JSX.Element {
    const [showChildren, setShowChildren] = useState(false);

    const className = classNames({
        [TreeNodeCSS.selected]: isSelected(props.declaration, props.selection),
        "text-muted": !props.isWorthClicking
    });

    const level = levelOf(props.declaration);
    const style = level === 0 ? {paddingLeft: '1rem'} : {
        paddingLeft: `calc(${level} * (1.25em + 0.25rem) + 1rem)`
    };

    const handleClick = () => {
        setShowChildren(prevState => !prevState);
        props.setSelection(props.declaration);
    };

    return (
        <div className={TreeNodeCSS.treeNode}>
            <div className={className} style={style} onClick={handleClick}>
                <VisibilityIndicator
                    className={TreeNodeCSS.icon}
                    hasChildren={props.isExpandable}
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
