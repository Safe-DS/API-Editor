import React from "react";
import PythonImport from "../../model/python/PythonImport";

interface ModuleImportItemProps {
    inputImport: PythonImport
}

export default function ModuleImportItem(props: ModuleImportItemProps): JSX.Element {
    return (
        <>
            <div>{"Module: " + props.inputImport.module}</div>
            <div>{props.inputImport.alias ? "Alias: " + props.inputImport.alias : ""}</div>
        </>
    );
}
