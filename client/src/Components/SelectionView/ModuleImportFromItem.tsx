import React from "react";
import PythonFromImport from "../../model/python/PythonFromImport";
import TitleValueViewPair from "./TitleValueViewPair";

interface ModuleImportFromItemProps {
    inputImportFrom: PythonFromImport
}

export default function ModuleImportFromItem(props: ModuleImportFromItemProps): JSX.Element {
    return (
        <>
            <TitleValueViewPair title="Module" value={props.inputImportFrom.module}/>
            <TitleValueViewPair title="Declaration" value={props.inputImportFrom.declaration}/>
            <TitleValueViewPair title="Alias" value={props.inputImportFrom.alias}/>
        </>
    );
}
