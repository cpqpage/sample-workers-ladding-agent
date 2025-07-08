<script lang="ts">
  const { data } = $props();
</script>

<div class="container mx-auto p-4">
  <h2 class="h2 mb-4">短信发送记录</h2>
  
  <Table source={sentMessages} interactive={true}>
    <svelte:fragment slot="header">
      <tr>
        <th>ID</th>
        <th>接收手机</th>
        <th>短信内容</th>
        <th>发送状态</th>
        <th>发送时间</th>
      </tr>
    </svelte:fragment>
    
    <svelte:fragment slot="body" let:row>
      <tr>
        <td>{row.id}</td>
        <td>{row.phoneNumber}</td>
        <td>{row.content}</td>
        <td>{row.status}</td>
        <td>{row.createdAt}</td>
      </tr>
    </svelte:fragment>
  </Table>
</div> 