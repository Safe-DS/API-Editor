import {IconDefinition} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, {useState} from "react";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import {ChildrenProp, Setter} from "../../util/types";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import TreeNodeCSS from "./TreeNode.module.css";
import {Link} from "react-router-dom";
import {useLocation} from "react-router";

interface TreeNodeProps extends ChildrenProp {
    declaration: PythonDeclaration
    icon: IconDefinition
    isExpandable: boolean
    isWorthClicking: boolean
}

export default function TreeNode(props: TreeNodeProps): JSX.Element {
    const [showChildren, setShowChildren] = useState(false);

    const className = classNames({
        [TreeNodeCSS.selected]: isSelected(props.declaration),
        "text-muted": !props.isWorthClicking
    });

    const level = levelOf(props.declaration);
    const style = {
        paddingLeft: (level === 0 ? '1rem' : `calc(0.5 * ${level} * (1.25em + 0.25rem) + 1rem)`)
    };

    const handleClick = () => {
        setShowChildren(prevState => !prevState);
    };

    return (
        <div className={TreeNodeCSS.treeNode}>
            <div className={className} style={style} onClick={handleClick}>
                <VisibilityIndicator
                    className={TreeNodeCSS.icon}
                    hasChildren={props.isExpandable}
                    showChildren={showChildren}
                    isSelected={isSelected(props.declaration)}
                />
                <FontAwesomeIcon
                    className={TreeNodeCSS.icon}
                    icon={props.icon}
                    fixedWidth
                />
                <Link to={`/${props.declaration.path().join("/")}`}>{props.declaration.name}</Link>
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

function isSelected(declaration: PythonDeclaration): boolean {
    return `/${declaration.path().join("/")}` === useLocation().pathname;
}
