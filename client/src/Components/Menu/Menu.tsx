import React from 'react';
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import PythonDeclaration from "../../model/python/PythonDeclaration";
import {useLocation} from "react-router";

interface MenuProps {
    selection: PythonDeclaration
}

export default function Menu(props: MenuProps): JSX.Element {
    return (
        <Navbar className="Menu justify-content-between" bg="light" expand="lg">
            <Navbar.Text>{
                useLocation().pathname.split("/").slice(1).map((x, i)=>(
                    <React.Fragment key={i}>
                        <span> / </span>
                        <NavLink to={`/${useLocation().pathname.split("/").slice(1, i + 2).join("/")}`}>{x}</NavLink>
                    </React.Fragment>
                ))}
            </Navbar.Text>
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
