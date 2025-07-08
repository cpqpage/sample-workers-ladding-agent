<script lang="ts">
	import dayjs from 'dayjs';
	import { _, locale } from 'svelte-i18n';
	import { Modal, Toaster } from '@skeletonlabs/skeleton-svelte';
	import AgentSelect from '$lib/components/AgentSelect.svelte';
	import {generateToaster} from '$lib/client/utils/toasterUtil';
	import { fetchActionWithNoForm, getResJson } from '$lib/client/utils/fetchUtil';

	const { data } = $props();
	const toaster = generateToaster();

	let outlet = $state(data.outlet);
	let rj = $state(data.rj);
    let showNetshopModal = $state(false);
	let showRemarkModal = $state(false);
	let showUpgradeModal = $state(false);
	let pkShow = $state(false);
	let productKey_agentId = $state("");
	let upgradeProductKey = $state('');
	let keyType = $state("1");
	let versionFeatures = $state("0");
	let ifGift = $state(false);

	async function activeOutlet(event: Event, id: number) {
		event.preventDefault();
		let outletActiveAction = outlet.outletEnabled == 1 ? '12' : '11';
		const res = await fetchActionWithNoForm("?/outletBatOparation", {
			type: outletActiveAction,
			outletId: id.toString()
		});
		if(res.ok){
			outlet.outletEnabled = outlet.outletEnabled == 1 ? 0 : 1;
		}
    }

	async function saveRemark(event: Event) {
		event.preventDefault();
		if(!rj.tradeNo && !rj.wangwang && !rj.qq && !rj.remark){
			return;
		}
		const res = await fetchActionWithNoForm("?/modifyOutletRemark", {
			outletId: outlet.id,
			tradeNo: rj.tradeNo,
			wangwang: rj.wangwang,
			qq: rj.qq,
			remark: rj.remark
		});
		if(res.ok){
			showRemarkModal = false;
		}
	}

	async function pickupProductKey(event: Event) {
		event.preventDefault();
		if(productKey_agentId == ""){
			toaster.error({
				title: $_('outlet.detail.pickupProductKey.error.agentId')
			});
			return;
		}
		const res = await fetchActionWithNoForm("?/pickupProductKey", {
			agentId: productKey_agentId.toString(),
			keyType: keyType,
			versionFeatures: versionFeatures
		});
		if(res.ok){
			const resJson = await getResJson(res);
			upgradeProductKey = resJson.productKey as string;
		}
	}

	async function checkAndUpgrade(event: Event) {
		event.preventDefault();
		if(!upgradeProductKey){
			toaster.error({
				title: $_('outlet.detail.pickupProductKey.error.productKey')
			});
			return;
		}

		const res = await fetchActionWithNoForm("?/checkProductKey", {
			productKey: upgradeProductKey,
			outletId: outlet.id
		});

		if(res.ok){
			const resultJson = await getResJson(res);
			if(resultJson.result == 0){
				//注册码错误
				toaster.error({
					title: $_('outlet.detail.checkProductKey.error.productKey')
				});
				return;
			} else {
				//注册码正确
				let message = resultJson.message as Record<string, unknown>;
				
				if(resultJson.alert){
					let msg = message.params ? $_(message.msg as string, {values: message.params} as any) : $_(message.msg as string);
					if(!confirm(msg)){
						return;
					}
				}
				

				upgrade();
			}
		}
	}

	async function upgrade(){
		const res = await fetchActionWithNoForm("?/upgrade", {
			outletId: outlet.id,
			tradeNo: rj.tradeNo,
			wangwang: rj.wangwang,
			qq: rj.qq,
			remark: rj.remark,
			key: upgradeProductKey,
			giftFlag: ifGift ? 1 : 0,
			ut: outlet.productKey ? 1 : 0
		});
		
		if(res.ok){
			const resJson = await getResJson(res);
			if(resJson.result == 1){
				toaster.success({
					title: $_('outlet.detail.upgradeModal.success')
				});
				showUpgradeModal = false;
				return;
			}
		}
		
		toaster.error({
			title: $_('outlet.detail.upgradeModal.error')
		});
	}

    function setMainShopPre(company_id: number, id: number) {

    }

    function bindWxAlipayPre(company_id: number, id: number, is_wx: number, is_alipay: number) {
    }


	function reChargePre(company_id: number, id: number): any {
		throw new Error('Function not implemented.');
	}


	function cancelProductKey(arg0: number, arg1: number): any {
		throw new Error('Function not implemented.');
	}


	function activeMoveStock(arg0: number): any {
		throw new Error('Function not implemented.');
	}
