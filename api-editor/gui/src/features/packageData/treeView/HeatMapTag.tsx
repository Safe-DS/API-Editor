import React from "react";
import {Tag} from '@chakra-ui/react';

interface HeatMapTagProps {
    actualValue: number;
    maxValue: number | undefined;
    interpolation: HeatMapInterpolation
}

export enum HeatMapInterpolation {
    LINEAR,
    LOGARITHMIC,
}

export const HeatMapTag: React.FC<HeatMapTagProps> = function ({actualValue, maxValue, interpolation}) {
    const bg = backgroundColor(actualValue, maxValue ?? 0, interpolation);
    const opacity = maxValue === undefined ? 0 : 1;
    const boxWidth = maxValue === undefined ? 0 : maxValue.toString().length * 6.7;

    return <Tag
        bg={bg}
        fontWeight="900"
        justifyContent="center"
        opacity={opacity}
        size="sm"
        variant="solid"
        width={boxWidth}
    >
        {actualValue}
    </Tag>;
}

const backgroundColor = function (actualValue: number, maxValue: number, interpolation: HeatMapInterpolation): string {
    if (actualValue <= 0 || maxValue <= 0) return 'rgb(0, 0, 255)';
    if (actualValue > maxValue) return 'rgb(255, 0, 0)';

    const red = redRatio(actualValue, maxValue, interpolation) * 255;
    const blue = 255 - red;

    return `rgb(${red}, 0, ${blue})`;
};

const redRatio = function (actualValue: number, maxValue: number, interpolation: HeatMapInterpolation): number {
    switch (interpolation) {
        case HeatMapInterpolation.LINEAR:
            return actualValue / maxValue;
        case HeatMapInterpolation.LOGARITHMIC:
            return Math.log(actualValue + 1) / Math.log(maxValue + 1);
    }
}
