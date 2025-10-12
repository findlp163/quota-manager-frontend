<template>
  <div class="model-whitelist">
    <div class="page-header">
      <h1 class="page-title">Model Whitelist</h1>
      <p class="page-subtitle">Query and configure user model whitelists</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <!-- Combined: Query + Edit User Whitelist -->
        <el-tab-pane label="User Whitelist" name="user">
          <!-- Search -->
          <el-form :inline="true" label-width="160px" label-position="left" class="section-form" @submit.prevent>
            <el-form-item label="User ID (UUID)">
              <el-input
                v-model.trim="userForm.userId"
                placeholder="Enter user UUID"
                clearable
                style="width: 360px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingUser" @click="handleUserQuery">Query</el-button>
              <el-button :disabled="loadingUser" @click="handleUserResetAll">Reset</el-button>
            </el-form-item>
          </el-form>

          <!-- Result + Editor -->
          <div v-if="hasUserResult" class="result">
            <div class="result-row">
              <el-space wrap>
                <el-tag type="info">Current: {{ originalModels.length }}</el-tag>
                <el-tag type="success">Added: {{ addedModels.length }}</el-tag>
                <el-tag type="danger">Removed: {{ removedModels.length }}</el-tag>
              </el-space>
            </div>

            <el-form label-width="160px" label-position="left" class="section-form">
              <el-form-item label="User">
                <span class="result-value">{{ userForm.userId }}</span>
              </el-form-item>
              <el-form-item label="Models">
                <div class="tags-input">
                  <el-space wrap>
                    <el-tag
                      v-for="m in editModels"
                      :key="m"
                      closable
                      class="tag"
                      @close="removeModel(m)"
                    >{{ m }}</el-tag>

                    <el-input
                      v-model.trim="newModel"
                      placeholder="Type and press Enter to add"
                      clearable
                      class="tag-input"
                      @keyup.enter="addModel()"
                      @clear="onClearInput"
                    />
                    <el-button type="primary" text @click="addModel">Add</el-button>
                  </el-space>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!userDirty" :loading="savingUser" @click="handleUserSave">Save</el-button>
                <el-button :disabled="!userDirty" @click="restoreUserOriginal">Undo</el-button>
                <el-popconfirm title="Clear all whitelist models for this user?" @confirm="clearUserAll">
                  <template #reference>
                    <el-button type="danger" text>Clear All</el-button>
                  </template>
                </el-popconfirm>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- Combined: Query + Edit Department Whitelist -->
        <el-tab-pane label="Department Whitelist" name="department">
          <!-- Search -->
          <el-form :inline="true" label-width="160px" label-position="left" class="section-form" @submit.prevent>
            <el-form-item label="Department Name">
              <el-input
                v-model.trim="deptForm.departmentName"
                placeholder="Enter department name"
                clearable
                style="width: 360px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingDept" @click="handleDeptQuery">Query</el-button>
              <el-button :disabled="loadingDept" @click="handleDeptResetAll">Reset</el-button>
            </el-form-item>
          </el-form>

          <!-- Result + Editor -->
          <div v-if="hasDeptResult" class="result">
            <div class="result-row">
              <el-space wrap>
                <el-tag type="info">Current: {{ deptOriginalModels.length }}</el-tag>
                <el-tag type="success">Added: {{ deptAddedModels.length }}</el-tag>
                <el-tag type="danger">Removed: {{ deptRemovedModels.length }}</el-tag>
              </el-space>
            </div>

            <el-form label-width="160px" label-position="left" class="section-form">
              <el-form-item label="Department">
                <span class="result-value">{{ deptForm.departmentName }}</span>
              </el-form-item>
              <el-form-item label="Models">
                <div class="tags-input">
                  <el-space wrap>
                    <el-tag
                      v-for="m in deptEditModels"
                      :key="m"
                      closable
                      class="tag"
                      @close="removeDeptModel(m)"
                    >{{ m }}</el-tag>

                    <el-input
                      v-model.trim="newDeptModel"
                      placeholder="Type and press Enter to add"
                      clearable
                      class="tag-input"
                      @keyup.enter="addDeptModel()"
                      @clear="onClearDeptInput"
                    />
                    <el-button type="primary" text @click="addDeptModel">Add</el-button>
                  </el-space>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!deptDirty" :loading="savingDept" @click="handleDeptSave">Save</el-button>
                <el-button :disabled="!deptDirty" @click="restoreDeptOriginal">Undo</el-button>
                <el-popconfirm title="Clear all whitelist models for this department?" @confirm="clearDeptAll">
                  <template #reference>
                    <el-button type="danger" text>Clear All</el-button>
                  </template>
                </el-popconfirm>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { modelPermissionApi } from '@/services/api'

const activeTab = ref('user')

// Combined User Whitelist state
const userForm = reactive({ userId: '' })
const loadingUser = ref(false)
const savingUser = ref(false)
const hasUserResult = ref(false)

const originalModels = ref([])
const editModels = ref([])
const userDirty = ref(false)
const newModel = ref('')

const addedModels = computed(() => editModels.value.filter(v => !originalModels.value.includes(v)))
const removedModels = computed(() => originalModels.value.filter(v => !editModels.value.includes(v)))

