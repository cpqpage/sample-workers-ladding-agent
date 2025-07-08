<script lang="ts">
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import { _ } from 'svelte-i18n';
  const { data } = $props();
  
  // 设置中文语言
  dayjs.locale('zh-cn');
  const lastLoginTime = dayjs(data.lastLoginTime).format('YYYY-MM-DD HH:mm:ss');
</script>

<div class="container mx-auto p-4">
  <div class="card p-4 mb-4">
    <p>{$_('dashboard.welcome', { values: { lastLoginTime } })}</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="card p-0 bg-surface-200-800">
      <header class="flex justify-between items-center p-4 bg-surface-300-700">
        <span class="badge preset-outlined-success-500">{$_('dashboard.productKey.title')}</span>
        <a href="productKeys/list" class="btn variant-ghost">{$_('dashboard.viewDetails')} »</a>
      </header>
      <div class="p-4 space-y-2">
        <p>{$_('dashboard.productKey.total', { values: { count: data.allPkCount } } as any)}</p>
        <p>{$_('dashboard.productKey.used', { values: { count: data.usedPkCount } } as any)}</p>
        <p>{$_('dashboard.productKey.cancelled', { values: { count: data.cancelPkCount } } as any)}</p>
        <p>{$_('dashboard.productKey.unused', { values: { count: data.unUsedPkCount } } as any)}</p>
      </div>
    </div>

    <div class="card p-0 bg-surface-200-800">
      <header class="flex justify-between items-center p-4 bg-surface-300-700">
        <span class="badge preset-outlined-primary-500">{$_('dashboard.outlet.title')}</span>
        <a href="outlets/list" class="btn variant-ghost">{$_('dashboard.viewDetails')} »</a>
      </header>
      <div class="p-4 space-y-2">
        {#if data.outletType > "8"}
          <p>{$_('dashboard.outlet.companyCount', { values: { count: data.companyCount } } as any)}</p>
        {/if}
        <p>{$_('dashboard.outlet.total', { values: { count: data.outletCount } } as any)}</p>
        <p>{$_('dashboard.outlet.unsigned', { values: { count: data.unsignCount } } as any)}</p>
        <p>{$_('dashboard.outlet.weeklyActive', { values: { count: data.activeCount } } as any)}</p>
      </div>
    </div>
  </div>

  <div class="card p-0 mt-4 bg-surface-200-800">
    <header class="flex items-center p-4 bg-surface-300-700">
      <span class="badge preset-outlined-primary-500">{$_('dashboard.valueAdded.title')}</span>
    </header>
    <div class="p-4">
      <p>
        {$_('dashboard.valueAdded.wxPay', { values: { count: data.wxCount }  } as any)}, 
        {$_('dashboard.valueAdded.aliPay', { values: { count: data.aliCount } } as any)}, 
        {$_('dashboard.valueAdded.smsRecharge', { values: { count: data.smsCount } } as any)}.
        {$_('dashboard.valueAdded.wxStore', { values: { count: data.wdCount } } as any)}.
      </p>
    </div>
  </div>
</div>