</script>

<div class="w-full px-4 py-4">
	<div class="flex flex-col md:flex-row items-center justify-between mb-4">
		<h4 class="font-bold text-lg mb-2 md:mb-0">店铺详细资料</h4>
		<div class="flex flex-wrap gap-2">
			{#if data.outletType == 9}
			<button type="button"
				class={"btn active-outlet-btn " + (outlet.outletEnabled == 1 ? 'preset-outlined-error-500 text-error-500' : 'preset-outlined-primary-500')}
				name="outletId"
				onclick={(e) => activeOutlet(e, outlet.id as number)}
			>
				{outlet.outletEnabled == 1 ? $_('common.disabled') : $_('common.enabled')}
			</button>
			{/if}
			<button
				class="btn preset-outlined-primary-500"
				onclick={() => {showRemarkModal = true}}
			>
				{$_('outlet.detail.remark')}
			</button>
			{#if !outlet.productKey}
				<button
					class="btn preset-outlined-primary-500"
					onclick={() => {showUpgradeModal = true}}
				>
					{$_('outlet.detail.upgrade')}
				</button>
			{:else}
				{#if outlet.expiryDate}
				<button
					class="btn preset-outlined-primary-500"
					onclick={() => {showUpgradeModal = true}}
				>
				{$_('outlet.detail.renew')}
				</button>
				{/if}
				<button
					class="btn preset-outlined-error-500 text-error-500"
					onclick={() => cancelProductKey(outlet.id as number, outlet.isMainShop as number)}
				>
				{$_('outlet.detail.cancel')}
				</button>
			{/if}
			<button
				class={"btn " + (outlet.isMainShop == 1 ? 'preset-outlined-error-500 text-error-500' : 'preset-outlined-primary-500') + " main-shop-btn"}
				onclick={() => setMainShopPre(outlet.companyId as number, outlet.id as number)}
			>
				{outlet.isMainShop == 1 ? $_('outlet.detail.cancelMainShop') : $_('outlet.detail.setMainShop')}
			</button>
			
			{#if data.license == 1 && Number(outlet.type) == 1}
				<button
					class="btn preset-outlined-primary-500"
					onclick={() => activeMoveStock(outlet.companyId as number)}
				>
					{$_('outlet.detail.activeMoveStock')}
				</button>
			{/if}
			<button
				class={"btn " + (data.weixinFlag == 1 ? 'preset-outlined-error-500 text-error-500' : 'preset-outlined-primary-500')}
				onclick={() => bindWxAlipayPre(outlet.companyId as number, outlet.id as number, 1, 1)}
			>
				{data.weixinFlag == 1 ? $_('outlet.detail.unbindWxPay') : $_('outlet.detail.bindWxPay')}
			</button>
			<button
				class={"btn " + (data.alipayFlag == 1 ? 'preset-outlined-error-500 text-error-500' : 'preset-outlined-primary-500')}
				onclick={() => bindWxAlipayPre(outlet.companyId as number, outlet.id as number, 1, 2)}
			>
				{data.alipayFlag == 1 ? $_('outlet.detail.unbindAlipay') : $_('outlet.detail.bindAlipay')}
			</button>
			{#if data.outletType == 9}
			<button
				class="btn preset-outlined-primary-500"
				onclick={() => reChargePre(outlet.companyId as number, outlet.id as number)}
			>
				{$_('outlet.detail.recharge')}
			</button>
			<button
				class="btn preset-outlined-primary-500"
				onclick={() => showNetshopModal = true}
			>
				{$_('outlet.detail.netshopSetting')}
			</button>
			{/if}
		</div>
	</div>

	<div class="bg-base-100 rounded-lg shadow p-6 preset-outlined-surface-500">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- 第一列 -->
			<div class="border-r-2 border-surface-200">
				<div class="space-y-4">
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.storeName')}:</span>
						<span id="outlet_name_span" class="ml-2">{outlet.name}</span>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.type')}:</span>
						<div class="ml-2 flex items-center gap-2">
							{#if data.isChain}
								<span class="badge bg-primary-500">{$_('outlet.type.chainStore')}</span>
							{:else}
								<span class="badge bg-surface-500">{$_('outlet.type.singleStore')}</span>
							{/if}
                            {#if outlet.versionFeatures === 1}
								<span class="badge bg-primary-500" title="">{$_('outlet.versionFeatures.1')}</span>
							{:else}
								<span class="badge bg-success-500" title="">{$_('outlet.versionFeatures.0')}</span>
							{/if}
						</div>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.registrationCode')}:</span>
						<span class="ml-2">{outlet.productKey}</span>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.createDate')}:</span>
						<span class="ml-2">{dayjs(outlet.createDate).format('YYYY-MM-DD')}</span>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.expiryDate')}:</span>
						<span class="ml-2">{outlet.expiryDate ? dayjs(outlet.expiryDate).format('YYYY-MM-DD') : $_('outlet.longTerm')}</span>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.lastLoginTime')}:</span>
						<span class="ml-2">{data.lastLoginTime ? dayjs(data.lastLoginTime).format('YYYY-MM-DD') : $_('common.noRecord')}</span>
					</div>
				</div>
			</div>
			<!-- 第二列 -->
			<div class="border-r-2 border-surface-200">
				<div class="space-y-4">
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.status')}:</span>
						{#if outlet.outletEnabled == 1}
							<span class="ml-2 badge bg-success-500">{$_('common.enabled')}</span>
						{:else}
							<span class="ml-2 badge bg-error-500">{$_('common.disabled')}</span>
						{/if}
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.auth')}:</span>
						{#if outlet.productKey}
							<span class="ml-2 badge bg-primary-500">{$_('outlet.auth.official')}</span>
						{:else}
							<span class="ml-2 badge bg-surface-500">{$_('outlet.auth.trial')}</span>
						{/if}
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.expired')}:</span>
						{#if !outlet.expiryDate || dayjs(outlet.expiryDate) >= dayjs(new Date())}
							<span class="ml-2 badge bg-primary-500">{$_('outlet.notExpired')}</span>
						{:else}
							<span class="ml-2 badge bg-error-500">{$_('outlet.expired')}</span>
						{/if}
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.mobilePayment')}:</span>
						<div class="ml-2 flex gap-2">
							{#if data.weixinFlag == 1}
								<span class="badge bg-primary-500">{$_('payment.weixin')}</span>
							{/if}
							{#if data.alipayFlag == 1}
								<span class="badge bg-primary-500">{$_('payment.alipay')}</span>
							{/if}
						</div>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.wechatShop')}:</span>
						{#if outlet.netshopEnabled === 2}
							<span class="ml-2 badge bg-primary-500">{$_('common.enabled')}</span>
						{:else if outlet.netshopEnabled === 1}
							<span class="ml-2 badge bg-success-500">{$_('common.doNotEnabled')}</span>
						{:else}
							<span class="ml-2 badge bg-neutral-500">{$_('common.notEnabled')}</span>
						{/if}
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.wxCustomer')}:</span>
						{#if outlet.wxCustomerEnabled === 2}
							<span class="ml-2 badge bg-primary-500">{$_('common.enabled')}</span>
						{:else if outlet.wxCustomerEnabled === 1}
							<span class="ml-2 badge bg-success-500">{$_('common.doNotEnabled')}</span>
						{:else}
							<span class="ml-2 badge bg-neutral-500">{$_('common.notEnabled')}</span>
						{/if}
					</div>
				</div>
			</div>
			<!-- 第三列 -->
			<div>
				<div class="space-y-4">
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.agent')}:</span>
						<span class="ml-2">{ data.agentMap[outlet.agentId as number] || $_('productKeys.list.table.unkownAgent') }</span>
					</div>
					<div class="flex items-center">
						<span class="w-24 text-right font-semibold shrink-0">{$_('outlet.detail.remark')}:</span>
						<span class="ml-2 rmk">
							{$_('outlet.detail.remarkModal.orderNo')}: {rj.tradeNo}<br/>
							{$_('outlet.detail.remarkModal.wangwang')}: {rj.wangwang}<br/>
							{$_('outlet.detail.remarkModal.qq')}: {rj.qq}<br/>
							{$_('outlet.detail.remarkModal.others')}: {rj.remark}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="mt-8">
		<h4 class="font-bold text-lg mb-4">{$_('outlet.detail.user')}</h4>
		<div class="overflow-x-auto rounded-lg shadow preset-outlined-surface-500">
			<table class="table w-full">
				<thead>
					<tr>
						<th>{$_('user.email')}</th>
						<th>{$_('user.phoneNumber')}</th>
						<th>{$_('user.userNo')}</th>
						<th>{$_('user.jobNo')}</th>
						<th>{$_('user.status')}</th>
						<th>{$_('user.role')}</th>
						<th>{$_('user.createDate')}</th>
						<th>{$_('user.updateDate')}</th>
					</tr>
				</thead>
				<tbody>
				{#each data.userList as {app_user: user, role}, index}
					<tr>
						<td>{user.email}</td>
						<td>{user.phoneNumber}</td>
						<td>{user.userCode}</td>
						<td>{user.username}</td>
						<td>
							{#if user.accountEnabled}
								<span class="badge bg-success-500">{$_('common.enabled')}</span>
							{:else}
								<span class="badge bg-error-500">{$_('common.disabled')}</span>
							{/if}
						</td>
						<td>{role?.description}</td>
						<td>{user.createDate ? dayjs(user.createDate).format('YYYY-MM-DD') : ""}</td>
						<td>{user.updateDate ? dayjs(user.updateDate).format('YYYY-MM-DD') : ""}</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	</div>
	{#if data.isChain && data.outletList && data.outletList.length > 0}
	<div class="mt-8">
		<h4 class="font-bold text-lg mb-4">{$_('outlet.detail.otherOutlets')}</h4>
		
		<div class="overflow-x-auto rounded-lg shadow preset-outlined-surface-500">
			<table class="table w-full">
				<thead>
					<tr>
						<th>#</th>
						<th>{$_('outlets.list.table.columns.type')}</th>
						<th>{$_('outlets.list.table.columns.headOffice')}</th>
						<th>{$_('outlets.list.table.columns.authorization')}</th>
						<th>{$_('outlets.list.table.columns.status')}</th>
						<th>{$_('outlets.list.table.columns.expired')}</th>
						<th>{$_('outlets.list.table.columns.storeName')}</th>
						<th>{$_('outlets.list.table.columns.outletCode')}</th>
						<th>{$_('common.agent')}</th>
						<th>{$_('outlets.list.table.columns.registrationCode')}</th>
						<th>{$_('outlets.list.table.columns.expirationDate')}</th>
						<th>{$_('outlets.list.table.columns.creationDate')}</th>
						<th>{$_('outlets.list.table.columns.remarks')}</th>
						<th class="text-center">{$_('outlets.list.table.columns.operate')}</th>
					</tr>
				</thead>
				<tbody>
				{#each data.outletList as {outlet, company}, index}
					<tr>
						<td>{index + 1}</td>
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
							{#if outlet.isMainShop === 1}
								<span class="badge bg-primary-500">{$_('common.yes')}</span>
							{:else}
								<span class="badge bg-surface-500">{$_('common.no')}</span>
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
						<td>{outlet.name}</td>
						<td>{outlet.outletCode}</td>
						<td>{ data.agentMap[outlet.agentId as number] || $_('productKeys.list.table.unkownAgent') }</td>
						<td>{outlet.productKey}
							{#if outlet.productKey}
							  {#if outlet.versionFeatures === 1}
								<span class="badge bg-primary-500" title="{$_('outlet.versionFeatures.1')}">I</span>
							  {:else}
								<span class="badge bg-success-500" title="{$_('outlet.versionFeatures.0')}">D</span>
							  {/if}
							{/if}</td>
						<td>
							{#if outlet.expiryDate}
								{dayjs(outlet.expiryDate).format('YYYY-MM-DD')}
							{:else}
								{$_('outlet.longTerm')}
							{/if}
						</td>
						<td>{outlet.createDate ? dayjs(outlet.createDate).format('YYYY-MM-DD') : ""}</td>
						<td>{outlet.remark}</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
		</div>
	{/if}
	{#if data.upgradeLogList.length > 0}
	<hr class="my-4 border-surface-200" />
	<h4 class="font-bold text-lg mb-4">{$_('outlet.detail.upgrade_log.title')}</h4>
	<div class="overflow-x-auto rounded-lg shadow">
		<table class="table w-full">
			<thead>
				<tr>
					<th>#</th>
					<th>{$_('outlet.detail.upgrade_log.date')}</th>
					<th>{$_('outlet.detail.upgrade_log.type')}</th>
					<th>{$_('outlet.detail.upgrade_log.code')}</th>		
					<th>{$_('outlet.detail.upgrade_log.month')}</th>
					<th>{$_('outlet.detail.upgrade_log.original_expiry_date')}</th>
					<th>{$_('outlet.detail.upgrade_log.new_expiry_date')}</th>
					<th>{$_('outlet.detail.upgrade_log.remark')}</th>
				</tr>
			</thead>
			<tbody>
			{#each data.upgradeLogList as upgradeLog, index}
				<tr>
					<td>{index + 1}</td>
					<td>{dayjs(upgradeLog.upgradeDate).format('YYYY-MM-DD HH:mm:ss')}</td>
					<td>{upgradeLog.keyType == 0 ? $_('outlet.detail.upgrade_log.key_type.0') : $_('outlet.detail.upgrade_log.key_type.1')}</td>
					<td>{upgradeLog.productKey}</td>
					<td>{upgradeLog.monthCount}</td>
					<td>{dayjs(upgradeLog.currentExpiryDate).format('YYYY-MM-DD')}</td>
					<td>{dayjs(upgradeLog.finalExpiryDate).format('YYYY-MM-DD')}</td>
					<td>{upgradeLog.upgradeDesc}</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
	{/if}

	<Modal
		open={showRemarkModal}
		onOpenChange={(e) => (showRemarkModal = e.open)}
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
		backdropClasses="backdrop-blur-sm"
	>
	{#snippet content()}
		<header><h3 class="text-xl font-bold">{$_('outlet.detail.remark')}</h3></header>
		
		<div>
			<label class="label">{$_('outlet.detail.remarkModal.orderNo')}
			<input 
			type="text" 
			name="tradeNo"
			bind:value={rj.tradeNo}
			class="input preset-outlined-surface-500" 
			/></label>
		</div>
		<div>
			<label class="label">{$_('outlet.detail.remarkModal.wangwang')}
			<input 
			type="text" 
			name="wangwang"
			bind:value={rj.wangwang}
			class="input preset-outlined-surface-500"
			/></label>
		</div>
		<div>
			<label class="label">{$_('outlet.detail.remarkModal.qq')}
			<input 
			type="text" 
			name="qq"
			bind:value={rj.qq}
			class="input preset-outlined-surface-500"
			/></label>
		</div>
		<div>
			<label class="label">{$_('outlet.detail.remarkModal.others')}
			<input 
			type="text" 
			name="remark"
			bind:value={rj.remark}
			class="input preset-outlined-surface-500"
			/></label>
		</div>
		
		<div class="grid grid-cols-1 gap-2 max-h-[40px]">
			<button
			type="button"
			class="btn preset-outlined-primary-500"
			onclick={(e) => saveRemark(e)}
			>
			{$_('buttons.save')}
			</button>
		</div>
		{/snippet}
	</Modal>

	<Modal
		open={showUpgradeModal}
		onOpenChange={(e) => (showUpgradeModal = e.open)}
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm w-[500px] preset-outlined-surface-500"
		backdropClasses="backdrop-blur-sm"
		
	>
	{#snippet content()}
		<header><h2 class="text-2xl font-bold text-center">
			{#if !outlet.productKey}
			{$_('outlet.detail.upgrade')}
			{:else}
			{$_('outlet.detail.renew')}
			{/if}
		</h2><hr /></header>
		<div class="grid grid-rows-1 space-y-4">
			<h4 class="font-bold text-lg mb-1">{$_('outlet.detail.upgradeModal.productKey')}</h4>
			<div class="input-group grid-cols-[auto_1fr_auto]">
				<button class="ig-btn preset-filled-primary-500" onclick={() => pkShow = !pkShow}>
					{$_('outlet.detail.upgradeModal.getProductKeys')}</button>
				
				<input class="ig-input" name="productKey" type="text" placeholder=" {$_('outlet.detail.upgradeModal.enterProductKey')}" 
					bind:value={upgradeProductKey}/>
				
				<div class="ig-cell preset-outlined-primary-500">
					<label class="flex items-center space-x-2">
						<p>{$_('outlet.detail.upgradeModal.ifGift')}</p>
						<input type="checkbox" class="checkbox" name="ifGift" bind:checked={ifGift} />
					</label>
				</div>
				
			</div>
		</div>

		

		{#if pkShow}<div class="p-2 preset-outlined-surface-500">
		<div class="grid grid-cols-[1fr_auto] gap-2 mb-4">
			<AgentSelect id="agentId" agentTree={data.agentTree} bind:_value={productKey_agentId} showAll={true}/>
			<button type="submit" class="ig-btn preset-outlined-primary-500"
			onclick={(e) => pickupProductKey(e)}
			>{$_('buttons.confirm')}</button>
		</div>
		<div class="grid grid-cols-2 gap-2 mb-4">
			<label class="label flex items-center gap-2">
				<input type="radio" class="radio" name="up_pk_type" value="0" bind:group={keyType} />
				{$_('outlet.detail.upgrade_log.key_type.0')}</label>
			<label class="label flex items-center gap-2">
				<input type="radio" class="radio" name="up_pk_type" value="1" bind:group={keyType} />
				{$_('outlet.detail.upgrade_log.key_type.1')}</label>
		</div>
		<div class="grid grid-cols-2 gap-2">
			<label class="label flex items-center gap-2">
				<input type="radio" class="radio" name="up_pk_versionFeatures" value="1" bind:group={versionFeatures} />
				{$_('outlet.versionFeatures.1')}</label>
			<label class="label flex items-center gap-2">
				<input type="radio" class="radio" name="up_pk_versionFeatures" value="0" bind:group={versionFeatures} />
				{$_('outlet.versionFeatures.0')}</label>
		</div>
		</div>{/if}
		<div class="p-2 preset-outlined-surface-500">
		<h4 class="font-bold text-lg mb-1">{$_('outlet.detail.upgradeModal.remark')}</h4>
		<label class="label">{$_('outlet.detail.remarkModal.orderNo')}
			<input 
			type="text" 
			name="tradeNo"
			bind:value={rj.tradeNo}
			class="input preset-outlined-surface-500" 
			/></label>
		<label class="label">{$_('outlet.detail.remarkModal.wangwang')}
			<input 
			type="text" 
			name="wangwang"
			bind:value={rj.wangwang}
			class="input preset-outlined-surface-500"
			/></label>
		<label class="label">{$_('outlet.detail.remarkModal.qq')}
			<input 
			type="text" 
			name="qq"
			bind:value={rj.qq}
			class="input preset-outlined-surface-500"
			/></label>
		<label class="label">{$_('outlet.detail.remarkModal.others')}
			<input 
			type="text" 
			name="remark"
			bind:value={rj.remark}
			class="input preset-outlined-surface-500"
			/></label>
		</div>
		<div class="grid grid-cols-1 gap-2 max-h-[40px]">
			<button
				type="submit"
				class="btn preset-outlined-primary-500"
				onclick={(e) => checkAndUpgrade(e)}
			>
			{#if !outlet.productKey}
			{$_('outlet.detail.upgrade')}
			{:else}
			{$_('outlet.detail.renew')}
			{/if}
			</button>
		</div>
		{/snippet}
	</Modal>
</div>
<Toaster {toaster}/>