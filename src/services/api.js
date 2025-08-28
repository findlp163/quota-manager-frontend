import axios from 'axios'
import { API_CONFIG, getApiUrl, getDynamicApiConfig } from '@config'
import { ElMessage } from 'element-plus'

// 获取动态配置
let dynamicConfig = getDynamicApiConfig()

// 创建axios实例
const api = axios.create({
  baseURL: dynamicConfig.BASE_URL,
  timeout: dynamicConfig.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 更新API配置的方法
export function updateApiConfig() {
  dynamicConfig = getDynamicApiConfig()

  // 更新axios实例的配置
  api.defaults.baseURL = dynamicConfig.BASE_URL
  api.defaults.timeout = dynamicConfig.TIMEOUT

  console.log('API configuration updated:', {
    baseURL: dynamicConfig.BASE_URL,
    timeout: dynamicConfig.TIMEOUT
  })
}

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 这里可以添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const data = response.data
    if (data.success) {
      return data
    } else {
      ElMessage.error(data.message || 'Request failed')
      return Promise.reject(new Error(data.message || 'Request failed'))
    }
  },
  error => {
    const message = error.response?.data?.message || error.message || 'Network error'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 策略相关API
export const strategyApi = {
  // 获取策略列表
  getStrategies(params = {}) {
    return api.get(getApiUrl('/strategies'), { params })
  },

  // 获取单个策略
  getStrategy(id) {
    return api.get(getApiUrl(`/strategies/${id}`))
  },

  // 创建策略
  createStrategy(data) {
    return api.post(getApiUrl('/strategies'), data)
  },

  // 更新策略
  updateStrategy(id, data) {
    return api.put(getApiUrl(`/strategies/${id}`), data)
  },

  // 删除策略
  deleteStrategy(id) {
    return api.delete(getApiUrl(`/strategies/${id}`))
  },

  // 启用策略
  enableStrategy(id) {
    return api.post(getApiUrl(`/strategies/${id}/enable`))
  },

  // 禁用策略
  disableStrategy(id) {
    return api.post(getApiUrl(`/strategies/${id}/disable`))
  },

  // 触发策略扫描
  triggerScan() {
    return api.post(getApiUrl('/strategies/scan'))
  },

  // 获取策略执行记录
  getStrategyExecutions(id, params = {}) {
    return api.get(getApiUrl(`/strategies/${id}/executions`), { params })
  }
}

// 配额相关API
export const quotaApi = {
  // 获取用户配额
  getUserQuota() {
    return api.get(getApiUrl('/quota'))
  },

  // 获取用户配额审计记录
  getQuotaAuditRecords(params = {}) {
    return api.get(getApiUrl('/quota/audit'), { params })
  },

  // 管理员查询指定用户配额审计记录
  getUserQuotaAuditRecords(userId, params = {}) {
    return api.get(getApiUrl(`/quota/audit/${userId}`), { params })
  },

  // 转出配额
  transferOut(data) {
    return api.post(getApiUrl('/quota/transfer-out'), data)
  },

  // 转入配额
  transferIn(data) {
    return api.post(getApiUrl('/quota/transfer-in'), data)
  }
}

// 系统相关API
export const systemApi = {
  // 移除了健康检查功能
}

// 模型白名单相关API
export const modelPermissionApi = {
  // 查询用户模型白名单
  getUserWhitelist(userId) {
    return api.get(getApiUrl('/effective-permissions'), {
      params: { type: 'model', target_type: 'user', target_identifier: userId }
    }).then(res => ({
      ...res,
      data: {
        user_id: userId,
        models: res.data?.models || []
      }
    }))
  },

  // 设置用户模型白名单
  setUserWhitelist(userId, models = []) {
    return api.post(getApiUrl('/model-permissions/user'), {
      user_id: userId,
      models
    })
  },

  // 查询部门模型白名单
  getDepartmentWhitelist(departmentName) {
    return api.get(getApiUrl('/effective-permissions'), {
      params: { type: 'model', target_type: 'department', target_identifier: departmentName }
    }).then(res => ({
      ...res,
      data: {
        department_name: departmentName,
        models: res.data?.models || []
      }
    }))
  },

  // 设置部门模型白名单
  setDepartmentWhitelist(departmentName, models = []) {
    return api.post(getApiUrl('/model-permissions/department'), {
      department_name: departmentName,
      models
    })
  }
}

// Star Check 权限相关API
export const starCheckPermissionApi = {
  // 查询用户开启状态
  getUserStarCheckSetting(userId) {
    return api.get(getApiUrl('/effective-permissions'), {
      params: { type: 'star-check', target_type: 'user', target_identifier: userId }
    }).then(res => ({
      ...res,
      data: {
        user_id: userId,
        enabled: !!res.data?.enabled
      }
    }))
  },

  // 设置用户开启状态
  setUserStarCheckSetting(userId, enabled) {
    return api.post(getApiUrl('/star-check-permissions/user'), {
      user_id: userId,
      enabled
    })
  },

  // 查询部门开启状态
  getDepartmentStarCheckSetting(departmentName) {
    return api.get(getApiUrl('/effective-permissions'), {
      params: { type: 'star-check', target_type: 'department', target_identifier: departmentName }
    }).then(res => ({
      ...res,
      data: {
        department_name: departmentName,
        enabled: !!res.data?.enabled
      }
    }))
  },

  // 设置部门开启状态
  setDepartmentStarCheckSetting(departmentName, enabled) {
    return api.post(getApiUrl('/star-check-permissions/department'), {
      department_name: departmentName,
      enabled
    })
  }
}

// Quota Check 权限相关API
export const quotaCheckPermissionApi = {
  // 查询用户开启状态
  getUserQuotaCheckSetting(userId) {
    return api.get(getApiUrl('/effective-permissions'), {
      params: { type: 'quota-check', target_type: 'user', target_identifier: userId }
    }).then(res => ({
      ...res,
      data: {
        user_id: userId,
        enabled: !!res.data?.enabled
      }
    }))
  },

  // 设置用户开启状态
  setUserQuotaCheckSetting(userId, enabled) {
    return api.post(getApiUrl('/quota-check-permissions/user'), {
      user_id: userId,
      enabled
    })
  },

  // 查询部门开启状态
  getDepartmentQuotaCheckSetting(departmentName) {
    return api.get(getApiUrl('/effective-permissions'), {
      params: { type: 'quota-check', target_type: 'department', target_identifier: departmentName }
    }).then(res => ({
      ...res,
      data: {
        department_name: departmentName,
        enabled: !!res.data?.enabled
      }
    }))
  },

  // 设置部门开启状态
  setDepartmentQuotaCheckSetting(departmentName, enabled) {
    return api.post(getApiUrl('/quota-check-permissions/department'), {
      department_name: departmentName,
      enabled
    })
  }
}

export default api