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
      <!-- 工具栏：单号 + 买家 + Add Menu -->
      <div class="menuToolbar">
        <span class="toolbarLabel">Report No.</span>
        <el-input v-model="reportNo" placeholder="report no." style="width: 180px" clearable></el-input>
        <span class="toolbarLabel">Buyer</span>
        <el-select v-model="selectedBuyer" placeholder="Select buyer" filterable clearable style="width: 180px" @change="onBuyerChange">
          <el-option v-for="b in buyerOptions" :key="b" :value="b" :label="b"></el-option>
        </el-select>
        <el-button type="primary" @click="addMenuOpen">{{ $t('addMenu') }}</el-button>
      </div>

      <!-- 横向导航：已有 menu -->
      <div class="menuNav">
        <template v-if="currentMenus.length > 0">
          <el-tag
            v-for="m in currentMenus"
            :key="m.name"
            class="menuNavTag"
            :class="{ active: m.name === currentMenuName }"
            @click="currentMenuName = m.name"
          >{{ m.name }}</el-tag>
        </template>
        <span v-else class="emptyHint">No menu yet, click "Add Menu" to create one.</span>
      </div>

      <!-- 当前 menu 的 items -->
      <el-table :data="currentMenuItems" border class="removeTableGaps" style="width: 100%">
        <el-table-column prop="index" label="Index" width="60"></el-table-column>
        <el-table-column prop="itemName" label="Item Name" min-width="140" show-overflow-tooltip></el-table-column>
        <el-table-column prop="standardCode" label="Standard Code" min-width="140" show-overflow-tooltip></el-table-column>
        <el-table-column prop="requirement" label="Requirement" min-width="140" show-overflow-tooltip></el-table-column>
        <el-table-column prop="group" label="Group" width="90" show-overflow-tooltip></el-table-column>
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
        <el-form-item label="Index">
          <el-input v-model="editForm.index" disabled></el-input>
        </el-form-item>
        <el-form-item label="Item Name">
          <el-input v-model="editForm.itemName"></el-input>
        </el-form-item>
        <el-form-item label="Standard Code">
          <el-input v-model="editForm.standardCode"></el-input>
        </el-form-item>
        <el-form-item label="Requirement">
          <el-input v-model="editForm.requirement"></el-input>
        </el-form-item>
        <el-form-item label="Group">
          <el-input v-model="editForm.group"></el-input>
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

// ==================== 下半：买家 + menu（mock，只存内存） ====================
const reportNo = ref('');                    // 单号，仅参考展示，不参与过滤
const buyerOptions = ref([]);
const selectedBuyer = ref('');
const currentMenuName = ref('');

// menu 数据按买家存放：{ [buyer]: [{ name, items: [{index,itemName,standardCode,requirement,group}] }] }
const menusByBuyer = reactive({});

const currentMenus = computed(() => menusByBuyer[selectedBuyer.value] || []);
const currentMenuItems = computed(() =>
  currentMenus.value.find(m => m.name === currentMenuName.value)?.items || []);

let idSeq = 1;   // 行内 index 自增

function onBuyerChange() {
  currentMenuName.value = currentMenus.value[0]?.name || '';
}

// 点击上半 Standard/Item 的 + 按钮 → 加入当前 menu
function addStandardToMenu(row) {
  pushRow({ standardCode: row.standardCode });
}
function addItemToMenu(row) {
  pushRow({ itemName: row.nameEn || row.nameChn });
}
function pushRow(partial) {
  if (!selectedBuyer.value) { ElMessage.warning('Please select a buyer first'); return; }
  if (currentMenus.value.length === 0) { ElMessage.warning('Please add a menu first'); return; }
  currentMenuItems.value.push({
    index: String(idSeq++),
    itemName: '',
    standardCode: '',
    requirement: '',
    group: '',
    ...partial
  });
}

// Add Menu
const addMenuDialog = ref(false);
const newMenuForm = reactive({ name: '' });
function addMenuOpen() {
  newMenuForm.name = '';
  addMenuDialog.value = true;
}
function confirmAddMenu() {
  const name = newMenuForm.name.trim();
  if (!name) { ElMessage.warning('Please enter a menu name'); return; }
  if (!menusByBuyer[selectedBuyer.value]) menusByBuyer[selectedBuyer.value] = [];
  menusByBuyer[selectedBuyer.value].push({ name, items: [] });
  currentMenuName.value = name;
  addMenuDialog.value = false;
}

// 编辑 / 删除 menu item
const editDialog = ref(false);
const editForm = ref({ index: '', itemName: '', standardCode: '', requirement: '', group: '' });
function editItem(row) {
  editForm.value = { ...row };
  editDialog.value = true;
}
function confirmEditItem() {
  const r = currentMenuItems.value.find(x => x.index === editForm.value.index);
  if (r) Object.assign(r, editForm.value);
  editDialog.value = false;
}
function deleteItem(row) {
  const i = currentMenuItems.value.findIndex(x => x.index === row.index);
  if (i > -1) currentMenuItems.value.splice(i, 1);
}

// ==================== 初始化 ====================
onMounted(() => {
  request.get('/buyer/buyer-list').then(res => {
    if (res.data.isSuccess) buyerOptions.value = (res.data.value || []).map(b => b.buyerName);
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
