<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'

const { t } = useI18n()

const info = reactive({
  title: "tools.mysqltogo.title",
})

// 表单数据
const formData = reactive({
  mysqlDDL: '',
  addJsonTag: true,
  addGormTag: true,
  addXormTag: false,
  addGinTag: false,
  usePointer: false,
  useTime: true,
  useNull: false
})

// 转换结果
const result = ref('')
const errorMessage = ref('')
const warnings = ref<string[]>([])

// MySQL字段类型到Go类型的映射
const mysqlToGoTypeMap: Record<string, string> = {
  'tinyint': 'int8',
  'smallint': 'int16',
  'mediumint': 'int32',
  'int': 'int',
  'integer': 'int',
  'bigint': 'int64',
  'float': 'float32',
  'double': 'float64',
  'decimal': 'float64',
  'numeric': 'float64',
  'char': 'string',
  'varchar': 'string',
  'text': 'string',
  'tinytext': 'string',
  'mediumtext': 'string',
  'longtext': 'string',
  'blob': '[]byte',
  'tinyblob': '[]byte',
  'mediumblob': '[]byte',
  'longblob': '[]byte',
  'binary': '[]byte',
  'varbinary': '[]byte',
  'date': 'time.Time',
  'time': 'time.Time',
  'datetime': 'time.Time',
  'timestamp': 'time.Time',
  'year': 'int',
  'json': 'string',
  'enum': 'string',
  'set': 'string',
  'bit': '[]byte',
  'boolean': 'bool',
  'bool': 'bool'
}

// 检查DDL格式
const validateDDL = (ddl: string): { isValid: boolean, errors: string[], warnings: string[] } => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!ddl.trim()) {
    return { isValid: true, errors, warnings }
  }
  
  // 检查是否包含CREATE TABLE
  if (!ddl.toUpperCase().includes('CREATE TABLE')) {
    errors.push(t('tools.mysqltogo.validator.no_keyword'))
    return { isValid: false, errors, warnings }
  }
  
  // 检查表名
  const tableNameMatch = ddl.match(/CREATE\s+TABLE\s+(?:`?(\w+)`?|`([^`]+)`)/i)
  if (!tableNameMatch) {
    errors.push(t('tools.mysqltogo.validator.no_table'))
  }
  
  // 检查是否有字段定义
  const lines = ddl.split('\n').map(line => line.trim()).filter(line => line)
  let hasFields = false
  
  for (const line of lines) {
    // 跳过注释和表结构定义
    if (line.startsWith('--') || line.startsWith('/*') || line.startsWith('CREATE TABLE') || 
        line.startsWith('(') || line.startsWith(')') || line.startsWith('PRIMARY KEY') ||
        line.startsWith('KEY') || line.startsWith('INDEX') || line.startsWith('UNIQUE KEY')) {
      continue
    }
    
    // 检查字段定义
    const fieldMatch = line.match(/`?(\w+)`?\s+(\w+)/i)
    if (fieldMatch) {
      hasFields = true
      const [, fieldName, fieldType] = fieldMatch
      
      // 检查字段名
      if (!fieldName) {
        errors.push(t('tools.mysqltogo.validator.field_error', { line }))
      }
      
      // 检查字段类型
      if (!fieldType) {
        errors.push(t('tools.mysqltogo.validator.field_type_missing', { line }))
      } else if (!mysqlToGoTypeMap[fieldType.toLowerCase()]) {
        warnings.push(t('tools.mysqltogo.validator.unknown_type', { type: fieldType }))
      }
      
      // 检查字段名格式
      if (fieldName.includes(' ')) {
        errors.push(t('tools.mysqltogo.validator.space_in_name', { name: fieldName }))
      }
    }
  }
  
  if (!hasFields) {
    errors.push(t('tools.mysqltogo.validator.no_fields'))
  }
  
  // 检查括号匹配
  const openParens = (ddl.match(/\(/g) || []).length
  const closeParens = (ddl.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push(t('tools.mysqltogo.validator.paren_mismatch'))
  }
  
  // 检查引号匹配
  const singleQuotes = (ddl.match(/'/g) || []).length
  const doubleQuotes = (ddl.match(/"/g) || []).length
  if (singleQuotes % 2 !== 0) {
    errors.push(t('tools.mysqltogo.validator.squote_mismatch'))
  }
  if (doubleQuotes % 2 !== 0) {
    errors.push(t('tools.mysqltogo.validator.dquote_mismatch'))
  }
  
  // 检查明显的语法错误
  if (ddl.includes('121') || ddl.includes('UP1212DATE')) {
    errors.push(t('tools.mysqltogo.validator.syntax_error'))
  }
  
  // 检查ON UPDATE语法
  if (ddl.includes('ON UP') && !ddl.includes('ON UPDATE')) {
    errors.push(t('tools.mysqltogo.validator.on_update_error'))
  }
  
  return { isValid: errors.length === 0, errors, warnings }
}

// 从DDL中提取表名
const extractTableName = (ddl: string): string => {
  const match = ddl.match(/CREATE\s+TABLE\s+(?:`?(\w+)`?|`([^`]+)`)/i)
  if (match) {
    return match[1] || match[2] || ''
  }
  return ''
}

