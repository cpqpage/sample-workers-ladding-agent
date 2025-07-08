<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import { Modal, Toaster } from '@skeletonlabs/skeleton-svelte';
  import {generateToaster} from '$lib/client/utils/toasterUtil'
  import AgentSelect from '$lib/components/AgentSelect.svelte';

	import dayjs from 'dayjs';
  import {_, locale} from 'svelte-i18n';
	import { OUTLET_TYPE } from '$lib/constants.js';
	import ProductKeyTypeSelect from '$lib/components/ProductKeyTypeSelect.svelte';
	import VersionFeatures from '$lib/components/VersionFeatures.svelte';
  
  const { data, form } = $props();
  const toaster = generateToaster();

  let searchQuery = $state(data.form.query || '');
  let agentId = $state(data.form.agentId);
  let type = $state(data.form.type || '');
  let occupied = $state(data.form.occupied || '');
  let versionFeatures = $state(data.form.versionFeatures || '');
  const agentTree = data.agentTree;

  let pageCount = $state(data.pageCount);
  let page = $state(data.form.page || 1);
  let pageSize = $state(data.form.pageSize || 50);

  let firstAgentId = (agentTree[0].id as number).toString();
  let pkAgentId = $state(firstAgentId);
  let pkType = $state('0');
  let pkVersionFeatures = $state('0');
  let pkNumber = $state(1);
  let showpkModal = $state(false);

  let showMovePkModal = $state(false);
  let pkIds: number[] = $state([]);
  let movePkAgentId = $state(firstAgentId);
  let pkChecked = $state(false);

  let showRevervePkModal = $state(false);
  let reserveType = $state(0);
  let memo = $state('');
  
  //等待国际化完成后再执行
  locale.subscribe(() => {
    if(form?.error) {
        toaster.error({
          title: $_(form.error)
        });
      }
      if(form?.success){
        toaster.success({
          title: $_(form.message, {values: {result: form.result}})
        });
      }
  });

  function moveProductPre(){
    if(pkIds.length == 0) {
      toaster.error({
        title: $_('productKeys.list.error.noSelected')
      });
      return;
    }
    showMovePkModal = true;
  }

  function selectAllPkIds(){
    pkIds = [];
    if(pkChecked){
      pkIds = data.productKeys
        .filter(pk=>pk.product_key.occupied == 0)
        .map((pk=>(pk.product_key.id as number)))
    }
  }

  function ifSelectAll(){
    const allLen = data.productKeys
        .filter(pk=>pk.product_key.occupied == 0)
        .map((pk=>(pk.product_key.id as number)))
        .length;
    pkChecked = pkIds.length === allLen;
  }

  function markProductKey(rType: number) {
    if(pkIds.length == 0) {
      toaster.error({
        title: $_('productKeys.list.error.noSelected')
      });
      return;
    }
    reserveType = rType;
    showRevervePkModal = true;
  }
</script>

