<script lang="ts">
    import { _ } from 'svelte-i18n';
    import { OUTLET_TYPE } from '$lib/constants.js';

    let {
      id = "", 
      base = "select preset-outlined-surface-500",
      showAll = false,
      _value = $bindable(),
      agentTree
    } = $props();
</script>
<select id={id} name="agentId" class={base} bind:value={_value}>
  {#if showAll}<option value={Number(0)}>{$_("productKeys.list.search.agentId.all")}</option>{/if}
  {#each agentTree as agent}
    <option value={Number(agent.id)}>
      {#if agent.type == OUTLET_TYPE.REGIONAL}&nbsp;&nbsp;&nbsp;&nbsp;
      {:else if agent.type == OUTLET_TYPE.NORMAL}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      {/if}
      {agent.name}
    </option>
  {/each}
</select>