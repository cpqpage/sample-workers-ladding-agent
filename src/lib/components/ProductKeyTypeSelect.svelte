<script lang='ts'>
    import { _ } from 'svelte-i18n';
    let { type } = $props();
</script>

<select name="type" value={type} class="select preset-outlined-surface-500">
    <option value="">{$_("productKeys.list.type.all")}</option>
    <option value="0">{$_("productKeys.list.type.0")}</option>
    <option value="1">{$_("productKeys.list.type.1")}</option>
</select>