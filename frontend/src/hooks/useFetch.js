import { useState, useEffect, useCallback } from 'react';
export function useFetch(fetchFn, options = {}) {
    const { immediate = true } = options;
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(immediate);
    const [error, setError] = useState(null);
    const execute = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
            return result;
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
            throw err;
        }
        finally {
            setIsLoading(false);
        }
    }, [fetchFn]);
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);
    return { data, isLoading, error, execute, setData };
}
//# sourceMappingURL=useFetch.js.map