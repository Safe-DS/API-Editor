import React from "react";
import PythonImport from "../../model/python/PythonImport";
import TitleValueViewPair from "./TitleValueViewPair";

interface ModuleImportItemProps {
    inputImport: PythonImport
}

export default function ModuleImportItem(props: ModuleImportItemProps): JSX.Element {
    return (
        <>
            {props.inputImport.module ? <TitleValueViewPair title={"Module"} value={props.inputImport.module}/> : ""}
            {props.inputImport.alias ? <TitleValueViewPair title={"Alias"} value={props.inputImport.alias}/> : ""}
        </>
    );
}
