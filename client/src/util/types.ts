import React from "react";

export type Nullable<T> = T | null

export type Getter<T> = () => T
export type Setter<T> = (newValue: T) => void

export interface ClassNameProp {
    className?: string
}

export interface ChildrenProp {
    children?: React.ReactNode
}

export interface BaseProps extends ClassNameProp, ChildrenProp {

}
