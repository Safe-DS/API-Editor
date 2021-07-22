import React, {useState} from 'react';
import {Nav, Navbar, NavDropdown, NavItem} from "react-bootstrap";
import Feedback from "react-bootstrap/Feedback";
import {NavLink} from "react-router-dom";
import {useLocation} from "react-router";
import {PythonFilter} from "../../model/python/PythonFilter";
import MenuCSS from "./Menu.module.css";
import classNames from "classnames";
import ImportAnnotationFileDialog from "../Dialog/ImportAnnotationFileDialog";
import ImportPythonPackageDialog from "../Dialog/ImportPythonPackageDialog";
import {Setter} from "../../util/types";
import PythonPackage from "../../model/python/PythonPackage";
import AnnotationStore from "../../model/annotation/AnnotationStore";
import {Form} from "react-bootstrap";


interface MenuProps {
    setPythonPackage: Setter<PythonPackage>
    annotationStore: AnnotationStore
    setAnnotationStore: Setter<AnnotationStore>,
    filter: string,
    setFilter: Setter<string>
}

export default function Menu(props: MenuProps): JSX.Element {

    const openImportAnnotationFileDialog = () => setShowImportAnnotationFileDialog(true);
    const openImportPythonPackageDialog = () => setShowImportPythonPackageDialog(true);

    const [showImportAnnotationFileDialog, setShowImportAnnotationFileDialog] = useState(false);
    const [showImportPythonPackageDialog, setShowImportPythonPackageDialog] = useState(false);

    const pathname = useLocation().pathname.split("/").slice(1);
    const cssClasses = classNames(MenuCSS.menu, "justify-content-between");

    const exportAnnotations = () => {
        props.annotationStore.downloadAnnotations(props.annotationStore.toJson());
    };

    return (
        <Navbar className={cssClasses} bg="light" expand="lg">
            <Navbar.Text>{
                pathname.map((x, i) => (
                    <React.Fragment key={i}>
                        {i !== 0 &&
                        <span> / </span>
                        }
                        <NavLink className={MenuCSS.breadcrumbLink}
                                 to={`/${pathname.slice(0, i + 1).join("/")}`}>{x}</NavLink>
                    </React.Fragment>
                ))}
            </Navbar.Text>
            <Nav>
                <NavDropdown title="Import" id="import-dropdown" align="end">
                    <NavDropdown.Item onClick={openImportPythonPackageDialog}>Python Package</NavDropdown.Item>
                    <NavDropdown.Item onClick={openImportAnnotationFileDialog}>Annotation File</NavDropdown.Item>
                </NavDropdown>

                <Nav.Link onClick={exportAnnotations} href="#">
                    Export
                </Nav.Link>

                <NavItem>
                    <Form.Control
                        type="text"
                        placeholder="Filter..."
                        value={props.filter}
                        onChange={event => props.setFilter(event.target.value)}
                        isValid={PythonFilter.fromFilterBoxInput(props.filter)?.isFiltering()}
                        isInvalid={!PythonFilter.fromFilterBoxInput(props.filter)}
                        spellCheck={false}
                    />
                    <Feedback type="invalid" tooltip>Each scope must only be used once.</Feedback>
                </NavItem>
            </Nav>
            {showImportAnnotationFileDialog && <ImportAnnotationFileDialog isVisible={showImportAnnotationFileDialog}
                                                                           setIsVisible={setShowImportAnnotationFileDialog}
                                                                           setAnnotationStore={props.setAnnotationStore}
            />}
            {showImportPythonPackageDialog && <ImportPythonPackageDialog isVisible={showImportPythonPackageDialog}
                                                                         setIsVisible={setShowImportPythonPackageDialog}
                                                                         setPythonPackage={props.setPythonPackage}
                                                                         setAnnotationStore={props.setAnnotationStore}
                                                                         setFilter={props.setFilter}
            />}
        </Navbar>
    );
}
