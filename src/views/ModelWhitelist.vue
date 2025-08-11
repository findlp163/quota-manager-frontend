<template>
  <div class="model-whitelist">
    <div class="page-header">
      <h1 class="page-title">Model Whitelist</h1>
      <p class="page-subtitle">Query and configure user model whitelists</p>
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Query User Whitelist" name="query">
          <el-form :inline="true" :model="queryForm" class="section-form">
            <el-form-item label="User ID (UUID)">
              <el-input v-model="queryForm.userId" placeholder="Enter user UUID" clearable style="width: 360px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingQuery" @click="handleQuery">Query</el-button>
            </el-form-item>
          </el-form>

          <div v-if="queryResult" class="result">
            <div class="result-row">
              <span class="result-label">User:</span>
              <span class="result-value">{{ queryResult.user_id }}</span>
            </div>
            <div class="result-row">
              <span class="result-label">Models:</span>
              <div class="tags">
                <el-tag v-for="m in queryResult.models" :key="m" type="info" class="tag">{{ m }}</el-tag>
                <span v-if="!queryResult.models || queryResult.models.length === 0" class="empty">No models</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Set User Whitelist" name="set">
          <el-form ref="setFormRef" :model="setForm" :rules="setRules" label-width="140px" class="section-form">
            <el-form-item label="User ID (UUID)" prop="userId">
              <el-input v-model="setForm.userId" placeholder="Enter user UUID" clearable />
            </el-form-item>
            <el-form-item label="Models" prop="models">
              <el-select v-model="setForm.models" multiple filterable allow-create default-first-option placeholder="Input and press Enter to add" style="width: 100%" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingSet" @click="handleSet">Save</el-button>
              <el-button @click="resetSetForm">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Query Department Whitelist" name="queryDept">
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
              <span class="result-label">Models:</span>
              <div class="tags">
                <el-tag v-for="m in queryDeptResult.models" :key="m" type="success" class="tag">{{ m }}</el-tag>
                <span v-if="!queryDeptResult.models || queryDeptResult.models.length === 0" class="empty">No models</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Set Department Whitelist" name="setDept">
          <el-form ref="setDeptFormRef" :model="setDeptForm" :rules="setDeptRules" label-width="160px" class="section-form">
            <el-form-item label="Department Name" prop="departmentName">
              <el-input v-model="setDeptForm.departmentName" placeholder="Enter department name" clearable />
            </el-form-item>
            <el-form-item label="Models" prop="models">
              <el-select v-model="setDeptForm.models" multiple filterable allow-create default-first-option placeholder="Input and press Enter to add" style="width: 100%" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loadingSetDept" @click="handleSetDept">Save</el-button>
              <el-button @click="resetSetDeptForm">Reset</el-button>
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
import { modelPermissionApi } from '@/services/api'

const activeTab = ref('query')

// Query tab
const queryForm = reactive({ userId: '' })
const queryResult = ref(null)
const loadingQuery = ref(false)

const handleQuery = async () => {
  if (!queryForm.userId) {
    ElMessage.warning('Please input user UUID')
    return
  }
  try {
    loadingQuery.value = true
    const res = await modelPermissionApi.getUserWhitelist(queryForm.userId)
    queryResult.value = res.data
    ElMessage.success('Fetched successfully')
  } catch (e) {
    queryResult.value = null
  } finally {
    loadingQuery.value = false
  }
}

// Set tab
const setFormRef = ref()
const setForm = reactive({ userId: '', models: [] })
const loadingSet = ref(false)

const setRules = {
  userId: [{ required: true, message: 'User UUID is required', trigger: 'blur' }],
  models: [{ required: true, message: 'Please input at least one model', trigger: 'change' }]
}

const handleSet = async () => {
  try {
    await setFormRef.value.validate()
    loadingSet.value = true
    await modelPermissionApi.setUserWhitelist(setForm.userId, setForm.models)
    ElMessage.success('Saved successfully')
  } catch (e) {
    // validation or request error already messaged by interceptor
  } finally {
    loadingSet.value = false
  }
}

const resetSetForm = () => {
  setForm.userId = ''
  setForm.models = []
  setFormRef.value?.clearValidate()
}

// Query Department tab
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
    const res = await modelPermissionApi.getDepartmentWhitelist(queryDeptForm.departmentName)
    queryDeptResult.value = res.data
    ElMessage.success('Fetched successfully')
  } catch (e) {
    queryDeptResult.value = null
  } finally {
    loadingQueryDept.value = false
  }
}

// Set Department tab
const setDeptFormRef = ref()
const setDeptForm = reactive({ departmentName: '', models: [] })
const loadingSetDept = ref(false)

const setDeptRules = {
  departmentName: [{ required: true, message: 'Department name is required', trigger: 'blur' }],
  models: [{ required: true, message: 'Please input at least one model', trigger: 'change' }]
}

const handleSetDept = async () => {
  try {
    await setDeptFormRef.value.validate()
    loadingSetDept.value = true
    await modelPermissionApi.setDepartmentWhitelist(setDeptForm.departmentName, setDeptForm.models)
    ElMessage.success('Saved successfully')
  } catch (e) {
    // errors handled by interceptor
  } finally {
    loadingSetDept.value = false
  }
}

const resetSetDeptForm = () => {
  setDeptForm.departmentName = ''
  setDeptForm.models = []
  setDeptFormRef.value?.clearValidate()
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
.empty {
  color: #909399;
}
</style>


