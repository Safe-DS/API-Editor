import React from 'react'
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";
import PythonFunction from "../../model/PythonFunction";

type TreeProps = {
    pythonPackage: PythonPackage,
    setParameters: any,
    selection: string[],
    setSelection: any,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

const Tree = ({pythonPackage, setParameters, selection, setSelection, setSelectedFunction}: TreeProps) => {

    const path = [pythonPackage.name];

    return (
        <div className="tree">
            {pythonPackage.modules.map(module => (
                <ModuleNode parentPath={path}
                            key={module.name}
                            pythonModule={module}
                            selection={selection}
                            setSelection={setSelection}
                            setParameters={setParameters}
                            setSelectedFunction={setSelectedFunction}
                />
            ))}
        </div>
    );
}

export default Tree;