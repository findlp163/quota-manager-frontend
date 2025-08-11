<template>
  <div class="star-check-permissions">
    <div class="page-header">
      <h1 class="page-title">Star Check Permissions</h1>
      <p class="page-subtitle">Query and configure star-check settings for users and departments</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Query User Setting" name="queryUser">
          <el-form :inline="true" :model="queryUserForm" class="section-form">
            <el-form-item label="User ID (UUID)">
              <el-input v-model="queryUserForm.userId" placeholder="Enter user UUID" clearable style="width: 360px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingQueryUser" @click="handleQueryUser">Query</el-button>
            </el-form-item>
          </el-form>

          <div v-if="queryUserResult" class="result">
            <div class="result-row">
              <span class="result-label">User:</span>
              <span class="result-value">{{ queryUserResult.user_id }}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Enabled:</span>
              <el-tag :type="queryUserResult.enabled ? 'success' : 'warning'">{{ queryUserResult.enabled ? 'true' : 'false' }}</el-tag>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Set User Setting" name="setUser">
          <el-form ref="setUserFormRef" :model="setUserForm" :rules="setUserRules" label-width="160px" class="section-form">
            <el-form-item label="User ID (UUID)" prop="userId">
              <el-input v-model="setUserForm.userId" placeholder="Enter user UUID" clearable />
            </el-form-item>
            <el-form-item label="Enabled" prop="enabled">
              <el-switch v-model="setUserForm.enabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingSetUser" @click="handleSetUser">Save</el-button>
              <el-button @click="resetSetUser">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Query Department Setting" name="queryDept">
          <el-form :inline="true" :model="queryDeptForm" class="section-form">
            <el-form-item label="Department Name">
              <el-input v-model="queryDeptForm.departmentName" placeholder="Enter department name" clearable style="width: 360px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingQueryDept" @click="handleQueryDept">Query</el-button>
            </el-form-item>
          </el-form>

          <div v-if="queryDeptResult" class="result">
            <div class="result-row">
              <span class="result-label">Department:</span>
              <span class="result-value">{{ queryDeptResult.department_name }}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Enabled:</span>
              <el-tag :type="queryDeptResult.enabled ? 'success' : 'warning'">{{ queryDeptResult.enabled ? 'true' : 'false' }}</el-tag>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Set Department Setting" name="setDept">
          <el-form ref="setDeptFormRef" :model="setDeptForm" :rules="setDeptRules" label-width="160px" class="section-form">
            <el-form-item label="Department Name" prop="departmentName">
              <el-input v-model="setDeptForm.departmentName" placeholder="Enter department name" clearable />
            </el-form-item>
            <el-form-item label="Enabled" prop="enabled">
              <el-switch v-model="setDeptForm.enabled" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingSetDept" @click="handleSetDept">Save</el-button>
              <el-button @click="resetSetDept">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { starCheckPermissionApi } from '@/services/api'

const activeTab = ref('queryUser')

// Query user
const queryUserForm = reactive({ userId: '' })
const queryUserResult = ref(null)
const loadingQueryUser = ref(false)
const handleQueryUser = async () => {
  if (!queryUserForm.userId) {
    ElMessage.warning('Please input user UUID')
    return
  }
  try {
    loadingQueryUser.value = true
    const res = await starCheckPermissionApi.getUserStarCheckSetting(queryUserForm.userId)
    queryUserResult.value = res.data
    ElMessage.success('Fetched successfully')
  } catch (e) {
    queryUserResult.value = null
  } finally {
    loadingQueryUser.value = false
  }
}

// Set user
const setUserFormRef = ref()
const setUserForm = reactive({ userId: '', enabled: false })
const loadingSetUser = ref(false)
const setUserRules = {
  userId: [{ required: true, message: 'User UUID is required', trigger: 'blur' }]
}
const handleSetUser = async () => {
  try {
    await setUserFormRef.value.validate()
    loadingSetUser.value = true
    await starCheckPermissionApi.setUserStarCheckSetting(setUserForm.userId, setUserForm.enabled)
    ElMessage.success('Saved successfully')
  } catch (e) {
  } finally {
    loadingSetUser.value = false
  }
}
const resetSetUser = () => {
  setUserForm.userId = ''
  setUserForm.enabled = false
  setUserFormRef.value?.clearValidate()
}

// Query department
const queryDeptForm = reactive({ departmentName: '' })
const queryDeptResult = ref(null)
const loadingQueryDept = ref(false)
const handleQueryDept = async () => {
  if (!queryDeptForm.departmentName) {
    ElMessage.warning('Please input department name')
    return
  }
  try {
    loadingQueryDept.value = true
    const res = await starCheckPermissionApi.getDepartmentStarCheckSetting(queryDeptForm.departmentName)
    queryDeptResult.value = res.data
    ElMessage.success('Fetched successfully')
  } catch (e) {
    queryDeptResult.value = null
  } finally {
    loadingQueryDept.value = false
  }
}

// Set department
const setDeptFormRef = ref()
const setDeptForm = reactive({ departmentName: '', enabled: false })
const loadingSetDept = ref(false)
const setDeptRules = {
  departmentName: [{ required: true, message: 'Department name is required', trigger: 'blur' }]
}
const handleSetDept = async () => {
  try {
    await setDeptFormRef.value.validate()
    loadingSetDept.value = true
    await starCheckPermissionApi.setDepartmentStarCheckSetting(setDeptForm.departmentName, setDeptForm.enabled)
    ElMessage.success('Saved successfully')
  } catch (e) {
  } finally {
    loadingSetDept.value = false
  }
}
const resetSetDept = () => {
  setDeptForm.departmentName = ''
  setDeptForm.enabled = false
  setDeptFormRef.value?.clearValidate()
}
</script>

<style scoped>
.star-check-permissions { min-height: calc(100vh - 120px); }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 600; color: #303133; }
.page-subtitle { margin-top: 6px; color: #606266; }
.section-form { margin-top: 10px; max-width: 720px; }
.result { margin-top: 14px; }
.result-row { display: flex; align-items: center; margin-bottom: 8px; }
.result-label { width: 140px; color: #606266; }
.result-value { color: #303133; }
</style>


