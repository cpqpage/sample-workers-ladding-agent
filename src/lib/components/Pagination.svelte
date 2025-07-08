<script lang="ts">
	import { PUBLIC_PAGE_SIZE_LIST } from '$env/static/public';
    import { _ } from 'svelte-i18n';
    import { tick } from 'svelte';

    let {
        pageSize = $bindable(),
        page = $bindable(),
        pageCount = $bindable(),
        base = 'flex items-center gap-2' } = $props();
    let pageSizeList = PUBLIC_PAGE_SIZE_LIST.split(',').map(Number);
    
    async function gotoPage(pageNumber: number) {
        if(pageNumber < 1) {
            pageNumber = 1;
        }
        if(pageNumber > pageCount) {
            pageNumber = pageCount;
        }
        page = pageNumber;
        await tick();// 等待所有挂起的 DOM 更新完成
        // 触发搜索以更新数据
        const form = document.querySelector('form[action="?/gotoPage"]') as HTMLFormElement;
        if (form) {
            form.requestSubmit();
        }
    }
</script>
<form action="?/gotoPage" class={base} method="POST">
    <span>{$_('pagination.itemsPerPage')}</span>
    <select 
        name="pageSize"
        bind:value={pageSize}
        class="select w-20 preset-outlined-surface-500"
        onchange={() => {
            gotoPage(1);
        }}
    >
        {#each pageSizeList as size}
            <option value={size}>{size}</option>
        {/each}
    </select>
    <span>{$_('pagination.items')}</span>
    <span>{$_('pagination.page')}</span>
    <input type="input"
        class="input w-16 preset-outlined-surface-500" 
        name="page" 
        bind:value={page}
        onchange={() => {
            gotoPage(page);
        }}
    />
    <span> {$_('pagination.of')} {pageCount} {$_('pagination.pages')}</span>
    <button class="btn preset-outlined-primary-500"
        disabled={page <= 1}
        onclick={() => gotoPage(page - 1)}>{$_('pagination.previous')}</button>
    <button class="btn preset-outlined-primary-500"
        disabled={page >= pageCount}
        onclick={() => gotoPage(page + 1)}>{$_('pagination.next')}</button>
</form>