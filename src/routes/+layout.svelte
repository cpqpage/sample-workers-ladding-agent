<script lang="ts">
	import '../app.css';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import { locale, waitLocale } from 'svelte-i18n';
	import { initI18n } from '$lib/i18n';
	let { children, data } = $props();
	
	initI18n();
	// 设置初始语言
	locale.set(data.lang);
	// 等待语言设置完成
	waitLocale();
</script>
{@render children()}
<LanguageSwitcher />
