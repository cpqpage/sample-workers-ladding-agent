<script lang="ts">
  import { _ } from 'svelte-i18n';
  
  const { data, form } = $props();
  let password = $state('');
  let confirmPassword = $state('');

  if(form?.returnVo){
    // 如果表单返回值存在
    data.editUser.id = form.returnVo.id || 0;
    data.editUser.accountEnabled = form.returnVo.accountEnabled ? 1 : 0;
    data.editUser.outletId = form.returnVo.outletId || 0;
    data.editUser.email = form.returnVo.email || '';
    data.editUser.phoneNumber = form.returnVo.phoneNumber || '';
    password = form.returnVo.password || '';
    confirmPassword = form.returnVo.confirmPassword || '';
  }
</script>

<div class="container mx-auto p-4 space-y-4">
  <!-- 标题和返回按钮 -->
  <div class="flex justify-between items-center mx-auto w-1/2">
    <h3 class="h3">{$_('agent.users.edit.title')}</h3>
    <button class="btn  preset-outlined-surface-500" onclick={() => window.location.href = '/app/agents/users/list'}>
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
      
      <input type="hidden" name="editUser.id" bind:value={data.editUser.id} />

      <!-- 代理商名称 -->
      <div class="form-field grid grid-cols-12">
        <label for="name" class="label">{$_('common.enabled')}<span class='text-red-500'>*</span></label>
        <div class="col-span-10">
          <input class="checkbox align-left" type="checkbox" checked={!!data.editUser.accountEnabled} value={data.editUser.accountEnabled}></div>
      </div>

      <!-- 代理商 -->
      <div class="form-field">
        <label for="outletId" class="label">{$_('common.agent')}<span class='text-red-500'>*</span></label>
        <select 
          id="outletId"
          name="editUser.outletId"
          value={data.editUser.outletId}
          class="select border-surface-500 border-1"
        >
          {#each data.agentList as agent}
            <option value={agent.id}>{agent.name}</option>
          {/each}
        </select>
      </div>

      <!-- 邮箱 -->
      <div class="form-field">
        <label for="deptId" class="label">{$_('agent.users.edit.email')}<span class='text-red-500'>*</span></label>
        <input 
          id="email"
          name="editUser.email"
          bind:value={data.editUser.email}
          placeholder={$_('agent.edit.emailPlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>

      <!-- 手机号码 -->
      <div class="form-field">
        <label for="state" class="label">{$_('agent.users.edit.phoneNumber')}<span class='text-red-500'>*</span></label>
        <input
          id="phone"
          name="editUser.phone_number"
          bind:value={data.editUser.phoneNumber}
          placeholder={$_('agent.edit.phonePlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>
      <!-- 密码 -->
      <div class="form-field">
        <label for="password" class="label">{$_('agent.users.edit.password')}
          {#if !data.editUser.id || data.editUser.id == 0 }
            <span class='text-red-500'>*</span>
          {/if}
          </label>
        <input
          type='password'
          id="password"
          name="password"
          bind:value={password}
          placeholder={$_('agent.edit.passwordPlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>
      <!-- 确认密码*  -->
      <div class="form-field">
        <label for="confirmPassword" class="label">{$_('layout.confirmPassword')}
          {#if !data.editUser.id || data.editUser.id == 0 }
            <span class='text-red-500'>*</span>
          {/if}
        </label>
        <input
          type='password'
          id="confirmPassword"
          name="confirmPassword"
          bind:value={confirmPassword}
          placeholder={$_('agent.edit.confirmPasswordPlaceholder')}
          class="input border-surface-500 border-1"
        />
      </div>
      <!-- 错误信息 -->
      {#if form?.errors}
        <p class="text-error-500 text-sm">{$_(form.errors)}</p>
      {/if}

      <!-- 提交按钮 -->
      <div class="flex justify-center">
        <button type="submit" class="btn w-full preset-outlined-primary-500">
          {$_('buttons.save')}
        </button>
      </div>
    </form>
  </div>
</div>