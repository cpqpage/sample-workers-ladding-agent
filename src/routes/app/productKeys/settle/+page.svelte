<script lang="ts">
  import AgentSelect from '$lib/components/AgentSelect.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ProductKeyTypeSelect from '$lib/components/ProductKeyTypeSelect.svelte';
	import VersionFeatures from '$lib/components/VersionFeatures.svelte';

	import dayjs from 'dayjs';
  import {_} from 'svelte-i18n';
  import { exportExcel } from '$lib/client/utils/exportExcel';
  
  const { data, form } = $props();
  let agentId = $state(data.form.agentId);
  let type = $state(data.form.type || '');
  let occupied = $state(data.form.occupied || '');
  let versionFeatures = $state(data.form.versionFeatures || '');
  let startDate = $state(data.form.startDate || '');
  let endDate = $state(data.form.endDate || '');
  const agentTree = data.agentTree;

  let pageCount = data.pageCount;
  let page = $state(data.form.page || 1);
  let pageSize = $state(data.form.pageSize || 50);

  function doExport(){
    const exportData: string[][] = [];
    const _ths = document.querySelectorAll("#data-table tr th");
    
    const title: string[] = [];
    _ths.forEach((_th) => {
      title.push(_th.textContent?.trim() || "");
    })
    exportData.push(title);
    
    for(let i in data.exportList){
      const detail: string[] = [i + 1];
      const {upgradeLog, outlet, versionFeatures} = data.exportList[i];
      const upl = upgradeLog as Record<string, unknown>;
      const o = outlet as Record<string, unknown>;
      
      const uplAgentId = (upl.agent_id as number);
      
      detail.push(data.agentMap[uplAgentId] || $_('productKeys.list.table.unkownAgent'));
      detail.push($_('productKeys.list.occupied.' + upl.upgrade_type))
      detail.push($_('productKeys.list.type.' + upl.key_type));
      detail.push(upl.product_key + " " + (versionFeatures == 1 ? "I" : "D"))
      detail.push(upl.month_count == 0 ? "/" : upl.month_count + "");
      detail.push(upl.price + "");
      detail.push(o.name as string || "");
      detail.push(o.remark_formatted as string || "");
      detail.push(dayjs(o.create_date as Date).format('YYYY-MM-DD'));
      detail.push(dayjs(upl.upgrade_date as Date).format('YYYY-MM-DD'));
      
      exportData.push(detail);
    }
    exportData.push([$_("table.total"),"","","","","",data.totalPrice+""])

    exportExcel(exportData, $_("export.productKey.settle"));
  }
</script>

<div class="container mx-auto p-4">
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
          <AgentSelect showAll={true} bind:_value={agentId} {agentTree} />
          <ProductKeyTypeSelect {type} />

          <select name="occupied" value={occupied} class="select preset-outlined-surface-500">
            <option value="">{$_("productKeys.list.occupied.all")}</option>
            <option value="1">{$_("productKeys.list.occupied.1")}</option>
            <option value="-1">{$_("productKeys.list.occupied.-1")}</option>
          </select>
          <VersionFeatures {versionFeatures} />
          <input type="date" class="input preset-outlined-surface-500" name="startDate" value={startDate} />
          <input type="date" class="input preset-outlined-surface-500" name="endDate" value={endDate} />
          <button type="submit" class="btn preset-outlined-primary-500">
            {$_('buttons.search')}
          </button>
        </div>
        </form>
        <form 
          action="?/export" 
          method="POST" 
          class="flex flex-col gap-2 w-full sm:w-auto"
        >
          <button type="button" class="btn preset-outlined-primary-500" onclick={doExport}>
            {$_('buttons.export')}
          </button>
        </form>
      </div>
    </div>
    <hr class="text-surface-500">
    <div class="card p-4">
      <div class="table-none table-fixed">
        <table id="data-table" class="table table-auto">
          <thead>
            <tr>
              <th>#</th>
              <th>{$_('common.agent')}</th>
              <th>{$_('productKeys.list.table.status')}</th>
              <th>{$_('productKeys.list.table.type')}</th>
              <th>{$_('productKeys.list.table.key')}</th>
              <th>{$_('productKeys.list.table.months')}</th>
              <th style="text-align: center">{$_("productKeys.list.table.settlePrice")}</th>
              <th>{$_("productKeys.list.table.outlet")}</th>
              <th>{$_("productKeys.list.table.outletMemo")}</th>
              <th>{$_("productKeys.list.table.openDate")}</th>
              <th>{$_("productKeys.list.table.useOrCancelDate")}</th>
            </tr>
          </thead>
          <tbody class="[&>tr]:hover:preset-tonal-primary">
            {#each data.pageList as {upgradeLog, outlet, versionFeatures}, index}
              <tr>
                <td class="text-left">{(Number(page) - 1) * Number(pageSize) + index + 1}</td>
                <td class="text-left">{ data.agentMap[(upgradeLog as Record<string, unknown>).agent_id as number] || $_('productKeys.list.table.unkownAgent') }</td>
                <td class="text-left">
                  {#if (upgradeLog as Record<string, unknown>).upgrade_type == 1}
                    <span class="badge bg-success-500">{$_('productKeys.list.occupied.1')}</span>
                  {:else if (upgradeLog as Record<string, unknown>).upgrade_type == -1}
                    <span class="badge bg-error-500">{$_('productKeys.list.occupied.-1')}</span>
                  {/if}
                </td>
                <td class="text-left">
                  {#if (upgradeLog as Record<string, unknown>).key_type == 0}
                    <span class="badge bg-primary-500">{$_('productKeys.list.type.0')}</span>
                  {:else}
                    <span class="badge bg-surface-500">{$_('productKeys.list.type.1')}</span>
                  {/if}
                </td>
                <td class="text-left">
                  {(upgradeLog as Record<string, unknown>).product_key}
                    {#if versionFeatures == 1}
                      <span class="badge bg-primary-500">I</span>
                    {:else}
                      <span class="badge bg-surface-500">D</span>
                    {/if}
                </td>
                <td class="text-left">{(upgradeLog as Record<string, unknown>).month_count == 0 ? "/" : (upgradeLog as Record<string, unknown>).month_count}</td>
                <td class="text-center">
                  <span class={(upgradeLog as Record<string, unknown>).upgrade_type == -1 ? "text-error-500" : ""}>
                    {(upgradeLog as Record<string, unknown>).price}
                  </span>
                  {#if (upgradeLog as Record<string, unknown>).gift_flag == 1}
                    <span class="badge bg-warning-500">{$_('productKeys.list.gift')}</span>
                  {/if}
                </td>
                <td class="text-left">{(outlet as Record<string, unknown>).name}</td>
                <td class="text-left">{(outlet as Record<string, unknown>).remark_formatted}</td>
                <td class="text-left">{dayjs((outlet as Record<string, unknown>).create_date as Date).format('YYYY-MM-DD')}</td>
                <td class="text-left">{dayjs((upgradeLog as Record<string, unknown>).upgrade_date as Date).format('YYYY-MM-DD')}</td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6" class="text-left">{$_("table.subtotal")}</td>
              <td class="text-center">{data.subtotalPrice}</td>
              <td colspan="4"></td>
            </tr>
            <tr>
              <td colspan="6" class="text-left">{$_("table.total")}</td>
              <td class="text-center">{data.totalPrice}</td>
              <td colspan="4"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div>
          <p>{$_("productKeys.list.table.count", {values: {count: data.total}})}</p>
        </div>
        <Pagination bind:pageSize={pageSize} bind:page={page} bind:pageCount={pageCount} />
      </div>
    </div>
  </div>
</div> 