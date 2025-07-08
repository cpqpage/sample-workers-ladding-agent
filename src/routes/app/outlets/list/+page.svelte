<script lang="ts">
  import Pagination from '$lib/components/Pagination.svelte';
	import AgentSelect from '$lib/components/AgentSelect.svelte';
  import { OUTLET_TYPE } from '$lib/constants';
  import {_, locale} from 'svelte-i18n';
  import { Modal, Toaster } from '@skeletonlabs/skeleton-svelte';
	import {generateToaster} from '$lib/client/utils/toasterUtil';
  import dayjs from 'dayjs';

  const { data, form } = $props();

  const agentTree = data.agentTree;
  let query = $state(data.form.query);
  let agentId = $state(data.form.agentId);
  let hasProductKey = $state(data.form.hasProductKey);
  let multiOutlet = $state(data.form.multiOutlet);
  let enabled = $state(data.form.enabled);
  let isExpired = $state(data.form.isExpired);
  let country = $state(data.form.country);
  let province = $state(data.form.province);
  let city = $state(data.form.city);
  let page = $state(data.form.page);
  let pageSize = $state(data.form.pageSize);
  let pageCount = data.pageCount;

  let outletIds: number[] = $state([]);
  let moveAgentId = $state('');
  let showMoveModal = $state(false);
  let outletChecked = $state(false);
  
  const toaster = generateToaster();

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

  function selectAll(){
    outletIds = [];
    if(outletChecked){
      for(let {outlet} of data.list){
        outletIds.push(outlet.id as number);
      }
    }
  }

  function ifSelectAll(){
    outletChecked = outletIds.length === data.list.length;
  }

  function movePre(){
    if(outletIds.length === 0){
      toaster.error({
        title: $_("outlets.move.error.noSelect")
      });

      return;
    }
    showMoveModal = true;
  }
</script>