// 表名转换为结构体名（PascalCase）
const tableNameToStructName = (tableName: string): string => {
  if (!tableName) return 'Table'
  
  // 处理下划线命名
  return tableName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join('')
}

// 解析MySQL DDL
const parseMySQLDDL = (ddl: string) => {
  const lines = ddl.split('\n').map(line => line.trim()).filter(line => line)
  const fields: Array<{name: string, type: string, comment: string, key: string}> = []
  
  for (const line of lines) {
    // 跳过注释和表结构定义
    if (line.startsWith('--') || line.startsWith('/*') || line.startsWith('CREATE TABLE') || 
        line.startsWith('(') || line.startsWith(')') || line.startsWith('PRIMARY KEY') ||
        line.startsWith('KEY') || line.startsWith('INDEX') || line.startsWith('UNIQUE KEY')) {
      continue
    }
    
    // 解析字段定义
    const fieldMatch = line.match(/`?(\w+)`?\s+(\w+)(?:\([^)]+\))?(?:\s+(\w+))*(?:\s+COMMENT\s+['"]([^'"]*)['"])?/i)
    if (fieldMatch) {
      const [, name, type, , comment] = fieldMatch
      const key = line.includes('PRIMARY KEY') ? 'PRI' : 
                 line.includes('UNIQUE KEY') ? 'UNI' : 
                 line.includes('KEY') ? 'MUL' : ''
      
      fields.push({
        name: name.toLowerCase(),
        type: type.toLowerCase(),
        comment: comment || '',
        key
      })
    }
  }
  
  return fields
}

// 转换为Go结构体
const convertToGoStruct = () => {
  errorMessage.value = ''
  warnings.value = []
  
  if (!formData.mysqlDDL.trim()) {
    result.value = ''
    return
  }
  
  // 验证DDL
  const validation = validateDDL(formData.mysqlDDL)
  warnings.value = validation.warnings
  
  if (!validation.isValid) {
    errorMessage.value = validation.errors.join('; ')
    result.value = ''
    return
  }
  
  try {
    const fields = parseMySQLDDL(formData.mysqlDDL)
    if (fields.length === 0) {
      errorMessage.value = t('tools.mysqltogo.msg.parse_fail')
      result.value = ''
      return
    }
    
    // 从DDL中提取表名
    const tableName = extractTableName(formData.mysqlDDL)
    if (!tableName) {
      errorMessage.value = t('tools.mysqltogo.msg.table_fail')
      result.value = ''
      return
    }
    
    const structName = tableNameToStructName(tableName)
    
    let goCode = `type ${structName} struct {\n`
    
    for (const field of fields) {
      let goType = mysqlToGoTypeMap[field.type] || 'string'
      
      // 处理可空类型
      if (formData.useNull) {
        if (goType === 'string') goType = '*string'
        else if (goType === 'int') goType = '*int'
        else if (goType === 'int64') goType = '*int64'
        else if (goType === 'float64') goType = '*float64'
        else if (goType === 'bool') goType = '*bool'
        else if (goType === 'time.Time') goType = '*time.Time'
      }
      
      // 处理指针类型
      if (formData.usePointer && !goType.startsWith('*')) {
        goType = '*' + goType
      }
      
      // 转换为PascalCase字段名
      const fieldName = field.name.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
      
      goCode += `\t${fieldName}`
      
      // 添加类型
      if (formData.usePointer && !goType.startsWith('*')) {
        goCode += ` *${goType}`
      } else {
        goCode += ` ${goType}`
      }
      
      // 添加标签
      const tags: string[] = []
      
      if (formData.addJsonTag) {
        tags.push(`json:"${field.name}"`)
      }
      
      if (formData.addGormTag) {
        let gormTag = `gorm:"column:${field.name}`
        if (field.key === 'PRI') gormTag += ';primaryKey'
        if (field.comment) gormTag += `;comment:${field.comment}`
        gormTag += '"'
        tags.push(gormTag)
      }
      
      if (formData.addXormTag) {
        let xormTag = `xorm:"'${field.name}'`
        if (field.key === 'PRI') xormTag += ' pk'
        if (field.comment) xormTag += ` comment('${field.comment}')`
        xormTag += '"'
        tags.push(xormTag)
      }
      
      if (formData.addGinTag) {
        tags.push(`form:"${field.name}" binding:"required"`)
      }
      
      if (tags.length > 0) {
        goCode += ` \`${tags.join(' ')}\``
      }
      
      // 添加注释
      if (field.comment) {
        goCode += ` // ${field.comment}`
      }
      
      goCode += '\n'
    }
    
    goCode += '}'
    
    // 如果需要time包，添加import
    if (formData.useTime && fields.some(field => mysqlToGoTypeMap[field.type] === 'time.Time')) {
      goCode = `import "time"\n\n` + goCode
    }
    
    result.value = goCode
  } catch (error) {
    errorMessage.value = t('tools.mysqltogo.msg.convert_fail', { error })
    result.value = ''
  }
}

