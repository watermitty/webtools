<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import functionsRequest from '@/utils/functionsRequest'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, Edit, Delete, View, Briefcase, Picture, Document } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Resume {
  id: string
  name: string
  personalInfo: any
  workExperience: any[]
  education: any[]
  skills: any[]
  projects: any[]
  certificates: any[]
  others: any
  createTime: string
  updateTime: string
}

interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const info = reactive({
  title: 'tools.resume.title',
})

const resumes = ref<Resume[]>([])
const currentResume = ref<Resume | null>(null)
const isEditing = ref(false)
const showForm = ref(false)
const showPreview = ref(false)
const editingResumeId = ref<string | null>(null)

// 分页相关数据
const pagination = ref<Pagination>({
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
  hasNext: false,
  hasPrev: false
})

// 学历选项
const degreeOptions = computed(() => [
  { value: '博士', label: t('tools.resume.degree_options.phd') },
  { value: '硕士', label: t('tools.resume.degree_options.master') },
  { value: '本科', label: t('tools.resume.degree_options.bachelor') },
  { value: '专科', label: t('tools.resume.degree_options.college') },
  { value: '高中', label: t('tools.resume.degree_options.highschool') },
  { value: '中专', label: t('tools.resume.degree_options.vocational') },
  { value: '初中', label: t('tools.resume.degree_options.junior') },
  { value: '其他', label: t('tools.resume.degree_options.other') }
])

// 1. 优化：抽取默认表单数据函数
const getDefaultFormData = () => ({
  name: '',
  personalInfo: {
    name: '',
    phone: '',
    email: '',
    address: '',
    summary: ''
  },
  workExperience: [
    {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ],
  education: [
    {
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: ''
    }
  ],
  skills: [''],
  projects: [
    {
      name: '',
      description: '',
      technologies: '',
      startDate: '',
      endDate: ''
    }
  ],
  certificates: [
    {
      name: '',
      issuer: '',
      date: ''
    }
  ],
  others: {
    hobbies: '',
    languages: ''
  }
})

const formData = reactive(getDefaultFormData())

// loading状态
const loading = ref(false)
// 2. 优化：独立化操作loading状态
const operationLoadings = ref<Record<string, boolean>>({})

// 3. 优化：表单校验规则 - 修复类型错误
const formRules = computed<FormRules>(() => ({
  name: [
    { required: true, message: t('tools.resume.msg_name_required'), trigger: 'blur' },
    { min: 1, max: 100, message: t('tools.resume.msg_name_length'), trigger: 'blur' }
  ],
  'personalInfo.name': [
    { max: 50, message: t('tools.resume.msg_person_name_max'), trigger: 'blur' }
  ],
  'personalInfo.phone': [
    { pattern: /^1[3-9]\d{9}$/, message: t('tools.resume.msg_phone_valid'), trigger: 'blur' }
  ],
  'personalInfo.email': [
    { type: 'email' as const, message: t('tools.resume.msg_email_valid'), trigger: 'blur' }
  ]
}))

// 4. 优化：统一JSON字段解析函数
const parseJsonField = (field: any, defaultValue: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field || JSON.stringify(defaultValue))
    } catch (error) {
      console.error('JSON解析失败:', error)
      return defaultValue
    }
  }
  return field || defaultValue
}

// 5. 优化：简化parseResumeData函数
const parseResumeData = (resume: any) => {
  try {
    return {
      ...resume,
      personalInfo: parseJsonField(resume.personalInfo, {}),
      workExperience: parseJsonField(resume.workExperience, []),
      education: parseJsonField(resume.education, []),
      skills: parseJsonField(resume.skills, []),
      projects: parseJsonField(resume.projects, []),
      certificates: parseJsonField(resume.certificates, []),
      others: parseJsonField(resume.others, {})
    }
  } catch (error) {
    console.error('解析简历数据失败:', error)
    return resume
  }
}

// 6. 优化：分页逻辑，处理删除最后一页最后一条数据的情况
const fetchResumes = async (page = 1, pageSize = 12) => {
  try {
    loading.value = true
    const response = await functionsRequest.get('/api/resumes', {
      params: { page, pageSize }
    })
    if (response.status === 200) {
      const data = response.data
      resumes.value = (data.data || []).map(parseResumeData)
      if (data.pagination) {
        pagination.value = data.pagination
        
        // 如果当前页没有数据且不是第一页，回退到上一页
        if (data.data.length === 0 && page > 1) {
          await fetchResumes(page - 1, pageSize)
          return
        }
      }
    }
  } catch (error) {
    console.error('获取简历列表失败:', error)
    ElMessage.error(t('tools.resume.msg_fetch_fail') || '获取简历列表失败')
  } finally {
    loading.value = false
  }
}

// 分页变化处理
const handlePageChange = (page: number) => {
  fetchResumes(page, pagination.value.pageSize)
}

// 每页条数变化处理
const handleSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  fetchResumes(1, pageSize)
}

