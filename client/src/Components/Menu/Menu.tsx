import React from 'react';
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import PythonDeclaration from "../../model/python/PythonDeclaration";

interface MenuProps {
    selection: PythonDeclaration
}

export default function Menu(props: MenuProps): JSX.Element {
    return (
        <Navbar className="Menu justify-content-between" bg="light" expand="lg">
            <Navbar.Text>{props.selection.path().join("/")}</Navbar.Text>
            <Nav>
               <NavDropdown title="Import" id="import-dropdown" align="end">
                   <NavDropdown.Item href="#">Python Package</NavDropdown.Item>
                   <NavDropdown.Item href="#">Annotation File</NavDropdown.Item>
               </NavDropdown>
               <Navbar.Text>Export</Navbar.Text>
            </Nav>
        </Navbar>
    );
}
