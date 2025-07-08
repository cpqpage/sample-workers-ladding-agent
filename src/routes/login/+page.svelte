<script lang="ts">
    import { _ } from 'svelte-i18n';
    let {form} = $props();
    let email = $state('');
    let password = $state('');
</script>
<div class="card bg-noise bg-surface-50-950 flex justify-center items-center p-8">
    <astro-slot name="preview" class="w-full max-w-md space-y-4">
        <header><h3 class="h3">{$_('login.title')}</h3></header>
        <form method="post" class="border-[1px] border-surface-200-800 w-full max-w-md space-y-4 p-4">
            <label class="label">
                <input 
                    type="text" 
                    class="input border-[1px]" 
                    name="email" 
                    placeholder={$_('login.emailPlaceholder')} 
                    bind:value={email} 
                />
            </label>
            <label class="label">
                <input 
                    type="password" 
                    class="input border-[1px]" 
                    name="password" 
                    placeholder={$_('login.passwordPlaceholder')} 
                    bind:value={password} 
                />
            </label>
            {#if form?.error}
                <p class="text-error-500">{$_(form.error)}</p>
            {/if}
            <fieldset class="flex justify-end">
                <button type="submit" class="btn preset-outlined-surface-300-700">{$_('login.submit')}</button>
            </fieldset>
        </form>
    </astro-slot>
</div>