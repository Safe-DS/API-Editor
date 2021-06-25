import React, {useState} from "react";
import PythonClass from "../../model/PythonClass";
import classNames from "classnames";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../util/listOperations";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChalkboard} from "@fortawesome/free-solid-svg-icons";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import PythonDeclaration from "../../model/PythonDeclaration";

type ClassNodeProps = {
    pythonClass: PythonClass,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>,
    moduleName: string,
};

export default function ClassNode({pythonClass,
                                   selection,
                                   setSelection}: ClassNodeProps): JSX.Element {

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
        <div className="class-node">
            <div className={cssClasses}
                 onClick={handleClick}>
                <VisibilityIndicator hasChildren={hasMethods} childrenVisible={childVisible}/>
                <FontAwesomeIcon icon={faChalkboard}/>
                {" "}
                <span> {pythonClass.name} </span>
            </div>
            {hasMethods && childVisible && <div>
                {pythonClass.methods.map(method => (
                    <FunctionNode key={method.name}
                                  pythonFunction={method}
                                  selection={selection}
                                  setSelection={setSelection}
                                  isMethod={true}/>
                ))}
            </div>}
        </div>
    );
}
