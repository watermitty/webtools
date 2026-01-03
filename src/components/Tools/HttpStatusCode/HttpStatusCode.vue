<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'

const { t } = useI18n()
// import { copy } from '@/utils/string'
const info = reactive({
  title: "tools.httpstatus.title",
})
// ascii: https://ascii.co.uk/table
const tableDataControlOne = computed(() => [
  { code: "100 Continue", desc: t('tools.httpstatus.codes.100.desc') },
  { code: "101 Switching Protocols", desc: t('tools.httpstatus.codes.101.desc') },
  { code: "102 Processing", desc: t('tools.httpstatus.codes.102.desc') },
])

const tableDataControlTwo = computed(() => [
  { code: "200 OK", desc: t('tools.httpstatus.codes.200.desc') },
  { code: "201 Created", desc: t('tools.httpstatus.codes.201.desc') },
  { code: "202 Accepted", desc: t('tools.httpstatus.codes.202.desc') },
  { code: "203 Non-Authoritative Information", desc: t('tools.httpstatus.codes.203.desc') },
  { code: "204 No Content", desc: t('tools.httpstatus.codes.204.desc') },
  { code: "205 Reset Content", desc: t('tools.httpstatus.codes.205.desc') },
  { code: "206 Partial Content", desc: t('tools.httpstatus.codes.206.desc') },
  { code: "207 Multi-Status", desc: t('tools.httpstatus.codes.207.desc') },
  { code: "208 Already Reported", desc: t('tools.httpstatus.codes.208.desc') },
  { code: "226 IM Used", desc: t('tools.httpstatus.codes.226.desc') },
])

const tableDataControlThree = computed(() => [
  { code: "300 Multiple Choices", desc: t('tools.httpstatus.codes.300.desc') },
  { code: "301 Moved Permanently", desc: t('tools.httpstatus.codes.301.desc') },
  { code: "302 Move Temporarily", desc: t('tools.httpstatus.codes.302.desc') },
  { code: "303 See Other", desc: t('tools.httpstatus.codes.303.desc') },
  { code: "304 Not Modified", desc: t('tools.httpstatus.codes.304.desc') },
  { code: "305 Use Proxy", desc: t('tools.httpstatus.codes.305.desc') },
  { code: "306 Switch Proxy", desc: t('tools.httpstatus.codes.306.desc') },
  { code: "307 Temporary Redirect", desc: t('tools.httpstatus.codes.307.desc') },
  { code: "308 Permanent Redirect", desc: t('tools.httpstatus.codes.308.desc') },
])

const tableDataControlFour = computed(() => [
  { code: "400 Bad Request", desc: t('tools.httpstatus.codes.400.desc') },
  { code: "401 Unauthorized", desc: t('tools.httpstatus.codes.401.desc') },
  { code: "402 Payment Required", desc: t('tools.httpstatus.codes.402.desc') },
  { code: "403 Forbidden", desc: t('tools.httpstatus.codes.403.desc') },
  { code: "404 Not Found", desc: t('tools.httpstatus.codes.404.desc') },
  { code: "405 Method Not Allowed", desc: t('tools.httpstatus.codes.405.desc') },
  { code: "406 Not Acceptable", desc: t('tools.httpstatus.codes.406.desc') },
  { code: "407 Proxy Authentication Required", desc: t('tools.httpstatus.codes.407.desc') },
  { code: "408 Request Timeout", desc: t('tools.httpstatus.codes.408.desc') },
  { code: "409 Conflict", desc: t('tools.httpstatus.codes.409.desc') },
  { code: "410 Gone", desc: t('tools.httpstatus.codes.410.desc') },
  { code: "411 Length Required", desc: t('tools.httpstatus.codes.411.desc') },
  { code: "412 Precondition Failed", desc: t('tools.httpstatus.codes.412.desc') },
  { code: "413 Request Entity Too Large", desc: t('tools.httpstatus.codes.413.desc') },
  { code: "414 Request-URI Too Long", desc: t('tools.httpstatus.codes.414.desc') },
  { code: "415 Unsupported Media Type", desc: t('tools.httpstatus.codes.415.desc') },
  { code: "416 Requested Range Not Satisfiable", desc: t('tools.httpstatus.codes.416.desc') },
  { code: "417 Expectation Failed", desc: t('tools.httpstatus.codes.417.desc') },
  { code: "418 I'm a teapot", desc: t('tools.httpstatus.codes.418.desc') },
  { code: "421 Misdirected Request", desc: t('tools.httpstatus.codes.421.desc') },
  { code: "422 Unprocessable Entity", desc: t('tools.httpstatus.codes.422.desc') },
  { code: "423 Locked", desc: t('tools.httpstatus.codes.423.desc') },
  { code: "424 Failed Dependency", desc: t('tools.httpstatus.codes.424.desc') },
  { code: "425 Too Early", desc: t('tools.httpstatus.codes.425.desc') },
  { code: "426 Upgrade Required", desc: t('tools.httpstatus.codes.426.desc') },
  { code: "429 Too Many Requests", desc: t('tools.httpstatus.codes.429.desc') },
  { code: "431 Request Header Fields Too Large", desc: t('tools.httpstatus.codes.431.desc') },
  { code: "449 Retry With", desc: t('tools.httpstatus.codes.449.desc') },
  { code: "451 Unavailable For Legal Reasons", desc: t('tools.httpstatus.codes.451.desc') },
])

