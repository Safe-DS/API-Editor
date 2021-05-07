import React from 'react'
import Tree from "../Tree/Tree";
import PythonPackage from "../../model/PythonPackage";
import PythonModule from "../../model/PythonModule";
import PythonClass from "../../model/PythonClass";
import PythonParameter from "../../model/PythonParameter";
import PythonFunction from "../../model/PythonFunction";
import PythonReturnType from "../../model/PythonReturnType";

let returnType1 = new PythonReturnType();
let parameter1 = new PythonParameter(
    "parameter1", "type", true, "defaultValue", null, false, "Hello World"
);
let function1 = new PythonFunction(
    "function1", [""], [parameter1], false, returnType1,"docstring"
);
let superclass1 = new PythonClass("superclass1", [""], [], "docstring");
let class1 = new PythonClass("class1", [""], [superclass1], "docstring");
let class2 = new PythonClass("class2", [""], [superclass1], "docstring");
let module1 = new PythonModule("module1", [], [class1,class2], [function1]);
let treeDummyData = new PythonPackage("package", [module1]);

const TreeView = () => {
    return(
        <div className="treeViewDiv">
            <h2>Unstyled Tree Example</h2>
            <div>
                <Tree inputPackage={treeDummyData}/>
            </div>
        </div>
    )
}

export default TreeView;