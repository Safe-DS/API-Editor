import React from "react";

export type Nullable<T> = T | null

export type Getter<T> = () => T
export type Setter<T> = (newValue: T) => void

export interface ClassNameProp {
    className?: string
}

// TODO remove once the type of functional components is set to React.FC<T>
export interface ChildrenProp {
    children?: React.ReactNode
}

export interface BaseProps extends ClassNameProp, ChildrenProp {

}
