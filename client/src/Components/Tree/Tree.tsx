import React from 'react';
import ModuleNode from "./ModuleNode";
import PythonPackage from "../../model/PythonPackage";
import PythonFunction from "../../model/PythonFunction";
import PythonParameter from "../../model/PythonParameter";

type TreeProps = {
    pythonPackage: PythonPackage,
    setParameters: Setter<PythonParameter[]>,
    selection: string[],
    setSelection: Setter<string[]>,
    setSelectedFunction: Setter<Nullable<PythonFunction>>
}

export default function Tree({
                                 pythonPackage,
                                 setParameters,
                                 selection,
                                 setSelection,
                                 setSelectedFunction
                             }: TreeProps): JSX.Element {

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
