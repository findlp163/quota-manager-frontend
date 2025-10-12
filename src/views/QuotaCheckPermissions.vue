<template>
  <div class="quota-check-permissions">
    <div class="page-header">
      <h1 class="page-title">Quota Check Permissions</h1>
      <p class="page-subtitle">Query and configure quota-check settings for users and departments</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <!-- Combined: User Setting -->
        <el-tab-pane label="User Setting" name="user">
          <el-form :inline="true" label-width="160px" label-position="left" class="section-form" @submit.prevent>
            <el-form-item label="User ID (UUID)">
              <el-input v-model.trim="userForm.userId" placeholder="Enter user UUID" clearable style="width: 360px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingUser" @click="handleUserQuery">Query</el-button>
              <el-button :disabled="loadingUser" @click="handleUserResetAll">Reset</el-button>
            </el-form-item>
          </el-form>

          <div v-if="hasUserResult" class="result">
            <el-form label-width="160px" label-position="left" class="section-form">
              <el-form-item label="User">
                <span class="result-value">{{ userForm.userId }}</span>
              </el-form-item>
              <el-form-item label="Enabled">
                <el-switch v-model="editUserEnabled" @change="markUserDirty" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!userDirty" :loading="savingUser" @click="handleUserSave">Save</el-button>
                <el-button :disabled="!userDirty" @click="restoreUserOriginal">Undo</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- Combined: Department Setting -->
        <el-tab-pane label="Department Setting" name="department">
          <el-form :inline="true" label-width="160px" label-position="left" class="section-form" @submit.prevent>
            <el-form-item label="Department Name">
              <el-input v-model.trim="deptForm.departmentName" placeholder="Enter department name" clearable style="width: 360px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingDept" @click="handleDeptQuery">Query</el-button>
              <el-button :disabled="loadingDept" @click="handleDeptResetAll">Reset</el-button>
            </el-form-item>
          </el-form>

          <div v-if="hasDeptResult" class="result">
            <el-form label-width="160px" label-position="left" class="section-form">
              <el-form-item label="Department">
                <span class="result-value">{{ deptForm.departmentName }}</span>
              </el-form-item>
              <el-form-item label="Enabled">
                <el-switch v-model="editDeptEnabled" @change="markDeptDirty" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :disabled="!deptDirty" :loading="savingDept" @click="handleDeptSave">Save</el-button>
                <el-button :disabled="!deptDirty" @click="restoreDeptOriginal">Undo</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { quotaCheckPermissionApi } from '@/services/api'

const activeTab = ref('user')

// User combined state
const userForm = reactive({ userId: '' })
const loadingUser = ref(false)
const savingUser = ref(false)
const hasUserResult = ref(false)
const editUserEnabled = ref(false)
const originalUserEnabled = ref(false)
const userDirty = ref(false)

function markUserDirty() {
  userDirty.value = true
}

async function handleUserQuery() {
  if (!userForm.userId) {
    ElMessage.warning('Please input user UUID')
    return
  }
  loadingUser.value = true
  try {
    const res = await quotaCheckPermissionApi.getUserQuotaCheckSetting(userForm.userId)
    originalUserEnabled.value = !!res.data?.enabled
    editUserEnabled.value = originalUserEnabled.value
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
    await quotaCheckPermissionApi.setUserQuotaCheckSetting(userForm.userId, editUserEnabled.value)
    originalUserEnabled.value = editUserEnabled.value
    userDirty.value = false
    ElMessage.success('Saved successfully')
  } finally {
    savingUser.value = false
  }
}

function restoreUserOriginal() {
  editUserEnabled.value = originalUserEnabled.value
  userDirty.value = false
}

function handleUserResetAll() {
  userForm.userId = ''
  hasUserResult.value = false
  editUserEnabled.value = false
  originalUserEnabled.value = false
  userDirty.value = false
}

// Department combined state
const deptForm = reactive({ departmentName: '' })
const loadingDept = ref(false)
const savingDept = ref(false)
const hasDeptResult = ref(false)
const editDeptEnabled = ref(false)
const originalDeptEnabled = ref(false)
const deptDirty = ref(false)

function markDeptDirty() {
  deptDirty.value = true
}

async function handleDeptQuery() {
  if (!deptForm.departmentName) {
    ElMessage.warning('Please input department name')
    return
  }
  loadingDept.value = true
  try {
    const res = await quotaCheckPermissionApi.getDepartmentQuotaCheckSetting(deptForm.departmentName)
    originalDeptEnabled.value = !!res.data?.enabled
    editDeptEnabled.value = originalDeptEnabled.value
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
    await quotaCheckPermissionApi.setDepartmentQuotaCheckSetting(deptForm.departmentName, editDeptEnabled.value)
    originalDeptEnabled.value = editDeptEnabled.value
    deptDirty.value = false
    ElMessage.success('Saved successfully')
  } finally {
    savingDept.value = false
  }
}

function restoreDeptOriginal() {
  editDeptEnabled.value = originalDeptEnabled.value
  deptDirty.value = false
}

function handleDeptResetAll() {
  deptForm.departmentName = ''
  hasDeptResult.value = false
  editDeptEnabled.value = false
  originalDeptEnabled.value = false
  deptDirty.value = false
}
</script>

<style scoped>
.quota-check-permissions { min-height: calc(100vh - 120px); }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; }
.page-subtitle { margin-top: 6px; color: #606266; }
.section-form { margin-top: 10px; max-width: 720px; }
.result { margin-top: 14px; }
.result-row { display: flex; align-items: center; margin-bottom: 8px; }
.result-label { width: 140px; color: #606266; }
.result-value { color: #303133; }
</style>



