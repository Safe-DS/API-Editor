import { Breadcrumb, BreadcrumbItem } from '@chakra-ui/react';
import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectRawPythonPackage } from '../packageData/apiSlice';
import { PythonPackage } from '../packageData/model/PythonPackage';

export const SelectionBreadcrumbs = function () {
    const pythonPackage = useAppSelector(selectRawPythonPackage);
    const selectedDeclaration = pythonPackage.getDeclarationById(useLocation().pathname.split('/').splice(1).join('/'));

    if (!selectedDeclaration || selectedDeclaration instanceof PythonPackage) {
        return null;
    }

    const declarations = [...selectedDeclaration.ancestorsOrSelf()].reverse().splice(1);

    return (
        <Breadcrumb>
            {declarations.map((it) => (
                <BreadcrumbItem>
                    <RouterLink to={it.id}>{it.name}</RouterLink>
                </BreadcrumbItem>
            ))}
        </Breadcrumb>
    );
};