<div class="container mx-auto p-4 space-y-4">
  <!-- 搜索和功能按钮区域 -->
  <div class="flex flex-col gap-4">
    <div class="flex flex-cols sm:flex-row justify-between items-center gap-4">
      <form 
        action="?/search"
        method="post"
        class="grid grid-row-2 gap-2 w-full sm:w-auto">
        
        <div class="flex flex-cols gap-2">
          <input 
            name="query"
            class="input preset-outlined-surface-500"
            value={query}
            placeholder={$_("outlets.search.placeHolder.query")}>

          <AgentSelect showAll={true} bind:_value={agentId} {agentTree} />
          <select name="hasProductKey" value={hasProductKey}
            class="select preset-outlined-surface-500">
            <option value="">{$_("outlets.search.hasProductKey.all")}</option>
            <option value="0">{$_("outlets.search.hasProductKey.0")}</option>
            <option value="1">{$_("outlets.search.hasProductKey.1")}</option>
            <option value="2">{$_("outlets.search.hasProductKey.2")}</option>
          </select>
        </div>
        
        <div class="flex flex-cols gap-4 w-full">
          <select name="multiOutlet" value={multiOutlet}
            class="select preset-outlined-surface-500">
            <option value="">{$_("outlets.search.multiOutlet.all")}</option>
            <option value="0">{$_("outlets.search.multiOutlet.0")}</option>
            <option value="1">{$_("outlets.search.multiOutlet.1")}</option>
          </select>
          <select name="enabled" value={enabled}
            class="select preset-outlined-surface-500">
            <option value="">{$_("outlets.search.enabled.all")}</option>
            <option value="1">{$_("outlets.search.enabled.1")}</option>
            <option value="0">{$_("outlets.search.enabled.0")}</option>
          </select>
          <select name="isExpired" value={isExpired}
            class="select preset-outlined-surface-500">
            <option value="">{$_("outlets.search.isExpired.all")}</option>
            <option value="0">{$_("outlets.search.isExpired.0")}</option>
            <option value="1">{$_("outlets.search.isExpired.1")}</option>
            <option value="2">{$_("outlets.search.isExpired.2")}</option>
          </select>

          <input type="text" name="country" value={country}
            class="input preset-outlined-surface-500"
            placeholder={$_("common.country")} />
          <input type="text" name="province" value={province}
            class="input preset-outlined-surface-500"
            placeholder={$_("common.state")} />
          <input type="text" name="city" value={city}
            class="input preset-outlined-surface-500"
            placeholder={$_("common.city")} />
          
          <button type="submit"
            class="btn preset-outlined-primary-500">{$_("buttons.search")}</button>
        </div>
      </form>
      {#if data.outletType == OUTLET_TYPE.REGIONAL || data.outletType == OUTLET_TYPE.GENERAL}
        <button onclick={movePre}
          class="btn preset-outlined-primary-500">{$_('outlets.modal.move.title')}</button>
      {/if}
    </div>
  </div>
  <hr class="text-surface-500">
  <div class="card p-4">
    <div class="table-none table-fixed">
      <table class="table table-auto">
        <thead>
          <tr>
            <th style="text-align:center;">
              <input type="checkbox"
                class="checkbox"
                bind:checked={outletChecked}
                onchange={selectAll}
              ></th>
            <th>{$_('common.agent')}</th>
            <th>{$_('outlets.list.table.columns.type')}</th>
            <th>{$_('outlets.list.table.columns.headOffice')}</th>
            <th>{$_('outlets.list.table.columns.authorization')}</th>
            <th>{$_('outlets.list.table.columns.status')}</th>
            <th>{$_('outlets.list.table.columns.expired')}</th>
            <th>{$_('outlets.list.table.columns.companyCode')}</th>
            <th>{$_('outlets.list.table.columns.storeName')}</th>
            <th>{$_('outlets.list.table.columns.storeNumber')}</th>
            <th>{$_('outlets.list.table.columns.countryStateCity')}</th>
            <th>{$_('outlets.list.table.columns.registrationCode')}</th>
            <th>{$_('outlets.list.table.columns.expirationDate')}</th>
            <th>{$_('outlets.list.table.columns.creationDate')}</th>
            <th>{$_('outlets.list.table.columns.remarks')}</th>
            <th>{$_('outlets.list.table.columns.operate')}</th>
          </tr>
        </thead>
        <tbody>
          {#each data.list as {outlet, company}}
            <tr>
              <td style="text-align:center;">
                <input type="checkbox" class="checkbox"
                    name="movePkIds"
                    id="select_{outlet.id}"
                    value={outlet.id}
                    bind:group={outletIds}
                    onchange={ifSelectAll}
                />
              </td>
              <td>
                { data.agentMap[outlet.agentId as number] || $_('productKeys.list.table.unkownAgent') }
              </td>
              <td>
                {#if (company.outletQty as number) <= 1}
                  <span class="badge bg-primary-500">
                  {$_('outlet.type.singleStore')}
                  </span>
                {:else}
                  <span class="badge bg-surface-500">
                  {$_('outlet.type.chainStore')}
                  </span>
                {/if}
              </td>
              <td>
                {#if (company.outletQty as number) > 1}
                  {#if outlet.isMainShop === 1}
                    <span class="badge bg-primary-500">{$_('common.yes')}</span>
                  {:else}
                    <span class="badge bg-surface-500">{$_('common.no')}</span>
                  {/if}
                  {:else}/
                {/if}
              </td>
              <td>
                {#if outlet.productKey}
                  <span class="badge bg-primary-500">{$_('outlet.auth.official')}</span>
                {:else}
                  <span class="badge bg-surface-500">{$_('outlet.auth.trial')}</span>
                {/if}
              </td>
              <td>
                {#if outlet.outletEnabled == 1}
                  <span class="badge bg-success-500">{$_('common.enabled')}</span>
                {:else}
                  <span class="badge bg-error-500">{$_('common.disabled')}</span>
                {/if}
              </td>
              <td>
                {#if outlet.expiryDate === null || dayjs(outlet.expiryDate).toDate() >= data.now}
                  <span class="badge bg-primary-500">{$_('outlet.notExpired')}</span>
                {:else}
                  <span class="badge bg-surface-500">{$_('outlet.expired')}</span>
                {/if}
              </td>
              <td>{company.companyCode}</td>
              <td>{outlet.name}</td>
              <td>{outlet.outletCode}</td>
              <td>{outlet.country} {outlet.state} {outlet.city}</td>
              <td>{outlet.productKey}
                {#if outlet.productKey}
                  {#if outlet.versionFeatures === 1}
                    <span class="badge bg-primary-500" title="{$_('outlet.versionFeatures.1')}">I</span>
                  {:else}
                    <span class="badge bg-success-500" title="{$_('outlet.versionFeatures.0')}">D</span>
                  {/if}
                {/if}
              </td>
              <td>
                {#if outlet.expiryDate && dayjs(outlet.expiryDate).toDate() >= data.now}
                  {dayjs(outlet.expiryDate).format('YYYY-MM-DD')}
                {:else}
                  {$_('outlet.longTerm')}
                {/if}
              </td>
              <td title={$_("outlets.list.table.td.updateDate"
                ,{values:{updateDate: dayjs(outlet.updateDate).format('YYYY-MM-DD')}}
              )}>
                {dayjs(outlet.createDate).format('YYYY-MM-DD')}
              </td>
              <td class="rmk-{outlet.id}">
                {#if outlet.remark && (outlet.remark as string).indexOf('{') > -1 && (outlet.remark as string).indexOf('}') > -1}
                  {$_('outlet.detail.remarkModal.orderNo')}: {(JSON.parse(outlet.remark as string) as any).tradeNo}<br/>
                  {$_('outlet.detail.remarkModal.wangwang')}: {(JSON.parse(outlet.remark as string) as any).wangwang}<br/>
                  {$_('outlet.detail.remarkModal.qq')}: {(JSON.parse(outlet.remark as string) as any).qq}<br/>
                  {$_('outlet.detail.remarkModal.others')}: {(JSON.parse(outlet.remark as string) as any).remark}
                {:else}
                  {outlet.remark}
                {/if}
              </td>
              <td>
                <a href="detail?outletId={outlet.id}" class="btn preset-filled-primary-500">
                  {$_('buttons.view')}
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex flex-cols sm:flex-row justify-between items-center gap-4 mt-4">
      <div class="grid grid-row-2 gap-2 justify-between">
        <span>{$_('outlets.list.total', {values: {count: data.total}})}</span>
        <span>{$_('outlets.list.selectCount', {values: {count: outletIds.length}})}</span>
      </div>
      <Pagination bind:pageSize={pageSize} bind:page={page} bind:pageCount={pageCount} />
    </div>
  </div>
</div>

<Modal
  open={showMoveModal}
  onOpenChange={(e: any) => (showMoveModal = e.open)}
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  backdropClasses="backdrop-blur-sm"
>
{#snippet content()}
  <header><h3 class="text-xl font-bold">{$_('outlets.modal.move.title')}</h3></header>
  <form 
    class="grid grid-flow-row grid-rows-2 gap-4"
    action="?/moveOutlet" 
    method="POST"
  >
    {#each outletIds as oid}
      <input type="hidden" name="outletIds" value={oid} />
    {/each}
    <div class="grid grid-flow-col grid-cols-5 gap-2">
      <label for="agentId" class="label text-right">{$_('common.agent')}</label>
      <AgentSelect id="agentId" base="select col-span-4 preset-outlined-surface-500"
        bind:_value={moveAgentId} {agentTree} />
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