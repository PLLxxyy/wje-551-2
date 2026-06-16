<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { suppliersApi } from '../api/suppliers';
import DataTable from '../components/common/DataTable.vue';
import StatusBadge from '../components/common/StatusBadge.vue';
import { useSupplierStore } from '../stores/supplierStore';
import { formatDate } from '../utils/format';

const route = useRoute();
const store = useSupplierStore();
onMounted(() => store.fetchDetail(String(route.params.id)));
async function rate() { await suppliersApi.rating(String(route.params.id), 4.8, '本月准时率优秀'); await store.fetchDetail(String(route.params.id)); }
</script>

<template>
  <section v-if="store.current">
    <div class="page-title"><h2>{{ store.current.name }}</h2><StatusBadge :value="store.current.status" /></div>
    <div class="grid two">
      <div class="panel">
        <h3>基本信息</h3>
        <p>联系人：{{ store.current.contact }} / {{ store.current.phone }}</p>
        <p>邮箱：{{ store.current.email }}</p>
        <p>地址：{{ store.current.address }}</p>
        <div class="rating-row">
          <div class="rating-item">
          <span class="rating-label">人工评分</span>
          <strong class="rating-value">{{ store.current.rating }}</strong>
        </div>
        <div class="rating-item">
          <span class="rating-label">到货准时率</span>
          <strong class="rating-value on-time">{{ store.current.onTimeRate }}%</strong>
        </div>
        </div>
        <p class="on-time-detail">准时运单 {{ store.current.onTimeCount }} / {{ store.current.totalDelivered }} 单</p>
        <button class="btn secondary" @click="rate">新增评分 4.8</button>
      </div>
      <div class="panel">
        <h3>评分历史</h3>
        <p v-for="item in store.current.ratingHistory" :key="item.id">{{ item.score }} 分 · {{ item.remark }} · {{ formatDate(item.createdAt) }}</p>
      </div>
    </div>
    <h3>关联运单</h3>
    <DataTable :columns="[{key:'orderNo',title:'运单'},{key:'status',title:'状态'},{key:'estimatedArrival',title:'预计到达'},{key:'actualArrival',title:'实际到达'},{key:'createdAt',title:'创建时间'}]" :data="(store.current as any).shipments ?? []">
      <template #status="{ row }"><StatusBadge :value="row.status" /></template>
      <template #estimatedArrival="{ row }">{{ row.estimatedArrival ? formatDate(row.estimatedArrival) : '-' }}</template>
      <template #actualArrival="{ row }">{{ row.actualArrival ? formatDate(row.actualArrival) : '-' }}</template>
      <template #createdAt="{ row }">{{ formatDate(row.createdAt) }}</template>
    </DataTable>
  </section>
</template>

<style scoped>
.rating-row {
  display: flex;
  gap: 24px;
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid #e8ecef;
  border-bottom: 1px solid #e8ecef;
}
.rating-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rating-label {
  font-size: 13px;
  color: #657068;
}
.rating-value {
  font-size: 28px;
  font-weight: 600;
  color: #17241f;
}
.rating-value.on-time {
  color: #2f8a4f;
}
.on-time-detail {
  font-size: 13px;
  color: #657068;
  margin-top: 0 0 12px;
}
</style>
