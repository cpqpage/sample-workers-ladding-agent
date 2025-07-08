<script lang="ts">
  const { data } = $props();
</script>

<div class="container mx-auto p-4">
  <h2 class="h2 mb-4">短信余额与充值</h2>
  
  <div class="card p-4 mb-8">
    <h3 class="h3 mb-4">当前余额</h3>
    <div class="text-2xl font-bold">{data.balance} 条</div>
    <button class="btn variant-filled-primary mt-4">充值</button>
  </div>

  <h3 class="h3 mb-4">最近充值记录</h3>
  <Table source={data.chargeHistory} interactive={true}>
    <svelte:fragment slot="header">
      <tr>
        <th>ID</th>
        <th>充值数量</th>
        <th>支付金额</th>
        <th>支付状态</th>
        <th>充值时间</th>
      </tr>
    </svelte:fragment>
    
    <svelte:fragment slot="body" let:row>
      <tr>
        <td>{row.id}</td>
        <td>{row.amount} 条</td>
        <td>¥{row.price}</td>
        <td>{row.status}</td>
        <td>{row.createdAt}</td>
      </tr>
    </svelte:fragment>
  </Table>
</div> 