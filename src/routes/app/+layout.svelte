<script lang="ts">
  import { page } from '$app/state';
  import { Navigation, Modal } from '@skeletonlabs/skeleton-svelte';
  import { Popover } from '@skeletonlabs/skeleton-svelte';
  import { enhance } from '$app/forms';
  import type { ActionResult } from '@sveltejs/kit';
  import { TokenManager } from '$lib/client/utils/token';
  import { _ } from 'svelte-i18n';

  const {data, children} = $props();
  const {email, outletType, outletName} = data;

  // Helper function to check if path includes certain segments
  const isActive = (path: string) => page.url.pathname.includes(path);
  
  let showUserInfo = $state(false);
  let showPasswordModal = $state(false);
  let oldPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let formError = $state('');
  let modifyPasswordDisabled = $state(false);

  // Define navigation structure with dropdowns
  const navigation = $state(data.navigation);

  function agentModifyUserPasswordPre() {
    showPasswordModal = true;
    showUserInfo = false;
  }

  function handleSubmit() {
    modifyPasswordDisabled = true;
    return async ({ result, update }: { result: ActionResult, update: () => Promise<void> }) => {
      if (result.type === 'success') {
        showPasswordModal = false;
        oldPassword = '';
        newPassword = '';
        confirmPassword = '';
        formError = '';
        alert($_('layout.passwordChangeSuccess'));
        TokenManager.removeTokens();
        window.location.href = '/logout';
      } else if (result.type === 'failure') {
        formError = result.data?.error ? $_(result.data?.error) : $_('error.unknownError');
      }
      await update();
    }
  }
</script>

<div class="card w-full">
  <Navigation.Bar classes="flex justify-between h-full preset-filled-surface-500">
    <div class="flex-1 h-full">
      <span class="text-lg font-semibold h-full">{$_('layout.title')}</span>
    </div>
    
    <div class="flex-5 flex h-full text-center">
      {#each navigation as item}
      <div class="flex-1 h-full">
        {#if item.show}
        <Popover
          triggerBase={"btn w-full h-full whitespace-normal " + (isActive(item.href) ? "preset-filled-primary-500" : "")}
          contentBase="card p-4 bg-surface-200-800 space-y-4 max-w-[320px]"
          positioning={{ placement: 'bottom' }}
          open={item.open}
          onInteractOutside={() => {
            item.open = false;
          }}
          onclick={() => {
            if(!item.children){
              item.open = false;
              window.location.href = item.href;
            }else{
              item.open = !item.open;
            }
          }}
        >
        {#snippet trigger()}<span class="h-full text-sm leading-tight py-1">{$_(item.label)}</span>{/snippet}
        {#snippet content()}
          {#if item.children}
            <div>
              {#each item.children as child}
              {#if child.show}
              <article><a
                onclick={() => {item.open = !item.open;}}
                href={item.href + child.href}
                class="btn px-4 py-2 hover:preset-filled-surface-500 rounded whitespace-normal text-sm leading-tight">{$_(child.label)}</a></article>
              {/if}
              {/each}
            </div>
          {/if}
          {/snippet}
        </Popover>
        {/if}
      </div>
      {/each}
    </div>

    <div class="flex-2 flex items-center space-x-4">
      {#if email}
        <Popover
          open={showUserInfo}
          onOpenChange={() => {
            showUserInfo = !showUserInfo;
          }}
          triggerBase="btn"
          contentBase="card p-4 bg-surface-200-800 space-y-4 max-w-[320px]"
          positioning={{ placement: 'bottom' }}
        >
          {#snippet trigger()}
            <div class="flex items-center space-x-4">
              <span>{email}</span>
              <span>{$_('agent.levels.' + outletType) + ': ' + outletName}</span>
            </div>
          {/snippet}
          {#snippet content()}
            <div>
              <article><a
                href="#top"
                class="btn px-4 py-2 hover:preset-filled-surface-500 rounded"
                onclick={agentModifyUserPasswordPre}
              >
                {$_('layout.changePassword')}
              </a></article>
              <article><a
                href="/logout"
                class="btn px-4 py-2 hover:preset-filled-surface-500 rounded"
              >
                {$_('layout.logout')}
              </a></article>
            </div>
          {/snippet}
        </Popover>
      {/if}
    </div>
  </Navigation.Bar>

  <Modal
    open={showPasswordModal}
    onOpenChange={(e) => (showPasswordModal = e.open)}
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
  >
  {#snippet content()}
    <header><h3 class="text-xl font-bold">{$_('layout.changePassword')}</h3></header>
    <form class="grid grid-rows-4 space-y-4"
      action="/app/modifyUserPassword" 
      method="POST" 
      use:enhance={handleSubmit}
    >
      <div>
        <label class="label">{$_('layout.oldPassword')}
        <input 
          type="password" 
          name="oldPassword"
          bind:value={oldPassword}
          class="input preset-outlined-surface-500" 
          placeholder={$_('layout.oldPasswordPlaceholder')}
          required
        /></label>
      </div>
      <div>
        <label class="label">{$_('layout.newPassword')}
        <input 
          type="password" 
          name="newPassword"
          bind:value={newPassword}
          class="input preset-outlined-surface-500" 
          placeholder={$_('layout.newPasswordPlaceholder')}
          required
        /></label>
      </div>
      <div>
        <label class="label">{$_('layout.confirmPassword')}
        <input 
          type="password" 
          name="confirmPassword"
          bind:value={confirmPassword}
          class="input preset-outlined-surface-500" 
          placeholder={$_('layout.confirmPasswordPlaceholder')}
          required
        /></label>
      </div>
      {#if formError}
        <p class="text-error-500">{formError}</p>
      {/if}
      <div class="grid grid-cols-2 gap-2 max-h-[40px]">
        <button 
          type="button"
          class="btn preset-outlined-primary-500" 
          onclick={() => showPasswordModal = false}
        >
          {$_('buttons.cancel')}
        </button>
        <button
          disabled={modifyPasswordDisabled}
          type="submit"
          class="btn preset-outlined-primary-500"
        >
          {$_('buttons.confirm')}
        </button>
      </div>
    </form>
    {/snippet}
  </Modal>
</div>
<div class="card">
  {@render children()}
</div>