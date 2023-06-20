export function f(arg?: undefined | U): void;
export type U = "2" | "1" | "3";
export interface I {
    u?: undefined | U;
    y?: undefined | U;
}