<div class="container mx-auto p-4 space-y-4">
  <!-- 搜索和功能按钮区域 -->
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
            placeholder={$_('productKeys.list.search.placeholder')}
            class="input p-2 w-full sm:w-64 preset-outlined-surface-500"
          />
          <AgentSelect showAll={true} bind:_value={agentId} {agentTree} />
          
          <ProductKeyTypeSelect {type} />
          <select name="occupied" value={occupied} class="select preset-outlined-surface-500">
            <option value="">{$_("productKeys.list.occupied.all")}</option>
            <option value="1">{$_("productKeys.list.occupied.1")}</option>
            <option value="0">{$_("productKeys.list.occupied.0")}</option>
            <option value="-1">{$_("productKeys.list.occupied.-1")}</option>
          </select>
          <VersionFeatures {versionFeatures} />
          <button type="submit" class="btn preset-outlined-primary-500">
            {$_('buttons.search')}
          </button>
        </div>
      </form>

      <div class="">
        <button 
          class="btn preset-outlined-primary-500" 
          onclick={() => (showpkModal = true)}
        >
          {$_('productKeys.list.button.create')}
        </button>
        {#if data.outletType === OUTLET_TYPE.GENERAL
          || data.outletType === OUTLET_TYPE.REGIONAL}
          <button 
            class="btn preset-outlined-primary-500" 
            onclick={moveProductPre}
          >
            {$_('productKeys.list.button.move')}
          </button>
        {/if}
        
        <button type="button"
          class="btn preset-outlined-primary-500" 
          onclick={() => {markProductKey(0)}}
        >
          {$_('productKeys.list.button.reserve')}
        </button>
        <button type="button"
          class="btn preset-outlined-primary-500" 
          onclick={() => {markProductKey(1)}}
        >
          {$_('productKeys.list.button.unReserve')}
        </button>
      </div>
    </div>
  </div>
  <hr class="text-surface-500">
  <div class="card p-4">
    <div class="table-none table-fixed">
      <table class="table table-auto">
        <thead>
          <tr>
            <th style="text-align: center">
              <input type="checkbox"
                class="checkbox"
                bind:checked={pkChecked}
                onchange={selectAllPkIds} />
            </th>
            <th>{$_('common.agent')}</th>
            <th>{$_('productKeys.list.table.type')}</th>
            <th>{$_('productKeys.list.table.key')}</th>
            <th>{$_('productKeys.list.table.months')}</th>
            <th>{$_('productKeys.list.table.status')}</th>
            <th>{$_('productKeys.list.table.remark')}</th>
            <th>{$_('productKeys.list.table.createdDate')}</th>
            <th>{$_('productKeys.list.table.updatedDate')}</th>
          </tr>
        </thead>
        <tbody class="[&>tr]:hover:preset-tonal-primary">
          {#each data.productKeys as {product_key: pk}, index}
            <tr>
              <td class="text-center">
                <input type="checkbox" class="checkbox"
                  name="movePkIds"
                  id="select_{pk.id}"
                  value={pk.id}
                  bind:group={pkIds}
                  onchange={ifSelectAll}
                  disabled={pk.occupied != 0 && pk.occupied != 2}>
              </td>
              <td>{ (pk.agentId as number) === 0 ? $_('productKeys.list.table.unkownAgent') : data.agentMap[pk.agentId as number] }</td>
              <td>
                {#if pk.type == 0}
                  <span class="badge bg-primary-500">{$_('productKeys.list.type.0')}</span>
                {:else}
                  <span class="badge bg-surface-500">{$_('productKeys.list.type.1')}</span>
                {/if}
              </td>
              <td>{pk.productKey}
                {#if pk.versionFeatures == 1}
                  <span class="badge bg-primary-500">I</span>
                {:else}
                  <span class="badge bg-surface-500">D</span>
                {/if}
              </td>
              <td>{pk.monthCount == 0 ? "/" : pk.monthCount}</td>
              <td>
                {#if pk.occupied == 2}
                  <span class="badge bg-warning-500">{$_('productKeys.list.occupied.2')}</span>
                {:else if pk.occupied == 1}
                  <span class="badge bg-success-500">{$_('productKeys.list.occupied.1')}</span>
                {:else if pk.occupied == 0}
                  <span class="badge bg-surface-500">{$_('productKeys.list.occupied.0')}</span>
                {:else if pk.occupied == -1}
                  <span class="badge bg-error-500">{$_('productKeys.list.occupied.-1')}</span>
                {/if}
              </td>
              <td>{pk.memo}</td>
              <td>{dayjs(pk.createDate).format("YYYY-MM-DD")}</td>
              <td>
                {#if pk.updateDate}
                  {dayjs(pk.updateDate).format("YYYY-MM-DD")}
                {:else}
                  {dayjs(pk.createDate).format("YYYY-MM-DD")}
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <div></div>
      <Pagination bind:pageSize={pageSize} bind:page={page} bind:pageCount={pageCount} />
    </div>
  </div>
</div>

<Modal
  open={showpkModal}
  onOpenChange={(e: any) => (showpkModal = e.open)}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
{#snippet content()}
  <header><h3 class="text-xl font-bold">{$_('productKeys.modal.create.title')}</h3></header>
  <form 
    class="grid grid-flow-row grid-rows-5 gap-4"
    action="?/genProductKey" 
    method="POST"
  >
    <div class="grid grid-flow-col grid-cols-5 gap-4">
      <label for="agentId" class="label text-right">{$_('common.agent')}</label>
      <AgentSelect id="agentId" base="select col-span-4 preset-outlined-surface-500"
        bind:_value={pkAgentId} {agentTree} />
    </div>
    <div class="grid grid-flow-col grid-cols-5 gap-4">
      <label for="type" class="label text-right">{$_('productKeys.modal.create.type')}</label>
      <div class="col-span-4 grid grid-cols-3 gap-2">
        <span><input
          type="radio" 
          name="type" 
          value="0" 
          bind:group={pkType} 
          class="radio" />
          {$_('productKeys.list.type.0')}</span>
        <span><input
          type="radio" 
          name="type" 
          value="1" 
          bind:group={pkType} 
          class="radio col-span-2" />
          {$_('productKeys.list.type.1')}</span>
      </div>
    </div>
    <div class="grid grid-flow-col grid-cols-5 gap-4">
      <label for="versionFeatures" class="label text-right">{$_('productKeys.modal.create.versionFeatures')}</label>
      <div class="col-span-4 grid grid-cols-3 gap-2">
        <span><input
          type="radio" 
          name="versionFeatures" 
          value="0" 
          bind:group={pkVersionFeatures} 
          class="radio" />
          {$_('productKeys.list.version.0')}</span>
        <span><input
          type="radio" 
          name="versionFeatures" 
          value="1" 
          bind:group={pkVersionFeatures} 
          class="radio col-span-2" />
          {$_('productKeys.list.version.1')}</span>
      </div>
    </div>
    <div class="grid grid-flow-col grid-cols-5 gap-4">
      <label for="pkNumber" class="label text-right">{$_('productKeys.modal.create.number')}</label>
      <input
        type="number"
        name="num"
        value={pkNumber}
        min="1"
        max="500"
        class="input col-span-4 preset-outlined-surface-500"
      />
    </div>
    <div class="grid grid-cols-1">
      <button
        type="submit"
        class="btn preset-outlined-primary-500"
      >
        {$_('buttons.confirm')}
      </button>
    </div>
  </form>
  {/snippet}
</Modal>

<Modal
  open={showMovePkModal}
  onOpenChange={(e: any) => (showMovePkModal = e.open)}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
{#snippet content()}
  <header><h3 class="text-xl font-bold">{$_('productKeys.modal.move.title')}</h3></header>
  <form 
    class="grid grid-flow-row grid-rows-2 gap-4"
    action="?/moveProductKey" 
    method="POST"
  >
    {#each pkIds as pkId}
      <input type="hidden" name="pkIds" value={pkId} />
    {/each}
    <div class="grid grid-flow-col grid-cols-5 gap-2">
      <label for="agentId" class="label text-right">{$_('common.agent')}</label>
      <AgentSelect id="agentId" base="select col-span-4 preset-outlined-surface-500"
        bind:_value={movePkAgentId} {agentTree} />
    </div>
    <div class="grid grid-cols-1">
      <button
        type="submit"
        class="btn preset-outlined-primary-500"
      >
        {$_('buttons.confirm')}
      </button>
    </div>
  </form>
  {/snippet}
</Modal>
<Modal
  open={showRevervePkModal}
  onOpenChange={(e: any) => (showRevervePkModal = e.open)}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
{#snippet content()}
<header><h3 class="text-xl font-bold">{$_('productKeys.modal.reserve.title')}</h3></header>
  <form class="grid grid-flow-row grid-rows-2 gap-4"
    action="?/reserveProductKey"
    method="POST">
    {#each pkIds as pkId}
      <input type="hidden" name="pkIds" value={pkId} />
    {/each}
    <input type="hidden" name="reserveType" value={reserveType}>
    <div class="grid grid-cols-4 gap-2">
      <input type="text" name="memo" value={memo}
        placeholder={$_('productKeys.modal.reserve.remark')}
        class="input preset-outlined-surface-500 col-span-4" />
    </div>
    <div class="grid grid-cols-1">
      <button
        type="submit"
        class="btn preset-outlined-primary-500"
      >
        {$_('buttons.confirm')}
      </button>
    </div>
  </form>
{/snippet}
</Modal>

<Toaster {toaster}></Toaster>