// 7. 优化：表单验证
const formRef = ref()
const validateForm = async () => {
  if (!formRef.value) return true
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 创建简历
const createResume = async () => {
  if (!await validateForm()) return

  try {
    operationLoadings.value['create'] = true
    const response = await functionsRequest.post('/api/resumes', formData)

    if (response.status === 201) {
      ElMessage.success(t('tools.resume.msg_create_success'))
      showForm.value = false
      resetForm()
      await fetchResumes(pagination.value.page, pagination.value.pageSize)
    } else {
      ElMessage.error(t('tools.resume.msg_create_fail'))
    }
  } catch (error) {
    console.error('创建简历失败:', error)
    ElMessage.error(t('tools.resume.msg_create_fail'))
  } finally {
    operationLoadings.value['create'] = false
  }
}

// 更新简历
const updateResume = async () => {
  if (!editingResumeId.value || !await validateForm()) return

  try {
    operationLoadings.value[editingResumeId.value] = true
    const response = await functionsRequest.put(`/api/resumes/${editingResumeId.value}`, formData)

    if (response.status === 200) {
      ElMessage.success(t('tools.resume.msg_update_success'))
      showForm.value = false
      isEditing.value = false
      editingResumeId.value = null
      resetForm()
      await fetchResumes(pagination.value.page, pagination.value.pageSize)
    } else {
      ElMessage.error(t('tools.resume.msg_update_fail'))
    }
  } catch (error) {
    console.error('更新简历失败:', error)
    ElMessage.error(t('tools.resume.msg_update_fail'))
  } finally {
    if (editingResumeId.value) {
      operationLoadings.value[editingResumeId.value] = false
    }
  }
}

// 8. 优化：独立loading状态的删除函数
const deleteResume = async (resume: Resume) => {
  try {
    await ElMessageBox.confirm(
      t('tools.resume.confirm_delete', { name: resume.name }),
      t('tools.resume.delete_confirm'),
      {
        confirmButtonText: t('tools.resume.delete'),
        cancelButtonText: t('tools.resume.cancel'),
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    operationLoadings.value[resume.id] = true
    const response = await functionsRequest.delete(`/api/resumes/${resume.id}`)

    if (response.status === 200) {
      ElMessage.success(t('tools.resume.msg_delete_success'))
      await fetchResumes(pagination.value.page, pagination.value.pageSize)
    } else {
      ElMessage.error(t('tools.resume.msg_delete_fail'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除简历失败:', error)
      ElMessage.error(t('tools.resume.msg_delete_fail'))
    }
  } finally {
    operationLoadings.value[resume.id] = false
  }
}

// 查看简历
const viewResume = (resume: Resume) => {
  currentResume.value = parseResumeData(resume)
  showPreview.value = true
}

// 9. 优化：简化editResume函数，复用parseResumeData
const editResume = (resume: Resume) => {
  editingResumeId.value = resume.id
  isEditing.value = true
  
  // 使用parseResumeData统一解析
  const parsedResume = parseResumeData(resume)
  
  // 填充表单数据
  formData.name = parsedResume.name
  formData.personalInfo = { ...parsedResume.personalInfo }
  formData.workExperience = parsedResume.workExperience.length > 0 
    ? [...parsedResume.workExperience] 
    : [getDefaultFormData().workExperience[0]]
  formData.education = parsedResume.education.length > 0 
    ? [...parsedResume.education] 
    : [getDefaultFormData().education[0]]
  formData.skills = parsedResume.skills.length > 0 
    ? [...parsedResume.skills] 
    : ['']
  formData.projects = parsedResume.projects.length > 0 
    ? [...parsedResume.projects] 
    : [getDefaultFormData().projects[0]]
  formData.certificates = parsedResume.certificates.length > 0 
    ? [...parsedResume.certificates] 
    : [getDefaultFormData().certificates[0]]
  formData.others = { ...parsedResume.others }
  
  showForm.value = true
}

// 新建简历
const newResume = () => {
  isEditing.value = false
  editingResumeId.value = null
  resetForm()
  showForm.value = true
}

// 10. 优化：简化重置表单函数
const resetForm = () => {
  const defaultData = getDefaultFormData()
  Object.assign(formData, defaultData)
  // 清除表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 11. 优化：抽取通用的数组操作函数
const addArrayItem = (array: any[], defaultItem: any) => {
  array.push({ ...defaultItem })
}

const removeArrayItem = (array: any[], index: number, minLength = 1) => {
  if (array.length > minLength) {
    array.splice(index, 1)
  }
}

// 简化的添加/删除函数
const addWorkExperience = () => addArrayItem(formData.workExperience, getDefaultFormData().workExperience[0])
const removeWorkExperience = (index: number) => removeArrayItem(formData.workExperience, index)

const addEducation = () => addArrayItem(formData.education, getDefaultFormData().education[0])
const removeEducation = (index: number) => removeArrayItem(formData.education, index)

const addSkill = () => formData.skills.push('')
const removeSkill = (index: number) => removeArrayItem(formData.skills, index)

const addProject = () => addArrayItem(formData.projects, getDefaultFormData().projects[0])
const removeProject = (index: number) => removeArrayItem(formData.projects, index)

const addCertificate = () => addArrayItem(formData.certificates, getDefaultFormData().certificates[0])
const removeCertificate = (index: number) => removeArrayItem(formData.certificates, index)

// 12. 优化：日期格式化函数
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  try {
    return new Date(timeStr).toLocaleString('zh-CN')
  } catch (error) {
    return timeStr
  }
}

const formatWorkDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`
  } catch (error) {
    return dateStr
  }
}

// 13. 优化：检查loading状态的辅助函数 - 修复返回值类型
const isOperationLoading = (id: string): boolean => {
  return operationLoadings.value[id] || false
}

const isAnyOperationLoading = (): boolean => {
  return Object.values(operationLoadings.value).some(loading => loading)
}

// 导出相关状态
const exportLoading = ref(false)

// 导出为图片
const exportAsImage = async () => {
  if (!currentResume.value) {
    ElMessage.warning(t('tools.resume.msg_no_content_export'))
    return
  }

  exportLoading.value = true
  try {
    const element = document.querySelector('.resume-preview') as HTMLElement
    if (!element) {
      ElMessage.error(t('tools.resume.msg_preview_not_found'))
      return
    }

    // 创建高质量的canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 提高分辨率
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    // 生成文件名：简历名称_姓名
    const resumeName = currentResume.value.name || t('tools.resume.my_resumes')
    const personName = currentResume.value.personalInfo?.name || 'Unknown'
    const fileName = `${resumeName}_${personName}.png`

    // 创建下载链接
    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(t('tools.resume.export_image_success'))
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error(t('tools.resume.export_image_fail'))
  } finally {
    exportLoading.value = false
  }
}

// 导出为PDF
const exportAsPDF = async () => {
  if (!currentResume.value) {
    ElMessage.warning(t('tools.resume.msg_no_content_export'))
    return
  }

  exportLoading.value = true
  try {
    const element = document.querySelector('.resume-preview') as HTMLElement
    if (!element) {
      ElMessage.error(t('tools.resume.msg_preview_not_found'))
      return
    }

    // 创建高质量的canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    
    // 计算PDF尺寸（A4纸张）
    const pdfWidth = 210 // A4宽度(mm)
    const pdfHeight = 297 // A4高度(mm)
    
    // 计算图片在PDF中的尺寸
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width
    
    // 创建PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // 如果内容高度超过一页，需要分页
    if (imgHeight <= pdfHeight) {
      // 单页
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    } else {
      // 多页处理
      let position = 0
      const pageHeight = (canvas.width * pdfHeight) / pdfWidth
      
      while (position < canvas.height) {
        // 创建当前页的canvas
        const pageCanvas = document.createElement('canvas')
        const pageCtx = pageCanvas.getContext('2d')!
        
        pageCanvas.width = canvas.width
        pageCanvas.height = Math.min(pageHeight, canvas.height - position)
        
        // 绘制当前页内容
        pageCtx.drawImage(
          canvas,
          0, position, canvas.width, pageCanvas.height,
          0, 0, canvas.width, pageCanvas.height
        )
        
        const pageImgData = pageCanvas.toDataURL('image/png')
        const currentPageHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width
        
        if (position > 0) {
          pdf.addPage()
        }
        
        pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, currentPageHeight)
        position += pageHeight
      }
    }
    
    // 生成文件名：简历名称_姓名
    const resumeName = currentResume.value.name || t('tools.resume.my_resumes')
    const personName = currentResume.value.personalInfo?.name || 'Unknown'
    const fileName = `${resumeName}_${personName}.pdf`
    
    // 保存PDF
    pdf.save(fileName)
    
    ElMessage.success(t('tools.resume.export_pdf_success'))
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error(t('tools.resume.export_pdf_fail'))
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchResumes()
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="t(info.title)"></DetailHeader>

    <div class="resume-container">
      <!-- 操作栏 -->
      <div class="header-section">
        <div class="header-left">
          <div class="icon-wrapper">
            <el-icon class="header-icon"><Briefcase /></el-icon>
          </div>
          <div>
            <h3 class="header-title">{{ t('tools.resume.my_resumes') }}</h3>
            <p class="header-subtitle">{{ t('tools.resume.total_resumes', { count: pagination.total }) }}</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button 
            class="action-btn refresh-btn"
            @click="fetchResumes(pagination.page, pagination.pageSize)" 
            :icon="Refresh"
            :loading="loading"
            :disabled="loading"
            circle
          />
          <el-button 
            class="action-btn create-btn"
            type="primary" 
            @click="newResume" 
            :icon="Plus"
          >
            {{ t('tools.resume.new_resume') }}
          </el-button>
        </div>
      </div>

      <!-- 简历列表 -->
      <div v-loading="loading" class="resume-grid">
        <div v-if="resumes.length === 0 && !loading" class="empty-state">
          <el-icon class="empty-icon"><Briefcase /></el-icon>
          <h3 class="empty-title">{{ t('tools.resume.no_resumes') }}</h3>
          <p class="empty-desc">{{ t('tools.resume.start_creating') }}</p>
          <el-button type="primary" @click="newResume" :icon="Plus">{{ t('tools.resume.create_resume') }}</el-button>
        </div>
        
        <div
          v-for="resume in resumes"
          :key="resume.id"
          class="resume-card"
          :class="{ 'resume-active': currentResume?.id === resume.id }"
          @click="viewResume(resume)"
        >
          <div class="resume-header">
            <h4 class="resume-title">{{ resume.name }}</h4>
            <div class="resume-actions">
              <el-button 
                class="action-icon"
                size="small"
                :icon="View"
                @click.stop="viewResume(resume)"
                circle
                plain
              />
              <el-button 
                class="action-icon edit-icon"
                size="small"
                type="primary"
                :icon="Edit"
                :loading="isOperationLoading(resume.id)"
                :disabled="isAnyOperationLoading()"
                @click.stop="editResume(resume)"
                circle
                plain
              />
              <el-button 
                class="action-icon delete-icon"
                size="small"
                type="danger"
                :icon="Delete"
                :loading="isOperationLoading(resume.id)"
                :disabled="isAnyOperationLoading()"
                @click.stop="deleteResume(resume)"
                circle
                plain
              />
            </div>
          </div>
          
          <div class="resume-content">
            <div class="personal-info">
              <el-icon><Briefcase /></el-icon>
              <span>{{ resume.personalInfo?.name || '-' }}</span>
            </div>
          </div>
          
          <div class="resume-footer">
            <span class="time-text">{{ t('tools.resume.updated_at') }} {{ formatTime(resume.updateTime) }}</span>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[6, 12, 24, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          class="custom-pagination"
        />
      </div>

      <!-- 简历表单 -->
      <el-dialog
        v-model="showForm"
        :title="isEditing ? t('tools.resume.edit_resume') : t('tools.resume.new_resume')"
        width="90%"
        max-width="900px"
        class="resume-dialog"
        @close="isEditing = false"
        destroy-on-close
      >
        <div class="form-container">
          <el-form 
            ref="formRef"
            :model="formData" 
            :rules="formRules"
            label-position="top"
          >
            <!-- 基本信息 -->
            <div class="form-section">
              <h4 class="section-title">{{ t('tools.resume.basic_info') }}</h4>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item :label="t('tools.resume.resume_name')" prop="name">
                    <el-input 
                      v-model="formData.name" 
                      :placeholder="t('tools.resume.enter_resume_name')" 
                      size="large"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 个人信息 -->
            <div class="form-section">
              <h4 class="section-title">{{ t('tools.resume.personal_info') }}</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="t('tools.resume.name')" prop="personalInfo.name">
                    <el-input v-model="formData.personalInfo.name" :placeholder="t('tools.resume.enter_name')" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('tools.resume.phone')" prop="personalInfo.phone">
                    <el-input v-model="formData.personalInfo.phone" :placeholder="t('tools.resume.enter_phone')" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('tools.resume.email')" prop="personalInfo.email">
                    <el-input v-model="formData.personalInfo.email" :placeholder="t('tools.resume.enter_email')" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('tools.resume.address')">
                    <el-input v-model="formData.personalInfo.address" :placeholder="t('tools.resume.enter_address')" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="t('tools.resume.summary')">
                    <el-input
                      v-model="formData.personalInfo.summary"
                      type="textarea"
                      :rows="3"
                      :placeholder="t('tools.resume.enter_summary')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 工作经历 -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">{{ t('tools.resume.work_experience') }}</h4>
                <el-button type="primary" size="small" @click="addWorkExperience" :icon="Plus">{{ t('tools.resume.add') }}</el-button>
              </div>
              <div v-for="(work, index) in formData.workExperience" :key="index" class="experience-item">
                <div class="item-header">
                  <span class="item-number">{{ index + 1 }}</span>
                  <el-button
                    v-if="formData.workExperience.length > 1"
                    type="danger"
                    size="small"
                    @click="removeWorkExperience(index)"
                    :icon="Delete"
                    circle
                    plain
                  />
                </div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.company')">
                      <el-input v-model="work.company" :placeholder="t('tools.resume.enter_company')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.position')">
                      <el-input v-model="work.position" :placeholder="t('tools.resume.enter_position')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.start_date')">
                      <el-date-picker
                        v-model="work.startDate"
                        type="month"
                        :placeholder="t('tools.resume.select_start_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.end_date')">
                      <el-date-picker
                        v-model="work.endDate"
                        type="month"
                        :placeholder="t('tools.resume.select_end_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item :label="t('tools.resume.description')">
                      <el-input
                        v-model="work.description"
                        type="textarea"
                        :rows="3"
                        :placeholder="t('tools.resume.enter_description')"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 教育经历 -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">{{ t('tools.resume.education') }}</h4>
                <el-button type="primary" size="small" @click="addEducation" :icon="Plus">{{ t('tools.resume.add') }}</el-button>
              </div>
              <div v-for="(edu, index) in formData.education" :key="index" class="experience-item">
                <div class="item-header">
                  <span class="item-number">{{ index + 1 }}</span>
                  <el-button
                    v-if="formData.education.length > 1"
                    type="danger"
                    size="small"
                    @click="removeEducation(index)"
                    :icon="Delete"
                    circle
                    plain
                  />
                </div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.school')">
                      <el-input v-model="edu.school" :placeholder="t('tools.resume.enter_school')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.major')">
                      <el-input v-model="edu.major" :placeholder="t('tools.resume.enter_major')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.degree')">
                      <el-select 
                        v-model="edu.degree" 
                        :placeholder="t('tools.resume.select_degree')" 
                        style="width: 100%"
                        clearable
                      >
                        <el-option
                          v-for="degree in degreeOptions"
                          :key="degree.value"
                          :label="degree.label"
                          :value="degree.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="t('tools.resume.start_date')">
                      <el-date-picker
                        v-model="edu.startDate"
                        type="year"
                        :placeholder="t('tools.resume.select_start_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="t('tools.resume.end_date')">
                      <el-date-picker
                        v-model="edu.endDate"
                        type="year"
                        :placeholder="t('tools.resume.select_end_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 技能 -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">{{ t('tools.resume.skills') }}</h4>
                <el-button type="primary" size="small" @click="addSkill" :icon="Plus">{{ t('tools.resume.add') }}</el-button>
              </div>
              <div v-for="(_, index) in formData.skills" :key="index" class="skill-item">
                <el-input
                  v-model="formData.skills[index]"
                  :placeholder="t('tools.resume.enter_skill')"
                  style="margin-bottom: 10px;"
                >
                  <template #append>
                    <el-button
                      v-if="formData.skills.length > 1"
                      type="danger"
                      @click="removeSkill(index)"
                      :icon="Delete"
                    />
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 项目经历 -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">{{ t('tools.resume.projects') }}</h4>
                <el-button type="primary" size="small" @click="addProject" :icon="Plus">{{ t('tools.resume.add') }}</el-button>
              </div>
              <div v-for="(project, index) in formData.projects" :key="index" class="experience-item">
                <div class="item-header">
                  <span class="item-number">{{ index + 1 }}</span>
                  <el-button
                    v-if="formData.projects.length > 1"
                    type="danger"
                    size="small"
                    @click="removeProject(index)"
                    :icon="Delete"
                    circle
                    plain
                  />
                </div>
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item :label="t('tools.resume.project_name')">
                      <el-input v-model="project.name" :placeholder="t('tools.resume.enter_project_name')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item :label="t('tools.resume.technologies')">
                      <el-input v-model="project.technologies" :placeholder="t('tools.resume.enter_technologies')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.start_date')">
                      <el-date-picker
                        v-model="project.startDate"
                        type="month"
                        :placeholder="t('tools.resume.select_start_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.end_date')">
                      <el-date-picker
                        v-model="project.endDate"
                        type="month"
                        :placeholder="t('tools.resume.select_end_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item :label="t('tools.resume.description')">
                      <el-input
                        v-model="project.description"
                        type="textarea"
                        :rows="3"
                        :placeholder="t('tools.resume.enter_description')"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 证书 -->
            <div class="form-section">
              <div class="section-header">
                <h4 class="section-title">{{ t('tools.resume.certificates') }}</h4>
                <el-button type="primary" size="small" @click="addCertificate" :icon="Plus">{{ t('tools.resume.add') }}</el-button>
              </div>
              <div v-for="(cert, index) in formData.certificates" :key="index" class="experience-item">
                <div class="item-header">
                  <span class="item-number">{{ index + 1 }}</span>
                  <el-button
                    v-if="formData.certificates.length > 1"
                    type="danger"
                    size="small"
                    @click="removeCertificate(index)"
                    :icon="Delete"
                    circle
                    plain
                  />
                </div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.certificate_name')">
                      <el-input v-model="cert.name" :placeholder="t('tools.resume.enter_certificate_name')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.issuer')">
                      <el-input v-model="cert.issuer" :placeholder="t('tools.resume.enter_issuer')" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item :label="t('tools.resume.date')">
                      <el-date-picker
                        v-model="cert.date"
                        type="month"
                        :placeholder="t('tools.resume.select_date')"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </div>

            <!-- 其他信息 -->
            <div class="form-section">
              <h4 class="section-title">{{ t('tools.resume.others') }}</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="t('tools.resume.hobbies')">
                    <el-input
                      v-model="formData.others.hobbies"
                      type="textarea"
                      :rows="3"
                      :placeholder="t('tools.resume.enter_hobbies')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="t('tools.resume.languages')">
                    <el-input
                      v-model="formData.others.languages"
                      type="textarea"
                      :rows="3"
                      :placeholder="t('tools.resume.enter_languages')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button 
              size="large"
              :disabled="!!(isOperationLoading('create') || (editingResumeId && isOperationLoading(editingResumeId)))" 
              @click="showForm = false; isEditing = false"
            >
              {{ t('tools.resume.cancel') }}
            </el-button>
            <el-button 
              type="primary" 
              size="large"
              :loading="!!(isOperationLoading('create') || (editingResumeId && isOperationLoading(editingResumeId)))"
              :disabled="!!(isOperationLoading('create') || (editingResumeId && isOperationLoading(editingResumeId)))"
              @click="isEditing ? updateResume() : createResume()"
            >
              {{ isEditing ? t('tools.resume.save_changes') : t('tools.resume.create_resume') }}
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 简历预览 -->
      <el-dialog
        v-model="showPreview"
        :title="t('tools.resume.preview_title')"
        width="850px"
        class="preview-dialog"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <template #header>
          <div class="preview-header-section">
            <div class="dialog-title-area">
              <span class="dialog-title">{{ t('tools.resume.preview_title') }}</span>
              <span class="a4-indicator">📄 A4 (794×1123px)</span>
            </div>
            <div class="export-buttons">
              <el-button
                type="primary"
                :icon="Picture"
                size="small"
                :loading="exportLoading"
                @click="exportAsImage"
              >
                {{ t('tools.resume.export_image') }}
              </el-button>
              <el-button
                type="success"
                :icon="Document"
                size="small"
                :loading="exportLoading"
                @click="exportAsPDF"
              >
                {{ t('tools.resume.export_pdf') }}
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="preview-container">
          <div v-if="currentResume" class="resume-preview" id="resume-preview">
            <div class="preview-header">
              <h2>{{ currentResume.personalInfo?.name || t('tools.resume.name') }}</h2>
              <div class="contact-info">
                <span v-if="currentResume.personalInfo?.phone">📞 {{ currentResume.personalInfo.phone }}</span>
                <span v-if="currentResume.personalInfo?.email">📧 {{ currentResume.personalInfo.email }}</span>
                <span v-if="currentResume.personalInfo?.address">📍 {{ currentResume.personalInfo.address }}</span>
              </div>
            </div>
            
            <!-- 个人简介 -->
            <div v-if="currentResume.personalInfo?.summary" class="preview-section">
              <h4>{{ t('tools.resume.summary') }}</h4>
              <p>{{ currentResume.personalInfo.summary }}</p>
            </div>

            <!-- 工作经历 -->
            <div v-if="currentResume.workExperience && currentResume.workExperience.length > 0" class="preview-section">
              <h4>{{ t('tools.resume.work_experience') }}</h4>
              <div v-for="(work, index) in currentResume.workExperience" :key="index" class="experience-item">
                <div v-if="work.company || work.position" class="work-item">
                  <div class="work-header">
                    <h5>{{ work.position || t('tools.resume.position') }} - {{ work.company || t('tools.resume.company') }}</h5>
                    <span class="work-period">
                      {{ formatWorkDate(work.startDate) }} - {{ formatWorkDate(work.endDate) || 'Present' }}
                    </span>
                  </div>
                  <p v-if="work.description" class="work-description">{{ work.description }}</p>
                </div>
              </div>
            </div>

            <!-- 教育经历 -->
            <div v-if="currentResume.education && currentResume.education.length > 0" class="preview-section">
              <h4>{{ t('tools.resume.education') }}</h4>
              <div v-for="(edu, index) in currentResume.education" :key="index" class="experience-item">
                <div v-if="edu.school || edu.major" class="edu-item">
                  <div class="edu-header">
                    <h5>{{ edu.school || t('tools.resume.school') }} - {{ edu.major || t('tools.resume.major') }}</h5>
                    <span class="edu-period">{{ formatWorkDate(edu.startDate) }} - {{ formatWorkDate(edu.endDate) || 'Present' }}</span>
                  </div>
                  <p v-if="edu.degree" class="edu-degree">{{ edu.degree }}</p>
                </div>
              </div>
            </div>

            <!-- 专业技能 -->
            <div v-if="currentResume.skills && currentResume.skills.length > 0" class="preview-section">
              <h4>{{ t('tools.resume.skills') }}</h4>
              <div class="skills-text">
                {{ currentResume.skills.filter(s => s && s.trim()).join('、') }}
              </div>
            </div>

            <!-- 项目经历 -->
            <div v-if="currentResume.projects && currentResume.projects.length > 0" class="preview-section">
              <h4>{{ t('tools.resume.projects') }}</h4>
              <div v-for="(project, index) in currentResume.projects" :key="index" class="experience-item">
                <div v-if="project.name || project.description" class="project-item">
                  <div class="project-header">
                    <h5>{{ project.name || t('tools.resume.project_name') }}</h5>
                    <span class="project-period">
                      {{ formatWorkDate(project.startDate) }} - {{ formatWorkDate(project.endDate) || 'Present' }}
                    </span>
                  </div>
                  <p v-if="project.technologies" class="project-tech">{{ t('tools.resume.technologies') }}：{{ project.technologies }}</p>
                  <p v-if="project.description" class="project-description">{{ project.description }}</p>
                </div>
              </div>
            </div>

            <!-- 证书 -->
            <div v-if="currentResume.certificates && currentResume.certificates.length > 0" class="preview-section">
              <h4>{{ t('tools.resume.certificates') }}</h4>
              <div class="certificates-list">
                <div v-for="(cert, index) in currentResume.certificates" :key="index" class="cert-item">
                  <div v-if="cert.name || cert.issuer">
                    <strong>{{ cert.name || t('tools.resume.certificate_name') }}</strong>
                    <span v-if="cert.issuer"> - {{ cert.issuer }}</span>
                    <span v-if="cert.date" class="cert-date">（{{ formatWorkDate(cert.date) }}）</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他信息 -->
            <div v-if="currentResume.others && (currentResume.others.hobbies || currentResume.others.languages)" class="preview-section">
              <h4>{{ t('tools.resume.others') }}</h4>
              <div v-if="currentResume.others.hobbies" class="other-item">
                <strong>{{ t('tools.resume.hobbies') }}：</strong>{{ currentResume.others.hobbies }}
              </div>
              <div v-if="currentResume.others.languages" class="other-item">
                <strong>{{ t('tools.resume.languages') }}：</strong>{{ currentResume.others.languages }}
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 描述 -->
    <ToolDetail :title="t('tools.resume.detail_title')">
      <div class="feature-list">
        <div class="feature-item">
          <h5>📝 {{ t('tools.resume.features.input_title') }}</h5>
          <p>{{ t('tools.resume.features.input_desc') }}</p>
        </div>
        <div class="feature-item">
          <h5>📄 {{ t('tools.resume.features.export_title') }}</h5>
          <p>{{ t('tools.resume.features.export_desc') }}</p>
        </div>
        <div class="feature-item">
          <h5>🔒 {{ t('tools.resume.features.security_title') }}</h5>
          <p>{{ t('tools.resume.features.security_desc') }}</p>
        </div>
        <div class="feature-item">
          <h5>👀 {{ t('tools.resume.features.preview_title') }}</h5>
          <p>{{ t('tools.resume.features.preview_desc') }}</p>
        </div>
        <div class="feature-item">
          <h5>📱 {{ t('tools.resume.features.responsive_title') }}</h5>
          <p>{{ t('tools.resume.features.responsive_desc') }}</p>
        </div>
      </div>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 保持原有样式不变 */
.resume-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon {
  font-size: 24px;
  color: white;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  border-radius: 8px;
  height: 40px;
  transition: all 0.3s ease;
}

.refresh-btn {
  border: 1px solid #e0e0e0;
  color: #666;
}

.refresh-btn:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 0 20px;
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-title {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #666;
}

.empty-desc {
  font-size: 14px;
  margin: 0 0 24px 0;
  color: #999;
}

.resume-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.resume-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.resume-card:hover {
  border-color: #4f46e5;
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
  transform: translateY(-2px);
}

.resume-card:hover::before {
  transform: scaleX(1);
}

.resume-active {
  border-color: #4f46e5;
  background: #fafbff;
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
}

.resume-active::before {
  transform: scaleX(1);
}

.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.resume-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  padding-right: 12px;
}

.resume-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resume-card:hover .resume-actions {
  opacity: 1;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
}

.resume-content {
  margin-bottom: 16px;
}

.personal-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.resume-footer {
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.time-text {
  font-size: 12px;
  color: #9ca3af;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.custom-pagination {
  --el-pagination-font-size: 14px;
}

.form-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.experience-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-number {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.skill-item {
  margin-bottom: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* 移除重复的 .resume-preview 样式 */
/* .resume-preview {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: white;
  padding: 40px;
  line-height: 1.6;
} */

.preview-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #667eea;
}

.preview-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 14px;
  color: #666;
  
  /* 在非触摸设备(PC)上强制不换行 */
  flex-wrap: nowrap;
  overflow: visible;
}

/* 在移动设备上强制垂直排列联系方式 */
@media (max-width: 768px) {
  @media (hover: none) and (pointer: coarse) {
    .contact-info {
      flex-direction: column;
      gap: 8px;
      flex-wrap: nowrap;
    }
  }
}

.preview-section {
  margin-bottom: 25px;
}

.preview-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #e9ecef;
}

.work-item, .edu-item, .project-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.work-item:last-child, .edu-item:last-child, .project-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.work-header, .edu-header, .project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.work-header h5, .edu-header h5, .project-header h5 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  flex: 1;
}

.work-period, .edu-period, .project-period, .cert-date {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  margin-left: 12px;
}

.work-description, .project-description {
  color: #555;
  line-height: 1.6;
  margin: 8px 0 0 0;
}

.edu-degree {
  color: #666;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.project-tech {
  color: #667eea;
  font-size: 14px;
  margin: 4px 0;
  font-weight: 500;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  line-height: 1.8;
}

/********** 代码修改区域 **********/
.skill-tag {
  /* 移除所有特殊样式，改为纯文字 */
  background: none;
  color: #333;
  padding: 0;
  border-radius: 0;
  font-size: 14px;
  font-weight: normal;
  display: inline;
  line-height: inherit;
  min-height: auto;
  text-align: left;
  vertical-align: baseline;
  white-space: normal;
}

/* 技能项之间用逗号分隔 */
.skill-tag:not(:last-child)::after {
  content: "、";
  margin-right: 4px;
}
/********** 代码修改结束 **********/

.certificates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cert-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.other-item {
  margin-bottom: 12px;
  line-height: 1.6;
}

.other-item strong {
  color: #667eea;
  margin-right: 8px;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.feature-item h5 {
  color: #667eea;
  font-size: 16px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .resume-container {
    padding: 16px;
  }
  
  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .resume-grid {
    grid-template-columns: 1fr;
  }
  
  .form-container {
    max-height: 60vh;
  }
  
  .experience-item {
    padding: 16px;
  }
  
  /* 只在真正的触摸设备上让联系方式垂直排列 */
  @media (hover: none) and (pointer: coarse) {
    .contact-info {
      flex-direction: column;
      gap: 8px;
    }
    
    .work-header, .edu-header, .project-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .work-period, .edu-period, .project-period {
      margin-left: 0;
      margin-top: 4px;
    }
  }
}

/* 加载动画 */
.resume-card {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dialog-title-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.a4-indicator {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.export-buttons {
  display: flex;
  gap: 8px;
}

/* 预览弹窗基础样式 */
.preview-dialog .el-dialog {
  max-width: 850px !important;
  left: 0 !important;
}

/* 只在传统桌面设备(非触摸设备)上应用居中定位 */
@media (hover: hover) and (pointer: fine) {
  .preview-dialog .el-dialog {
    left: 50% !important;
    transform: translateX(-50%) !important;
    margin: 20px auto !important;
  }
}

.preview-dialog .el-dialog__body {
  padding: 20px !important;
  background-color: #f5f5f5;
  text-align: center;
}

/* 移动端响应式设计 */
@media (max-width: 850px) {
  .preview-dialog .el-dialog {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
  }
  
  .preview-container {
    min-width: auto !important;  /* 关键：移除794px固定宽度 */
    width: 100% !important;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start; /* 从顶部开始对齐 */
  }
  
  .resume-preview {
    transform: scale(calc(100vw / 794)) !important;
    transform-origin: center top !important;
    /* 确保缩放后不会超出容器 */
    max-width: 100vw !important;
    max-height: calc(1123px * (100vw / 794)) !important;
  }
}

/* 简历预览 - 固定A4尺寸 */
.resume-preview {
  background: white;
  padding: 30px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  width: 794px !important;
  min-width: 794px !important;
  max-width: 794px !important;
  min-height: 1123px;
  box-sizing: border-box;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  overflow: hidden;
  display: inline-block;
  text-align: left;
}

.preview-container {
  display: inline-block;
  text-align: left;
  /* 确保容器不会被压缩 */
  min-width: 794px;
}

/* 替换现有的复杂媒体查询 */
@media (max-width: 850px) {
  .preview-dialog .el-dialog {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    top: 0 !important;
    left: 0 !important;
    transform: none !important;
  }
  
  .preview-dialog .el-dialog__wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0;
    overflow: hidden;
  }
  
  .preview-dialog .el-dialog__body {
    padding: 10px !important;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }
  
  /* 关键修复：移除固定宽度 */
  .preview-container {
    min-width: auto !important;
    width: 100% !important;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }
  
  /* 简历等比缩放 */
  .resume-preview {
    transform: scale(calc(100vw / 794)) !important;
    transform-origin: center top !important;
    max-width: 100vw !important;
  }
}

/* 移除固定缩放比例，统一使用自适应缩放 */
@media (max-width: 650px) {
  /* 只在真正的触摸设备上应用样式 */
  @media (hover: none) and (pointer: coarse) {
    .resume-preview {
      /* 保持自适应缩放，移除固定值 */
      margin: 0 auto !important;
    }
  }
}

@media (max-width: 500px) {
  /* 只在真正的触摸设备上应用样式 */
  @media (hover: none) and (pointer: coarse) {
    .resume-preview {
      /* 保持自适应缩放，移除固定值 */
      margin: 0 auto !important;
    }
  }
}

/* 导出时保持尺寸 */
@media print {
  .resume-preview {
    width: 794px !important;
    min-width: 794px !important;
    max-width: 794px !important;
    min-height: 1123px !important;
    padding: 20px;
    box-shadow: none;
    border: none;
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .export-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .export-buttons .el-button {
    font-size: 12px;
    padding: 6px 10px;
  }
  
  .preview-header-section {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .dialog-title-area {
    align-items: center;
  }
}
</style>