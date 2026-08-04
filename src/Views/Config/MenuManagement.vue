<template>
  <div class="menuMgmtContainer">
    <!-- ==================== 上半：Standard / Item 各占一半 ==================== -->
    <div class="topHalf">
      <!-- 左：Standard 框 -->
      <div class="halfBox">
        <div class="boxTitle">Standard</div>
        <el-input v-model="standardSearch" placeholder="Search standard" clearable></el-input>
        <el-table :data="filteredStandards" border class="removeTableGaps" height="300" style="width: 100%">
          <el-table-column prop="standardCode" label="Code" width="120" show-overflow-tooltip></el-table-column>
          <el-table-column prop="standardCodeNameEn" label="Name En" min-width="140" show-overflow-tooltip></el-table-column>
          <el-table-column prop="standardCodeNameChn" label="Name Chn" min-width="140" show-overflow-tooltip></el-table-column>
          <el-table-column label="" width="55" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" circle @click="addStandardToMenu(scope.row)">+</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右：Item 框 -->
      <div class="halfBox">
        <div class="boxTitle">Item</div>
        <el-input v-model="itemSearch" placeholder="Search item" clearable></el-input>
        <el-table :data="filteredItems" border class="removeTableGaps" height="300" style="width: 100%">
          <el-table-column prop="nameEn" label="Name En" min-width="140" show-overflow-tooltip></el-table-column>
          <el-table-column prop="nameChn" label="Name Chn" min-width="140" show-overflow-tooltip></el-table-column>
          <el-table-column prop="group" label="Group" width="90" show-overflow-tooltip></el-table-column>
          <el-table-column label="" width="55" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" circle @click="addItemToMenu(scope.row)">+</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ==================== 下半：大框 ==================== -->
    <div class="bottomBox">
      <!-- 工具栏：买家 + Add Menu -->
      <div class="menuToolbar">
        <span class="toolbarLabel">Buyer</span>
        <el-select v-model="selectedBuyer" placeholder="Select buyer" filterable clearable style="width: 180px" @change="onBuyerChange">
          <el-option v-for="b in buyerOptions" :key="b.code" :value="b.code" :label="b.name"></el-option>
        </el-select>
        <el-button type="primary" @click="addMenuOpen">{{ $t('addMenu') }}</el-button>
      </div>

      <!-- 横向导航：已有 menu -->
      <div class="menuNav">
        <template v-if="currentMenus.length > 0">
          <el-tag
            v-for="m in currentMenus"
            :key="m.menuId"
            class="menuNavTag"
            :class="{ active: m.menuId === currentMenuId }"
            @click="currentMenuId = m.menuId"
          >{{ m.menuName }}</el-tag>
        </template>
        <span v-else class="emptyHint">No menu yet, click "Add Menu" to create one.</span>
      </div>

      <!-- 当前 menu 的 items -->
      <el-table :data="currentMenuItems" border class="removeTableGaps" style="width: 100%">
        <el-table-column label="Index" width="60">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="Item Name" min-width="140" show-overflow-tooltip>
          <template #default="scope">{{ testItemNameOf(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="Standard Code" min-width="140" show-overflow-tooltip>
          <template #default="scope">{{ (scope.row.standardIds || []).join(', ') }}</template>
        </el-table-column>
        <el-table-column prop="requirement" label="Requirement" min-width="140" show-overflow-tooltip></el-table-column>
        <el-table-column prop="buyerModifiedGroup" label="Group" width="90" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('operation')" width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" :icon="Edit" circle size="small" @click="editItem(scope.row)"></el-button>
            <el-popconfirm class="box-item" :title="$t('confirmDelete')" @confirm="deleteItem(scope.row)">
              <template #reference>
                <el-button type="danger" :icon="Delete" circle size="small" style="margin-left: 4px"></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Add Menu 对话框 -->
    <el-dialog :title="$t('addMenu')" v-model="addMenuDialog" width="400px">
      <el-form :model="newMenuForm" label-width="90px">
        <el-form-item label="Menu ID">
          <el-input v-model="newMenuForm.menuId" placeholder="Menu ID"></el-input>
        </el-form-item>
        <el-form-item :label="$t('menuName')">
          <el-input v-model="newMenuForm.name" placeholder="Menu name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmAddMenu">{{ $t('confirm') }}</el-button>
        <el-button @click="addMenuDialog = false">{{ $t('cancel') }}</el-button>
      </template>
    </el-dialog>

    <!-- 编辑 Item 对话框 -->
    <el-dialog :title="$t('editItem')" v-model="editDialog" width="480px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="Test Item ID">
          <el-input v-model="editForm.testItemId" disabled></el-input>
        </el-form-item>
        <el-form-item label="Standard Code">
          <el-input v-model="editForm.standardIdsText" placeholder="多个标准用逗号分隔"></el-input>
        </el-form-item>
        <el-form-item label="Requirement">
          <el-input v-model="editForm.requirement"></el-input>
        </el-form-item>
        <el-form-item label="Group">
          <el-input v-model="editForm.buyerModifiedGroup"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="confirmEditItem">{{ $t('confirm') }}</el-button>
        <el-button @click="editDialog = false">{{ $t('cancel') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import { Delete, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const request = inject("request");

// ==================== 上半：Standard / Item 参考列表 ====================
const standards = ref([]);
const items = ref([]);
const standardSearch = ref('');
const itemSearch = ref('');

const filteredStandards = computed(() => {
  const kw = standardSearch.value.trim().toLowerCase();
  if (!kw) return standards.value;
  return standards.value.filter(s =>
    (s.standardCode || '').toLowerCase().includes(kw) ||
    (s.standardCodeNameEn || '').toLowerCase().includes(kw) ||
    (s.standardCodeNameChn || '').toLowerCase().includes(kw));
});

const filteredItems = computed(() => {
  const kw = itemSearch.value.trim().toLowerCase();
  if (!kw) return items.value;
  return items.value.filter(i =>
    (i.nameEn || '').toLowerCase().includes(kw) ||
    (i.nameChn || '').toLowerCase().includes(kw) ||
    (i.group || '').toLowerCase().includes(kw));
});

// ==================== 下半：买家 + menu（真实后端 API） ====================
const buyerOptions = ref([]);       // [{code: buyerCode, name: buyerName}]
const selectedBuyer = ref('');      // 存 buyerCode
const menus = ref([]);              // 当前买家已加载的 menu（MenuResponseDto[]）
const currentMenuId = ref('');    // 当前选中的 menuId

const currentMenus = computed(() => menus.value);
const currentMenuItems = computed(() =>
  menus.value.find(m => m.menuId === currentMenuId.value)?.menuItems || []);

// 从已加载 items 中按 testItemId 查名称
function testItemNameOf(row) {
  const id = row?.testItemId;
  if (!id) return '';
  const it = items.value.find(i => i.id === id);
  return it ? (it.nameEn || it.nameChn || id) : id;
}

function onBuyerChange() {
  menus.value = [];
  currentMenuId.value = '';
  loadMenusByBuyer(selectedBuyer.value);
}

// 加载某买家下的所有套餐
function loadMenusByBuyer(buyerId) {
  if (!buyerId) return;
  request.get(`/Menu/get-by-buyerId/${buyerId}`).then(res => {
    menus.value = res.data.isSuccess ? (res.data.value || []) : [];
    currentMenuId.value = menus.value[0]?.menuId || '';
  }).catch(() => {
    menus.value = [];
    currentMenuId.value = '';
  });
}

// 点击上半 Standard/Item 的 + 按钮 → 调后端加入当前 menu
function addStandardToMenu(row) {
  addItem({ testItemId: null, standardIds: [row.standardId], requirement: '', buyerModifiedGroup: '' });
}
function addItemToMenu(row) {
  addItem({ testItemId: row.id, standardIds: [], requirement: '', buyerModifiedGroup: row.group });
}
function addItem(payload) {
  if (!currentMenuId.value) { ElMessage.warning('请先选择/创建套餐'); return; }
  request.post(`/Menu/add/${currentMenuId.value}/item`, { menuId: currentMenuId.value, menuItem: payload })
    .then(res => {
      if (res.data.isSuccess) { ElMessage.success('已添加'); loadMenusByBuyer(selectedBuyer.value); }
      else ElMessage.error(res.data.error || '添加失败');
    }).catch(() => ElMessage.error('网络错误'));
}

// Add Menu（前端输入 MenuId + 名称）
const addMenuDialog = ref(false);
const newMenuForm = reactive({ menuId: '', name: '' });
function addMenuOpen() {
  newMenuForm.menuId = '';
  newMenuForm.name = '';
  addMenuDialog.value = true;
}
function confirmAddMenu() {
  const menuId = newMenuForm.menuId.trim();
  const name = newMenuForm.name.trim();
  if (!menuId) { ElMessage.warning('请输入套餐ID'); return; }
  if (!name) { ElMessage.warning('请输入套餐名称'); return; }
  request.post('/Menu/add', {
    menuId, menuName: name, menuItems: [], remark: '', status: 'Draft', buyerId: selectedBuyer.value
  }).then(res => {
    if (res.data.isSuccess) { ElMessage.success('添加成功'); addMenuDialog.value = false; loadMenusByBuyer(selectedBuyer.value); }
    else ElMessage.error(res.data.error || '添加失败');
  }).catch(() => ElMessage.error('网络错误'));
}

// 编辑 menu item（用 item 的 id 定位）
const editDialog = ref(false);
const editForm = ref({ id: '', testItemId: '', standardIdsText: '', requirement: '', buyerModifiedGroup: '' });
function editItem(row) {
  editForm.value = {
    id: row.id,
    testItemId: row.testItemId || '',
    standardIdsText: (row.standardIds || []).join(', '),
    requirement: row.requirement || '',
    buyerModifiedGroup: row.buyerModifiedGroup || ''
  };
  editDialog.value = true;
}
function confirmEditItem() {
  const payload = {
    id: editForm.value.id,
    testItemId: editForm.value.testItemId || null,
    standardIds: editForm.value.standardIdsText.split(',').map(s => s.trim()).filter(Boolean),
    requirement: editForm.value.requirement,
    buyerModifiedGroup: editForm.value.buyerModifiedGroup
  };
  request.put(`/Menu/update/${currentMenuId.value}/item`, { menuId: currentMenuId.value, menuItem: payload })
    .then(res => {
      if (res.data.isSuccess) { ElMessage.success('已更新'); editDialog.value = false; loadMenusByBuyer(selectedBuyer.value); }
      else ElMessage.error(res.data.error || '更新失败');
    }).catch(() => ElMessage.error('网络错误'));
}

// 删除 menu item
function deleteItem(row) {
  request.delete(`/Menu/delete/${currentMenuId.value}/item/${row.id}`)
    .then(res => {
      if (res.data.isSuccess) { ElMessage.success('已删除'); loadMenusByBuyer(selectedBuyer.value); }
      else ElMessage.error(res.data.error || '删除失败');
    }).catch(() => ElMessage.error('网络错误'));
}

// ==================== 初始化 ====================
onMounted(() => {
  request.get('/buyer/buyer-list').then(res => {
    if (res.data.isSuccess) buyerOptions.value = (res.data.value || []).map(b => ({ code: b.buyerCode, name: b.buyerName }));
  }).catch(() => {});
  request.get('/Standard/getall').then(res => {
    if (res.data.isSuccess) standards.value = res.data.value || [];
  }).catch(() => {});
  request.get('/TestItem/getall').then(res => {
    if (res.data.isSuccess) items.value = res.data.value || [];
  }).catch(() => {});
});
</script>

<style scoped lang="scss">
.menuMgmtContainer {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topHalf {
  display: flex;
  gap: 15px;
}

.halfBox {
  flex: 1;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.boxTitle {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.bottomBox {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menuToolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbarLabel {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.menuNav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 8px;
  min-height: 34px;
}

.menuNavTag {
  cursor: pointer;
}

.menuNavTag.active {
  background: var(--el-color-primary);
  color: #fff;
  border-color: var(--el-color-primary);
}

.emptyHint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.removeTableGaps :deep(table) {
  margin-bottom: 0 !important;
}
</style>