function markUserDirty() {
  userDirty.value = true
}

function addModel() {
  const value = (newModel.value || '').trim()
  if (!value) return
  if (!editModels.value.includes(value)) {
    editModels.value.push(value)
    markUserDirty()
  }
  newModel.value = ''
}

function removeModel(model) {
  const index = editModels.value.indexOf(model)
  if (index !== -1) {
    editModels.value.splice(index, 1)
    markUserDirty()
  }
}

function onClearInput() {
  newModel.value = ''
}

async function handleUserQuery() {
  if (!userForm.userId) {
    ElMessage.warning('Please input user UUID')
    return
  }
  loadingUser.value = true
  try {
    const res = await modelPermissionApi.getUserWhitelist(userForm.userId)
    originalModels.value = res.data?.models || []
    editModels.value = [...originalModels.value]
    hasUserResult.value = true
    userDirty.value = false
    ElMessage.success('Fetched successfully')
  } catch (e) {
    hasUserResult.value = false
  } finally {
    loadingUser.value = false
  }
}

async function handleUserSave() {
  if (!userDirty.value || !userForm.userId) return
  savingUser.value = true
  try {
    await modelPermissionApi.setUserWhitelist(userForm.userId, editModels.value)
    originalModels.value = [...editModels.value]
    userDirty.value = false
    ElMessage.success('Saved successfully')
  } finally {
    savingUser.value = false
  }
}

function restoreUserOriginal() {
  editModels.value = [...originalModels.value]
  userDirty.value = false
}

function clearUserAll() {
  editModels.value = []
  userDirty.value = true
}

function handleUserResetAll() {
  userForm.userId = ''
  hasUserResult.value = false
  originalModels.value = []
  editModels.value = []
  userDirty.value = false
}

// Department combined state
const deptForm = reactive({ departmentName: '' })
const loadingDept = ref(false)
const savingDept = ref(false)
const hasDeptResult = ref(false)

const deptOriginalModels = ref([])
const deptEditModels = ref([])
const deptDirty = ref(false)
const newDeptModel = ref('')

const deptAddedModels = computed(() => deptEditModels.value.filter(v => !deptOriginalModels.value.includes(v)))
const deptRemovedModels = computed(() => deptOriginalModels.value.filter(v => !deptEditModels.value.includes(v)))

function markDeptDirty() {
  deptDirty.value = true
}

function addDeptModel() {
  const value = (newDeptModel.value || '').trim()
  if (!value) return
  if (!deptEditModels.value.includes(value)) {
    deptEditModels.value.push(value)
    markDeptDirty()
  }
  newDeptModel.value = ''
}

function removeDeptModel(model) {
  const index = deptEditModels.value.indexOf(model)
  if (index !== -1) {
    deptEditModels.value.splice(index, 1)
    markDeptDirty()
  }
}

function onClearDeptInput() {
  newDeptModel.value = ''
}

async function handleDeptQuery() {
  if (!deptForm.departmentName) {
    ElMessage.warning('Please input department name')
    return
  }
  loadingDept.value = true
  try {
    const res = await modelPermissionApi.getDepartmentWhitelist(deptForm.departmentName)
    deptOriginalModels.value = res.data?.models || []
    deptEditModels.value = [...deptOriginalModels.value]
    hasDeptResult.value = true
    deptDirty.value = false
    ElMessage.success('Fetched successfully')
  } catch (e) {
    hasDeptResult.value = false
  } finally {
    loadingDept.value = false
  }
}

async function handleDeptSave() {
  if (!deptDirty.value || !deptForm.departmentName) return
  savingDept.value = true
  try {
    await modelPermissionApi.setDepartmentWhitelist(deptForm.departmentName, deptEditModels.value)
    deptOriginalModels.value = [...deptEditModels.value]
    deptDirty.value = false
    ElMessage.success('Saved successfully')
  } finally {
    savingDept.value = false
  }
}

function restoreDeptOriginal() {
  deptEditModels.value = [...deptOriginalModels.value]
  deptDirty.value = false
}

function clearDeptAll() {
  deptEditModels.value = []
  deptDirty.value = true
}

function handleDeptResetAll() {
  deptForm.departmentName = ''
  hasDeptResult.value = false
  deptOriginalModels.value = []
  deptEditModels.value = []
  deptDirty.value = false
}
</script>

<style scoped>
.model-whitelist {
  min-height: calc(100vh - 120px);
}
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
.page-subtitle {
  margin-top: 6px;
  color: #606266;
}
.section-form {
  margin-top: 10px;
  max-width: 720px;
}
.result {
  margin-top: 14px;
}
.result-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.result-label {
  width: 120px;
  color: #606266;
}
.result-value {
  color: #303133;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  margin-right: 6px;
}
.tags-input {
  width: 100%;
}
.tag-input :deep(.el-input__wrapper) {
  padding-left: 10px;
  padding-right: 10px;
}
.section-form :deep(.el-form-item__label) {
  white-space: nowrap;
  text-align: left;
}
.empty {
  color: #909399;
}
</style>