// 监听DDL变化，自动转换和验证
watch(() => formData.mysqlDDL, (newValue) => {
  // 立即验证
  const validation = validateDDL(newValue)
  warnings.value = validation.warnings
  
  if (!validation.isValid) {
    errorMessage.value = validation.errors.join('; ')
    result.value = ''
  } else {
    errorMessage.value = ''
    // 如果没有错误，则进行转换
    convertToGoStruct()
  }
}, { immediate: true })

// 监听配置变化，自动转换
watch([
  () => formData.addJsonTag,
  () => formData.addGormTag,
  () => formData.addXormTag,
  () => formData.addGinTag,
  () => formData.usePointer,
  () => formData.useTime,
  () => formData.useNull
], () => {
  if (formData.mysqlDDL.trim()) {
    convertToGoStruct()
  }
})

// 复制结果
const copyResult = async () => {
  if (result.value) {
    await copy(result.value)
  }
}

// 清空
const clearAll = () => {
  formData.mysqlDDL = ''
  result.value = ''
  errorMessage.value = ''
  warnings.value = []
}

// 示例DDL
const exampleDDL = `CREATE TABLE \`users\` (
  \`id\` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  \`username\` varchar(50) NOT NULL COMMENT '用户名',
  \`email\` varchar(100) DEFAULT NULL COMMENT '邮箱',
  \`age\` int(11) DEFAULT NULL COMMENT '年龄',
  \`created_at\` datetime NOT NULL COMMENT '创建时间',
  \`updated_at\` datetime DEFAULT NULL COMMENT '更新时间',
  \`is_active\` tinyint(1) DEFAULT '1' COMMENT '是否激活',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';`

const loadExample = () => {
  formData.mysqlDDL = exampleDDL
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <el-form :model="formData" label-width="120px" class="space-y-4">
        <!-- MySQL DDL -->
        <el-form-item :label="$t('tools.mysqltogo.label_ddl')">
          <el-input
            v-model="formData.mysqlDDL"
            type="textarea"
            :rows="8"
            :placeholder="$t('tools.mysqltogo.placeholder_ddl')"
            class="font-mono"
          />
        </el-form-item>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          <div class="flex items-center mb-1">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">{{ $t('tools.mysqltogo.label_error') }}</span>
          </div>
          <div>{{ errorMessage }}</div>
        </div>

        <!-- 警告提示 -->
        <div v-if="warnings.length > 0" class="text-yellow-600 text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div class="flex items-center mb-1">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span class="font-medium">{{ $t('tools.mysqltogo.label_warning') }}</span>
          </div>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
          </ul>
        </div>

        <!-- 选项配置 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <el-form-item :label="$t('tools.mysqltogo.label_json_tag')">
            <el-switch v-model="formData.addJsonTag" />
          </el-form-item>
          <el-form-item :label="$t('tools.mysqltogo.label_gorm_tag')">
            <el-switch v-model="formData.addGormTag" />
          </el-form-item>
          <el-form-item :label="$t('tools.mysqltogo.label_xorm_tag')">
            <el-switch v-model="formData.addXormTag" />
          </el-form-item>
          <el-form-item :label="$t('tools.mysqltogo.label_gin_tag')">
            <el-switch v-model="formData.addGinTag" />
          </el-form-item>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <el-form-item :label="$t('tools.mysqltogo.label_pointer')">
            <el-switch v-model="formData.usePointer" />
          </el-form-item>
          <el-form-item :label="$t('tools.mysqltogo.label_time_pkg')">
            <el-switch v-model="formData.useTime" />
          </el-form-item>
          <el-form-item :label="$t('tools.mysqltogo.label_null')">
            <el-switch v-model="formData.useNull" />
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-wrap gap-2">
          <el-button @click="loadExample">{{ $t('tools.mysqltogo.btn_example') }}</el-button>
          <el-button @click="clearAll">{{ $t('tools.mysqltogo.btn_clear') }}</el-button>
        </div>
      </el-form>
    </div>

    <!-- 转换结果 -->
    <div v-if="result" class="p-4 rounded-2xl bg-white">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold">{{ $t('tools.mysqltogo.label_result') }}</h3>
        <el-button type="primary" @click="copyResult">{{ $t('tools.mysqltogo.btn_copy') }}</el-button>
      </div>
      <pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">{{ result }}</pre>
    </div>

    <!-- 描述 -->
    <ToolDetail :title="$t('tools.mysqltogo.detail_title')">
      <div class="space-y-2">
        <p>{{ $t('tools.mysqltogo.desc') }}</p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li v-for="(feature, idx) in $t('tools.mysqltogo.features')" :key="idx">{{ feature }}</li>
        </ul>
      </div>
    </ToolDetail>

    <!-- 使用说明 -->
    <ToolDetail :title="$t('tools.mysqltogo.usage_title')">
      <div class="space-y-2">
        <ol class="list-decimal list-inside space-y-1 text-sm">
          <li v-for="(step, idx) in $t('tools.mysqltogo.usage')" :key="idx">{{ step }}</li>
        </ol>
        <p class="text-sm text-gray-600 mt-2">
          <strong>{{ $t('tools.mysqltogo.tip') }}</strong>
        </p>
      </div>
    </ToolDetail>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
