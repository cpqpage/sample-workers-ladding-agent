<script lang='ts'>
    import { _ } from 'svelte-i18n';
    let { versionFeatures } = $props();
</script>

<select name="versionFeatures" value={versionFeatures} class="select preset-outlined-surface-500">
    <option value="">{$_("productKeys.list.version.all")}</option>
    <option value="1">{$_("productKeys.list.version.1")}</option>
    <option value="0">{$_("productKeys.list.version.0")}</option>
</select>