import { HStack, Icon, Tag, Text as ChakraText } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import PythonDeclaration from '../model/PythonDeclaration';
import {
    HeatMapMode,
    selectHeatMapMode,
    selectIsExpandedInTreeView,
    toggleIsExpandedInTreeView,
} from '../packageDataSlice';
import VisibilityIndicator from './VisibilityIndicator';
import AbstractPythonFilter from '../model/filters/AbstractPythonFilter';
import { selectAnnotations } from '../../annotations/annotationSlice';

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

function HeatMapTag(boxWidth: number, heatColor: string, opacity: number, specificValue: number) {
    return <Tag
        width={boxWidth}
        justifyContent="center"
        bg={heatColor}
        variant="solid"
        fontWeight="900"
        size="sm"
        opacity={opacity}
    >
        {specificValue}
    </Tag>;
}

const TreeNode: React.FC<TreeNodeProps> = function ({
    declaration,
    icon,
    isExpandable,
    filter,
    maxValue,
    specificValue = 0,
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

    const linear = useAppSelector(selectHeatMapMode) === HeatMapMode.Annotations;
    const displayHeatMap = useAppSelector(selectHeatMapMode) !== HeatMapMode.None;
    const opacity = maxValue !== undefined ? 1 : 0;
    const boxWidth = maxValue !== undefined ? maxValue.toString().length * 6.7 : 0;
    const heatColor = getColorFromValue(maxValue as number, specificValue, linear);

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
            {displayHeatMap && HeatMapTag(boxWidth, heatColor, opacity, specificValue)}
            <Icon as={icon} />
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
    if (specificValue <= 0 || maxValue <= 0) return 'rgb(0%, 0%, 255%)';
    if (specificValue > maxValue) return 'rgb(255%, 0%, 0%)';

    let percentage = linear ? specificValue / maxValue : Math.log(specificValue + 1) / Math.log(maxValue + 1);
    const value = percentage * 255;

    return `rgb(${value}%, 0%, ${255 - value}%)`;
};

export default TreeNode;
