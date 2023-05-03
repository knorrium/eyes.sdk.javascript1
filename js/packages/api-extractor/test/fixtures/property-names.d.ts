export type T = {
    regularProperty: boolean;
    regularStringProperty: boolean;
    '@stringOnlyProperty': boolean;
    calculatedStringProperty: boolean;
    '@calculatedStringOnlyProperty': boolean;
    [Symbol.iterator]: boolean;
};