const tableDataControlFive = computed(() => [
  { code: "500 Internal Server Error", desc: t('tools.httpstatus.codes.500.desc') },
  { code: "501 Not Implemented", desc: t('tools.httpstatus.codes.501.desc') },
  { code: "502 Bad Gateway", desc: t('tools.httpstatus.codes.502.desc') },
  { code: "503 Service Unavailable", desc: t('tools.httpstatus.codes.503.desc') },
  { code: "504 Gateway Timeout", desc: t('tools.httpstatus.codes.504.desc') },
  { code: "505 HTTP Version Not Supported", desc: t('tools.httpstatus.codes.505.desc') },
  { code: "506 Variant Also Negotiates", desc: t('tools.httpstatus.codes.506.desc') },
  { code: "507 Insufficient Storage", desc: t('tools.httpstatus.codes.507.desc') },
  { code: "509 Bandwidth Limit Exceeded", desc: t('tools.httpstatus.codes.509.desc') },
  { code: "510 Not Extended", desc: t('tools.httpstatus.codes.510.desc') },
  { code: "511 Network Authentication Required", desc: t('tools.httpstatus.codes.511.desc') },
])

//copy
// const copyRes = async (resStr: string) => {
//   copy(resStr)
// }
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <el-table :data="tableDataControlOne" class="w-full mb-3">
        <el-table-column :label="$t('tools.httpstatus.group_1xx')" align="center">
          <el-table-column prop="code" :label="$t('tools.httpstatus.col_code')" width="270" />
          <el-table-column prop="desc" :label="$t('tools.httpstatus.col_desc')" />
        </el-table-column>
      </el-table>

      <el-table :data="tableDataControlTwo" class="w-full mb-3">
        <el-table-column :label="$t('tools.httpstatus.group_2xx')" align="center">
          <el-table-column prop="code" :label="$t('tools.httpstatus.col_code')" width="270" />
          <el-table-column prop="desc" :label="$t('tools.httpstatus.col_desc')"/>
        </el-table-column>
      </el-table>

      <el-table :data="tableDataControlThree" class="w-full mb-3">
        <el-table-column :label="$t('tools.httpstatus.group_3xx')" align="center">
          <el-table-column prop="code" :label="$t('tools.httpstatus.col_code')" width="270" />
          <el-table-column prop="desc" :label="$t('tools.httpstatus.col_desc')"/>
        </el-table-column>
      </el-table>

      <el-table :data="tableDataControlFour" class="w-full mb-3">
        <el-table-column :label="$t('tools.httpstatus.group_4xx')" align="center">
          <el-table-column prop="code" :label="$t('tools.httpstatus.col_code')" width="270" />
          <el-table-column prop="desc" :label="$t('tools.httpstatus.col_desc')"/>
        </el-table-column>
      </el-table>

      <el-table :data="tableDataControlFive" class="w-full mb-3">
        <el-table-column :label="$t('tools.httpstatus.group_5xx')" align="center">
          <el-table-column prop="code" :label="$t('tools.httpstatus.col_code')" width="270" />
          <el-table-column prop="desc" :label="$t('tools.httpstatus.col_desc')"/>
        </el-table-column>
      </el-table>
    </div>

    <!-- desc -->
    <ToolDetail :title="$t('tools.httpstatus.detail_title')">
      <el-text>
        {{ $t('tools.httpstatus.detail_content') }}
      </el-text> 
    </ToolDetail>
  </div>
</template>

<style scoped>

</style>