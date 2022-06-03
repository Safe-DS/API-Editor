import {HStack, Icon, Tag, Text as ChakraText} from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../model/PythonDeclaration';
import {
    HeatMapData,
    selectHeatMapData,
    selectIsExpandedInTreeView,
    toggleIsExpandedInTreeView
} from '../packageDataSlice';
import VisibilityIndicator from './VisibilityIndicator';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import {selectAnnotations} from '../../annotations/annotationSlice';

interface TreeNodeProps {
    declaration: PythonDeclaration;
    icon: IconType;
    isExpandable: boolean;
    filter: AbstractPythonFilter;
    maxValue?: number;
    specificValue?: number;
}

export class ValuePair {
    specificValue: number | undefined;
    maxValue: number | undefined;

    constructor(specificValue: number | undefined, maxValue: number | undefined) {
        this.specificValue = specificValue;
        this.maxValue = maxValue;
    }
}

const TreeNode: React.FC<TreeNodeProps> = function ({
    declaration,
    icon,
    isExpandable,
    filter,
    maxValue,
    specificValue,
}) {
    const currentPathname = useLocation().pathname;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const showChildren = useAppSelector(selectIsExpandedInTreeView(declaration.pathAsString()));
    const annotations = useAppSelector(selectAnnotations);

    const level = levelOf(declaration);
    const paddingLeft = level === 0 ? '1rem' : `${1 + 0.75 * level}rem`;
    const backgroundColor = isSelected(declaration, currentPathname) ? 'cornflowerblue' : undefined;
    const color = isSelected(declaration, currentPathname) ? 'white' : undefined;

    const fontWeight = filter.shouldKeepDeclaration(declaration, annotations) ? 'bold' : undefined;

    const handleClick = () => {
        dispatch(toggleIsExpandedInTreeView(declaration.pathAsString()));
        navigate(`/${declaration.pathAsString()}`);
    };

    const linear = useAppSelector(selectHeatMapData) === HeatMapData.Annotations;
    const display_heat_map = useAppSelector(selectHeatMapData) !== HeatMapData.None;
    const opacity = (maxValue !== undefined) ? 1 : 0;
    const box_width = (maxValue !== undefined) ? (maxValue.toString().length) * 6.7 : 0;
    specificValue = (specificValue === undefined) ? 0 : specificValue;
    const heat_color = getColorFromValue(maxValue as number, specificValue, linear);
    console.log(test(1, 2));
    return (
        <HStack
            userSelect="none"
            cursor="pointer"
            color={color}
            backgroundColor={backgroundColor}
            paddingLeft={paddingLeft}
            onClick={handleClick}
        >
            <VisibilityIndicator
                hasChildren={isExpandable}
                showChildren={showChildren}
                isSelected={isSelected(declaration, currentPathname)}
            />
            {display_heat_map && (
                    <Tag
                        width={box_width}
                        display="flex"
                        justifyContent="center"
                        bg={heat_color}
                        variant="solid"
                        fontWeight="900"
                        size="sm"
                        opacity={opacity}
                    >
                        {specificValue}
                    </Tag>
            )}
            <Icon as={icon}/>
            <ChakraText fontWeight={fontWeight}>{declaration.getUniqueName()}</ChakraText>
        </HStack>
    );
};

const levelOf = function (declaration: PythonDeclaration): number {
    return declaration.path().length - 2;
};

const isSelected = function (declaration: PythonDeclaration, currentPathname: string): boolean {
    return `/${declaration.pathAsString()}` === currentPathname;
};

const getColorFromValue = function (maxValue: number, specificValue: number, linear: boolean): string {
    maxValue++;
    specificValue++;

    if (specificValue <= 0 || maxValue <= 0)
        return 'rgb(0%, 0%, 255%)';
    if (specificValue > maxValue)
        return 'rgb(255%, 0%, 0%)';

    let percentage = (linear) ? (specificValue / maxValue) : Math.log(specificValue + 1) / Math.log(maxValue + 1);
    const value = percentage * 255;

    return `rgb(${value}%, 0%, ${255 - value}%)`;
};

const test = function (a: number, b : number) {
    return Math.log(b) / Math.log(a);
}

export default TreeNode;
