import { createToaster } from '@skeletonlabs/skeleton-svelte';

export const generateToaster = () => {
    return createToaster({
        placement: 'top',
        max: 2,
        duration: 2000,
        removeDelay: 100
    });
}