import { skeleton } from '@skeletonlabs/tw-plugin';

module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'], // 确保路径正确
    theme: {
        extend: {},
    },
    plugins: [
        skeleton({
            themes: {
                preset: [
                    {
                        name: 'skeleton',
                        enhancements: true,
                    },
                ],
            },
        }),
    ],
};