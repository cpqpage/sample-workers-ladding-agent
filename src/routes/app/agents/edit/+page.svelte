<script lang="ts">
  import { _ } from 'svelte-i18n';
  
  const { data } = $props();
  const { editOutlet } = data;
</script>

<div class="container mx-auto p-4 space-y-4">
  <!-- 标题和返回按钮 -->
  <div class="flex justify-between items-center mx-auto w-1/2">
    <h3 class="h3">{$_('agent.edit.title')}</h3>
    <button class="btn  preset-outlined-surface-500" onclick={() => window.location.href = '/app/agents/list'}>
      {$_('agent.edit.back')}
    </button>
  </div>

  <!-- 表单 -->
  <div class="card mx-auto p-4 w-1/2">
    <form 
      action="?/save" 
      method="POST" 
      class="space-y-4"
    >
      <input type="hidden" name="outlet.id" bind:value={editOutlet.id} />
      <input type="hidden" name="outlet.delFlag" bind:value={editOutlet.delFlag} />

      <!-- 代理商名称 -->
      <div class="form-field">
        <label for="name" class="label">{$_('agent.edit.name')}</label>
        <input
          id="name"
          name="outlet.name"
          bind:value={editOutlet.name}
          placeholder={$_('agent.edit.namePlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>

      <!-- 代理商级别 -->
      <div class="form-field">
        <label for="type" class="label">{$_('agent.edit.type')}</label>
        <select 
          id="type"
          name="outlet.type"
          class="select border-surface-500 border-1"
        >
          {#each data.levelMap as level}
            <option value={level.level} selected={Number(editOutlet.type) === level.level}>
             {$_(level.name)}
            </option>
          {/each}
        </select>
      </div>

      <!-- 上级代理商 -->
      <div class="form-field">
        <label for="deptId" class="label">{$_('agent.edit.parent')}</label>
        <select 
          id="deptId"
          name="outlet.dept_id"
          bind:value={editOutlet.deptId}
          class="select border-surface-500 border-1"
        >
          {#each data.agentMap as agent}
            <option value={agent.id}>
              {#if agent.type === '8'}
              &nbsp;&nbsp;&nbsp;&nbsp;
              {/if}
              {agent.name}
            </option>
          {/each}
        </select>
      </div>

      <!-- 省市 -->
      <div class="form-field">
        <label for="state" class="label">{$_('agent.edit.location')}</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            id="country"
            name="outlet.country"
            bind:value={editOutlet.country}
            placeholder={$_('common.country')}
            class="input border-surface-500 border-1"
          />
          <input
            bind:value={editOutlet.state}
            placeholder={$_('common.state')}
            class="input border-surface-500 border-1"
          />
          <input
            id="city"
            name="outlet.city"
            bind:value={editOutlet.city}
            placeholder={$_('common.city')}
            class="input border-surface-500 border-1"
          />
        </div>
      </div>

      <!-- 电话 -->
      <div class="form-field">
        <label for="phone" class="label">{$_('agent.edit.phone')}</label>
        <input 
          id="phone"
          name="outlet.phone"
          bind:value={editOutlet.phone}
          placeholder={$_('agent.edit.phonePlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>

      <!-- 邮箱 -->
      <div class="form-field">
        <label for="email" class="label">{$_('agent.edit.email')}</label>
        <input 
          id="email"
          name="outlet.email"
          bind:value={editOutlet.email}
          placeholder={$_('agent.edit.emailPlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>

      <!-- 备注 -->
      <div class="form-field">
        <label for="remark" class="label">{$_('agent.edit.remark')}</label>
        <input 
          id="remark"
          name="outlet.remark"
          bind:value={editOutlet.remark}
          placeholder={$_('agent.edit.remarkPlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-center">
        <button type="submit" class="btn w-full preset-outlined-primary-500">
          {$_('buttons.save')}
        </button>
      </div>
    </form>
  </div>
</div>