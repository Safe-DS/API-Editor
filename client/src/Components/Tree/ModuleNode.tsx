import React, {useState} from "react";
import ClassNode from "./ClassNode";
import FunctionNode from "./FunctionNode";
import {isEmptyList} from "../../util/listOperations";
import classNames from "classnames";
import PythonModule from "../../model/PythonModule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArchive} from "@fortawesome/free-solid-svg-icons";
import VisibilityIndicator from "../Util/VisibilityIndicator";
import PythonDeclaration from "../../model/PythonDeclaration";

type ModuleNodeProps = {
    pythonModule: PythonModule,
    selection: PythonDeclaration,
    setSelection: Setter<PythonDeclaration>
};

export default function ModuleNode({pythonModule,
                                    selection,
                                    setSelection}: ModuleNodeProps): JSX.Element {

    const [childVisible, setChildVisibility] = useState(false);
    const hasClasses = !isEmptyList(pythonModule.classes);
    const hasFunctions = !isEmptyList(pythonModule.functions);
    const hasChildren = hasClasses || hasFunctions;

    const cssClasses = classNames(
        "tree-view-row", {
            "text-muted": !hasChildren,
            "cursor-na": !hasChildren,
            "pl-2rem": !hasChildren,
            "pl-1-5rem": hasChildren,
            "selected": (selection.path().join() === pythonModule.path().join()) && hasChildren
        }
    );

    const handleClick = function() {
        setSelection(pythonModule);
        setChildVisibility(!childVisible);
    };

    return (
        <div className="module-node">
            <div className={cssClasses}
                 onClick={handleClick}>
                <VisibilityIndicator hasChildren={hasClasses || hasFunctions} childrenVisible={childVisible}/>
                <FontAwesomeIcon icon={faArchive} />
                {" "}
                <span>
                    {pythonModule.name}
                </span>
            </div>
            <div>
                {hasClasses && childVisible && <div>
                    {pythonModule.classes.map(moduleClass => (
                        <ClassNode key={moduleClass.name}
                                   pythonClass={moduleClass}
                                   selection={selection}
                                   setSelection={setSelection}
                                   moduleName={pythonModule.name}/>
                    ))}
                </div>}
                {hasFunctions && childVisible && <div>
                    {pythonModule.functions.map(moduleFunction => (
                        <FunctionNode key={moduleFunction.name}
                                      pythonFunction={moduleFunction}
                                      selection={selection}
                                      setSelection={setSelection}/>
                    ))}
                </div>}
            </div>
        </div>
    );
}
