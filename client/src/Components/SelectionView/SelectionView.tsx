import React from "react";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import PythonFunction from "../../model/python/PythonFunction";
import {Setter} from "../../util/types";
import ClassView from "./ClassView";
import PythonClass from "../../model/python/PythonClass";
import ModuleView from "./ModuleView";
import PythonModule from "../../model/python/PythonModule";
import ParameterView from "./ParameterView";
import PythonParameter from "../../model/python/PythonParameter";
import NewParameterView from "./NewParameterView";

interface SelectionViewProps {
    selection: PythonDeclaration,
    annotationStore: AnnotationStore,
    setAnnotationStore: Setter<AnnotationStore>,
}

export default function SelectionView(props: SelectionViewProps): JSX.Element {
    return (
        <div className="parameter-view">
            {props.selection instanceof PythonFunction &&
            <ParameterView pythonFunction={props.selection} annotationStore={props.annotationStore}
                           setAnnotationStore={props.setAnnotationStore}/>
            }
            {props.selection instanceof PythonClass &&
            <ClassView pythonClass={props.selection}/>
            }
            {props.selection instanceof PythonModule &&
            <ModuleView pythonModule={props.selection}/>
            }
            {props.selection instanceof PythonParameter &&
            <NewParameterView pythonParameter={props.selection}/>}
        </div>
    );
}
