<script lang="ts">
    import { goto } from '$app/navigation';
    import { _ } from 'svelte-i18n';
    import { PUBLIC_PAGE_SIZE, PUBLIC_PAGE_SIZE_LIST } from '$env/static/public';
	  import Pagination from '$lib/components/Pagination.svelte';
	  import dayjs from 'dayjs';

    let { data } = $props();

    let userList = $state(data.userList);
    let total = $state(data.total);
    let pageCount = $state(data.pageCount || 1);
    let searchQuery = $state(data.form.query);
    let page = $state(data.form.page || 1);
    let pageSize = $state(data.form.pageSize || Number(PUBLIC_PAGE_SIZE));
    let hiddens = $state([{"name": "query", "value": searchQuery}]);
    
    function handleAddUser() {
        goto('/app/agents/users/edit');
    }

    function handleEditUser(id: number) {
        goto(`/app/agents/users/edit?id=${id}`);
    }
</script>

<div class="container mx-auto p-4 space-y-4">
  <!-- 搜索和添加按钮区域 -->
  <div class="flex flex-col gap-4">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <form 
        action="?/search" 
        method="POST" 
        class="flex flex-col gap-2 w-full sm:w-auto"
      >
        <div class="flex gap-2">
          <input
            type="text"
            name="query"
            value={searchQuery}
            placeholder={$_('agent.users.list.search.placeholder')}
            class="input w-full sm:w-64 preset-outlined-surface-500"
          />
          <button type="submit" class="btn preset-outlined-primary-500">
            {$_('buttons.search')}
          </button>
        </div>
      </form>
      <button type="button" class="btn preset-outlined-primary-500" onclick={handleAddUser}>
        {$_('buttons.add')}
      </button>
    </div>
  </div>
  <hr class="text-surface-500">
  <div class="card p-4">
    <div class="table-none table-fixed">
      <table class="table table-auto">
        <thead>
          <tr>
            <th class="text-center">#</th>
            <th>{$_('common.agent')}</th>
            <th>{$_('agent.users.list.table.columns.email')}</th>
            <th>{$_('agent.users.list.table.columns.phone')}</th>
            <th>{$_('agent.users.list.table.columns.status')}</th>
            <th>{$_('agent.users.list.table.columns.createDate')}</th>
            <th>{$_('agent.users.list.table.columns.actions')}</th>
          </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
          {#each userList as {app_user: editUser, outlet}, index}
            <tr>
              <td>{index + 1}
                <input type="hidden" value={editUser.id}>
              </td>
              <td>{outlet?.name}</td>
              <td>{editUser.email}</td>
              <td>{editUser.phoneNumber}</td>
              <td>
                {#if editUser.accountEnabled}
                    <span class="badge preset-filled-success-500">{$_('common.enabled')}</span>
                {:else}
                    <span class="badge preset-filled-error-500">{$_('common.disabled')}</span>
                {/if}
              </td>
              <td>{dayjs((editUser.createDate || editUser.updateDate)).format('YYYY-MM-DD')}</td>
              <td>
                <button class="btn preset-outlined-primary-500"
                  onclick={() => handleEditUser(editUser.id as number)}>
                  {$_('buttons.edit')}
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <span>{$_('agent.users.list.total').replace('{count}', total.toString())}</span>
      <Pagination bind:pageSize={pageSize} bind:page={page} bind:pageCount={pageCount} />
    </div>
  </div>
</div>

<style>
    :global(.pagination) {
        display: flex;
        gap: 0.5rem;
    }
    :global(.pagination button) {
        padding: 0.5rem 1rem;
        border: 1px solid var(--color-surface-500);
        border-radius: 0.25rem;
        background: transparent;
        cursor: pointer;
    }
    :global(.pagination button.active) {
        background: var(--color-primary-500);
        color: white;
        border-color: var(--color-primary-500);
    }
    :global(.pagination button:hover:not(.active)) {
        background: var(--color-surface-100);
    }
    :global(.pagination button:disabled) {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>

