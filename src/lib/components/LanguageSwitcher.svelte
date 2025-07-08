<script lang="ts">
  import { locale } from 'svelte-i18n';
  import { _ } from 'svelte-i18n';
  import { LANGUAGES } from '$lib/constants';
</script>

<div class="language-switcher">
  <select
    bind:value={$locale}
    class="select preset-outlined-primary-950-50"
  >
    {#each LANGUAGES as lang}
      <option value={lang.code}>{lang.name}</option>
    {/each}
  </select>
</div>

<style>
  .language-switcher {
    position: fixed;
    top: 2px;
    right: 10px;
    z-index: 100;
  }
</style> 