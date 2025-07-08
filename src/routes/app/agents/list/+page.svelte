<script lang="ts">
  import { goto } from '$app/navigation';
  import { _ } from 'svelte-i18n';
	import dayjs from 'dayjs';

  let { data } = $props();
  
  //搜索的form提交action后，画面会刷新，数据会重新加载
  //需要重新取回发送给服务器的表单数据，以保持画面检索条件不变
  let searchQuery = $state(data.form.query);
  let agents = $state(data.agents);
  let agentMap = $state(data.agentMap);
  
  function handleAddAgent() {
    goto('/app/agents/edit');
  }

  function handleEditAgent(id: number) {
    goto(`/app/agents/edit?id=${id}`);
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
            placeholder={$_('agent.list.search.placeholder')}
            class="input w-full sm:w-64 preset-outlined-surface-500"
          />
          <button type="submit" class="btn preset-outlined-primary-500">
            {$_('buttons.search')}
          </button>
        </div>
      </form>
      <button type="button" class="btn preset-outlined-primary-500" onclick={handleAddAgent}>
        {$_('buttons.add')}
      </button>
    </div>
  </div>
  <hr class="text-surface-500">
  <!-- 代理商列表表格 -->
  <div class="card p-4">
    <div class="table-none table-fixed">
      <table class="table table-auto">
        <thead>
          <tr>
            <th>#</th>		
            <th>{$_('agent.list.table.columns.level')}</th>
            <th>{$_('agent.list.table.columns.parent')}</th>
            <th>{$_('agent.list.table.columns.name')}</th>
            <th>{$_('agent.list.table.columns.state')}</th>
            <th>{$_('agent.list.table.columns.city')}</th>
            <th>{$_('agent.list.table.columns.phone')}</th>
            <th>{$_('agent.list.table.columns.email')}</th>
            <th>{$_('agent.list.table.columns.remark')}</th>
            <th>{$_('agent.list.table.columns.createDate')}</th>
            <th>{$_('agent.list.table.columns.updateDate')}</th>
            <th>{$_('agent.list.table.columns.actions')}</th>
          </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
          {#each agents as agent, index}
            <tr>
              <td>{index + 1}</td>
              <td>{$_('agent.levels.' + agent.type)}</td>
              <td>{#if agent.deptId == 0}
                {agent.name}
              {:else}
                {agentMap[agent.deptId as keyof typeof agentMap]}
              {/if}</td>
              <td>{agent.name}</td>  
              <td>{agent.state}</td>
              <td>{agent.city}</td>
              <td>{agent.phone}</td>
              <td>{agent.email}</td>
              <td>{agent.remark}</td>
              <td>{agent.createDate ? dayjs(agent.createDate).format("YYYY-MM-DD") : ""}</td>
              <td>{agent.updateDate ? dayjs(agent.updateDate).format("YYYY-MM-DD") : ""}</td>
              <td>
                <input type="hidden" name="id" value={agent.id} />
                <button class="btn preset-outlined-primary-500"
                  onclick={() => handleEditAgent(agent.id as number)}>
                  {$_('buttons.edit')}
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>