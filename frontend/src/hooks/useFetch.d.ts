interface UseFetchOptions {
    immediate?: boolean;
}
export declare function useFetch<T>(fetchFn: () => Promise<T>, options?: UseFetchOptions): {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    execute: () => Promise<T>;
    setData: import("react").Dispatch<import("react").SetStateAction<T | null>>;
};
export {};
//# sourceMappingURL=useFetch.d.ts.map