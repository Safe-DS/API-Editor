import React, {useState} from 'react';
import {HashRouter} from "react-router-dom";
import pythonPackageJson from "../../data/sklearn.json";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {PythonFilter} from "../../model/python/PythonFilter";
import PythonPackage from "../../model/python/PythonPackage";
import {parsePythonPackageJson, PythonPackageJson} from "../../model/python/PythonPackageBuilder";
import Menu from "../Menu/Menu";
import SelectionView from "../SelectionView/SelectionView";
import TreeView from "../TreeView/TreeView";
import AppCSS from './App.module.css';

export default function App(): JSX.Element {
    const [pythonPackage, setPythonPackage] = useState<PythonPackage>(parsePythonPackageJson(pythonPackageJson as PythonPackageJson));
    const initialJSON = JSON.parse('{"renamings":{},"enums":{}}');
    initialJSON["renamings"] = new Map();
    initialJSON["enums"] = new Map();
    const [annotationStore, setAnnotationStore] = useState(AnnotationStore.fromJson(initialJSON));
    const [filter, setFilter] = useState("");

    const pythonFilter = PythonFilter.fromFilterBoxInput(filter);
    const filteredPythonPackage = pythonPackage.filter(pythonFilter);

    return (
        <HashRouter>
            <div className={AppCSS.app}>
                <div className={AppCSS.menu}>
                    <Menu setPythonPackage={setPythonPackage}
                          annotationStore={annotationStore}
                          setAnnotationStore={setAnnotationStore}
                          filter={filter}
                          setFilter={setFilter}
                    />
                </div>
                <div className={AppCSS.leftPane}>
                    <TreeView pythonPackage={filteredPythonPackage}/>
                </div>
                <div className={AppCSS.rightPane}>
                    <SelectionView pythonPackage={filteredPythonPackage}
                                   annotationStore={annotationStore}
                                   setAnnotationStore={setAnnotationStore}/>
                </div>
            </div>
        </HashRouter>
    );
}
