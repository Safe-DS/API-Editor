import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../util/listOperations";
import {faChalkboard} from "@fortawesome/free-solid-svg-icons";
import PythonDeclaration from "../../model/PythonDeclaration";
import TreeNode from "./TreeNode";

type ClassNodeProps = {
    pythonClass: PythonClass,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>,
    moduleName: string,
};

export default function ClassNode({
                                      pythonClass,
                                      selection,
                                      setSelection
                                  }: ClassNodeProps): JSX.Element {

    const [childVisible, setChildVisibility] = useState(false);
    const hasMethods = !isEmptyList(pythonClass.methods);
    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasMethods,
            "cursor-na": !hasMethods,
            "pl-3-5rem": !hasMethods,
            "pl-3rem": hasMethods,
            "selected": (selection.path().join() === pythonClass.path().join()) && hasMethods
        }
    );

    const handleClick = function () {
        setSelection(pythonClass);
        setChildVisibility(!childVisible);
    };

    return (
        <TreeNode
            className={cssClasses}
            icon={faChalkboard}
            hasChildren={hasMethods}
            level={1}
            name={pythonClass.name}
            onClick={handleClick}
            showChildren={childVisible}
        >
            {pythonClass.methods.map(method => (
                <FunctionNode key={method.name}
                              pythonFunction={method}
                              selection={selection}
                              setSelection={setSelection}
                              isMethod={true}/>
            ))}
        </TreeNode>
    );
}
