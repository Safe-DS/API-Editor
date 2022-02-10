export type Optional<T> = T | undefined | null;

export type Getter<T> = () => T;
export type Setter<T> = (newValue: T) => void;
