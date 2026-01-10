<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from 'vue-i18n'
import DetailHeader from "@/components/Layout/DetailHeader/DetailHeader.vue";
// @ts-ignore
import QRCodeVue3 from "qrcode-vue3";
import { Delete, Plus } from "@element-plus/icons-vue";

import { ElMessage, type UploadFile } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'

const { t } = useI18n()

const info = reactive({
  title: "tools.qrcode.title",
  content: "hello world",
  width: 200,
  height: 200,
  size: "200",
  fileList: <string[]>[],
  fileUrl: "",
  preColor: "#6A1A4C",
  bgColor: "#ffffff",
  qrKey: 1,
  errorCorrectionLevel: "H",
  dotType: "dots", // 默认使用圆角样式
  cornerSquareType: "square",
  cornerDotType: "square",
  // 颜色模式：'single' 或 'gradient'
  colorMode: "gradient",
  // 渐变色设置
  gradientType: "radial",
  gradientRotation: 0,
  gradientColor1: "#FF8C00",
  gradientColor2: "#1E90FF",
  // 角落方块设置
  cornerSquareColorMode: "single",
  cornerSquareColor: "#000000",
  cornerSquareGradientType: "linear",
  cornerSquareGradientRotation: 0,
  cornerSquareGradientColor1: "#FF0000",
  cornerSquareGradientColor2: "#00FF00",
  // 角落点设置
  cornerDotColorMode: "single",
  cornerDotColor: "#000000",
  cornerDotGradientType: "linear",
  cornerDotGradientRotation: 0,
  cornerDotGradientColor1: "#FF0000",
  cornerDotGradientColor2: "#00FF00",
  // 新增：配置模式
  configMode: "preset", // "preset" 或 "custom"
  // 新增：预设配置，默认选择 "default"
  presetConfig: "default",
});

// 预设配置定义
const presetConfigs = {
  default: {
    nameKey: "tools.qrcode.styles.default_name",
    descKey: "tools.qrcode.styles.default_desc",
    dotType: "dots", // 当前实际使用的点样式
    cornerSquareType: "square",
    cornerDotType: "square",
    colorMode: "gradient",
    gradientType: "radial",
    gradientRotation: 0,
    gradientColor1: "#FF8C00", // 确保和当前实际颜色一致
    gradientColor2: "#1E90FF",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#000000",
    cornerDotColorMode: "single",
    cornerDotColor: "#000000",
    // 添加单色模式的属性
    preColor: "#000000",
  },
  classic: {
    nameKey: "tools.qrcode.styles.classic_name",
    descKey: "tools.qrcode.styles.classic_desc",
    dotType: "square",
    cornerSquareType: "square",
    cornerDotType: "square",
    colorMode: "single",
    preColor: "#000000",
    bgColor: "#ffffff",
    cornerSquareColor: "#000000",
    cornerDotColor: "#000000",
    // 添加渐变模式的属性
    gradientType: "linear",
    gradientRotation: 0,
    gradientColor1: "#000000",
    gradientColor2: "#000000",
  },
  modern: {
    nameKey: "tools.qrcode.styles.modern_name",
    descKey: "tools.qrcode.styles.modern_desc",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 45,
    gradientColor1: "#667eea",
    gradientColor2: "#764ba2",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#667eea",
    cornerDotColorMode: "single",
    cornerDotColor: "#667eea",
    // 添加单色模式的属性
    preColor: "#667eea",
  },
  warm: {
    nameKey: "tools.qrcode.styles.warm_name",
    descKey: "tools.qrcode.styles.warm_desc",
    dotType: "dots",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "radial",
    gradientRotation: 0,
    gradientColor1: "#ff9a9e",
    gradientColor2: "#fecfef",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#ff9a9e",
    cornerDotColorMode: "single",
    cornerDotColor: "#ff9a9e",
    // 添加单色模式的属性
    preColor: "#ff9a9e",
  },
  elegant: {
    nameKey: "tools.qrcode.styles.elegant_name",
    descKey: "tools.qrcode.styles.elegant_desc",
    dotType: "classy",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 135,
    gradientColor1: "#a8edea",
    gradientColor2: "#fed6e3",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#a8edea",
    cornerDotColorMode: "single",
    cornerDotColor: "#a8edea",
    // 添加单色模式的属性
    preColor: "#a8edea",
  },
  tech: {
    nameKey: "tools.qrcode.styles.tech_name",
    descKey: "tools.qrcode.styles.tech_desc",
    dotType: "rounded",
    cornerSquareType: "square",
    cornerDotType: "square",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 90,
    gradientColor1: "#00d4aa",
    gradientColor2: "#0099cc",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#00d4aa",
    cornerDotColorMode: "single",
    cornerDotColor: "#00d4aa",
    // 添加单色模式的属性
    preColor: "#00d4aa",
  },
  sunset: {
    nameKey: "tools.qrcode.styles.sunset_name",
    descKey: "tools.qrcode.styles.sunset_desc",
    dotType: "dots",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 45,
    gradientColor1: "#ff6b6b",
    gradientColor2: "#ffa726",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#ff6b6b",
    cornerDotColorMode: "single",
    cornerDotColor: "#ff6b6b",
    // 添加单色模式的属性
    preColor: "#ff6b6b",
  },
  ocean: {
    nameKey: "tools.qrcode.styles.ocean_name",
    descKey: "tools.qrcode.styles.ocean_desc",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 180,
    gradientColor1: "#4facfe",
    gradientColor2: "#00f2fe",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#4facfe",
    cornerDotColorMode: "single",
    cornerDotColor: "#4facfe",
    // 添加单色模式的属性
    preColor: "#4facfe",
  },
  forest: {
    nameKey: "tools.qrcode.styles.forest_name",
    descKey: "tools.qrcode.styles.forest_desc",
    dotType: "classy",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "radial",
    gradientRotation: 0,
    gradientColor1: "#56ab2f",
    gradientColor2: "#a8e6cf",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#56ab2f",
    cornerDotColorMode: "single",
    cornerDotColor: "#56ab2f",
    // 添加单色模式的属性
    preColor: "#56ab2f",
  },
  gold: {
    nameKey: "tools.qrcode.styles.gold_name",
    descKey: "tools.qrcode.styles.gold_desc",
    dotType: "classy",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 45,
    gradientColor1: "#ffd700",
    gradientColor2: "#ffb347",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#ffd700",
    cornerDotColorMode: "single",
    cornerDotColor: "#ffd700",
    // 添加单色模式的属性
    preColor: "#ffd700",
  },
  neon: {
    nameKey: "tools.qrcode.styles.neon_name",
    descKey: "tools.qrcode.styles.neon_desc",
    dotType: "dots",
    cornerSquareType: "square",
    cornerDotType: "square",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 90,
    gradientColor1: "#ff00ff",
    gradientColor2: "#00ffff",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#ff00ff",
    cornerDotColorMode: "single",
    cornerDotColor: "#ff00ff",
    // 添加单色模式的属性
    preColor: "#ff00ff",
  },
  vintage: {
    nameKey: "tools.qrcode.styles.vintage_name",
    descKey: "tools.qrcode.styles.vintage_desc",
    dotType: "classy",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "single",
    preColor: "#8b4513",
    bgColor: "#f5f5dc",
    cornerSquareColor: "#8b4513",
    cornerDotColor: "#8b4513",
    // 添加渐变模式的属性
    gradientType: "linear",
    gradientRotation: 0,
    gradientColor1: "#8b4513",
    gradientColor2: "#8b4513",
  },
  pastel: {
    nameKey: "tools.qrcode.styles.pastel_name",
    descKey: "tools.qrcode.styles.pastel_desc",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 135,
    gradientColor1: "#ffb3ba",
    gradientColor2: "#baffc9",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#ffb3ba",
    cornerDotColorMode: "single",
    cornerDotColor: "#ffb3ba",
    // 添加单色模式的属性
    preColor: "#ffb3ba",
  },
  cyber: {
    nameKey: "tools.qrcode.styles.cyber_name",
    descKey: "tools.qrcode.styles.cyber_desc",
    dotType: "square",
    cornerSquareType: "square",
    cornerDotType: "square",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 45,
    gradientColor1: "#00ff00",
    gradientColor2: "#ff00ff",
    bgColor: "#000000",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#00ff00",
    cornerDotColorMode: "single",
    cornerDotColor: "#00ff00",
    // 添加单色模式的属性
    preColor: "#00ff00",
  },
  minimal: {
    nameKey: "tools.qrcode.styles.minimal_name",
    descKey: "tools.qrcode.styles.minimal_desc",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "single",
    preColor: "#666666",
    bgColor: "#ffffff",
    cornerSquareColor: "#666666",
    cornerDotColor: "#666666",
    // 添加渐变模式的属性
    gradientType: "linear",
    gradientRotation: 0,
    gradientColor1: "#666666",
    gradientColor2: "#666666",
  },
  fire: {
    nameKey: "tools.qrcode.styles.fire_name",
    descKey: "tools.qrcode.styles.fire_desc",
    dotType: "dots",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 45,
    gradientColor1: "#ff4500",
    gradientColor2: "#ff6347",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#ff4500",
    cornerDotColorMode: "single",
    cornerDotColor: "#ff4500",
    // 添加单色模式的属性
    preColor: "#ff4500",
  },
  ice: {
    nameKey: "tools.qrcode.styles.ice_name",
    descKey: "tools.qrcode.styles.ice_desc",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorMode: "gradient",
    gradientType: "linear",
    gradientRotation: 180,
    gradientColor1: "#87ceeb",
    gradientColor2: "#b0e0e6",
    bgColor: "#ffffff",
    cornerSquareColorMode: "single",
    cornerSquareColor: "#87ceeb",
    cornerDotColorMode: "single",
    cornerDotColor: "#87ceeb",
    // 添加单色模式的属性
    preColor: "#87ceeb",
  }
};

// 应用预设配置
const applyPreset = (presetKey: string) => {
  const preset = presetConfigs[presetKey as keyof typeof presetConfigs];
  if (preset) {
    Object.assign(info, preset);
    info.presetConfig = presetKey;
    info.qrKey += 1;
  }
};


const showQRDialog = ref(false);
const windowWidth = ref(800); // 默认宽度

// 添加滚动距离响应式变量
const scrollTop = ref(0);
const scrollDirection = ref('down'); // 'up' 或 'down'
const lastScrollTop = ref(0);

// 添加页面总高度计算
const pageHeight = ref(0);
const viewportHeight = ref(0);

// 监听滚动事件
const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // 更新滚动距离
  scrollTop.value = currentScrollTop;
  
  // 判断滚动方向
  if (currentScrollTop > lastScrollTop.value) {
    scrollDirection.value = 'down';
  } else if (currentScrollTop < lastScrollTop.value) {
    scrollDirection.value = 'up';
  }
  
  // 更新上次滚动位置
  lastScrollTop.value = currentScrollTop;
  
  // 更新页面高度信息
  updatePageInfo();
};

// 更新页面信息
const updatePageInfo = () => {
  viewportHeight.value = window.innerHeight;
  pageHeight.value = document.documentElement.scrollHeight;
};

// 简化的动态 margin-top 计算
const dynamicMarginTop = computed(() => {
  // 在移动端（小屏幕）时，返回固定值，不跟随滚动
  if (windowWidth.value < 1024) {
    return 24; // 移动端固定位置
  }
  
  // 桌面端才使用动态定位
  const maxTop = scrollTop.value - 80;
  const basePosition = 100;
  const scrollInfluence = scrollTop.value * 0.8;
  
  let targetPosition = basePosition + scrollInfluence;
  targetPosition = Math.max(20, Math.min(maxTop, targetPosition));
  
  return targetPosition;
});

// 计算属性：动态设置二维码尺寸
const qrSize = computed(() => parseInt(info.size));

// 生成唯一的下载文件名
const downloadFileName = computed(() => {
  return `qrcode-${uuidv4()}`;
});

// 计算大图尺寸
const largeQRSize = computed(() => {
  return Math.min(400, windowWidth.value * 0.6);
});

// 获取窗口宽度
onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener("resize", () => {
    windowWidth.value = window.innerWidth;
    updatePageInfo();
  });
  
  // 添加滚动监听
  window.addEventListener("scroll", handleScroll, { passive: true });
  
  // 初始化页面信息
  updatePageInfo();

  // 在组件初始化时，将当前配置设置为默认预设
  presetConfigs.default = {
    nameKey: "tools.qrcode.styles.default_name",
    descKey: "tools.qrcode.styles.default_desc",
    dotType: info.dotType,
    cornerSquareType: info.cornerSquareType,
    cornerDotType: info.cornerDotType,
    colorMode: info.colorMode,
    gradientType: info.gradientType,
    gradientRotation: info.gradientRotation,
    gradientColor1: info.gradientColor1,
    gradientColor2: info.gradientColor2,
    bgColor: info.bgColor,
    cornerSquareColorMode: info.cornerSquareColorMode,
    cornerSquareColor: info.cornerSquareColor,
    cornerDotColorMode: info.cornerDotColorMode,
    cornerDotColor: info.cornerDotColor,
    // 添加单色模式的属性
    preColor: info.preColor,
  };
});

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// 上传达到上限触发
const handleExceed = () => {
  ElMessage({
    message: t('tools.qrcode.msg_upload_limit'),
    type: "warning",
  });
};

// 设置尺寸
const setQRSize = () => {
  info.width = qrSize.value;
  info.height = qrSize.value;
};

const handleChange = (file: UploadFile) => {
  // 清空之前的文件列表，只保留当前文件
  info.fileList = [file.url as string];
  info.fileUrl = file.url as string;
  // 上传logo后重新生成二维码
  info.qrKey += 1;
};

const handleRemove = () => {
  // 清空文件列表
  info.fileList = [];
  info.fileUrl = "";
  // 移除logo后重新生成二维码
  info.qrKey += 1;
};

// 监听尺寸变化，自动生成二维码
const handleSizeChange = () => {
  setQRSize();
  info.qrKey += 1;
};

// 监听内容变化，自动生成二维码
const handleContentChange = () => {
  info.qrKey += 1;
};

// 监听纠错级别变化，自动生成二维码
const handleErrorCorrectionChange = () => {
  info.qrKey += 1;
};

// 监听点样式变化，自动生成二维码
const handleDotTypeChange = () => {
  info.qrKey += 1;
};

// 监听颜色变化，自动生成二维码
const handleColorChange = () => {
  info.qrKey += 1;
};

// 监听颜色模式变化，自动生成二维码
const handleColorModeChange = () => {
  info.qrKey += 1;
};

// 监听渐变色变化，自动生成二维码
const handleGradientChange = () => {
  info.qrKey += 1;
};

// 监听角落方块颜色模式变化
const handleCornerSquareColorModeChange = () => {
  info.qrKey += 1;
};

// 监听角落方块渐变色变化
const handleCornerSquareGradientChange = () => {
  info.qrKey += 1;
};

// 监听角落点颜色模式变化
const handleCornerDotColorModeChange = () => {
  info.qrKey += 1;
};

// 监听角落点渐变色变化
const handleCornerDotGradientChange = () => {
  info.qrKey += 1;
};

// 清除内容
const clearContent = () => {
  info.content = "";
  info.fileList = [];
  info.fileUrl = "";
};

// 查看大图
const viewLargeQR = () => {
  if (!info.content) {
    ElMessage.warning(t('tools.qrcode.msg_generate_first'));
    return;
  }
  showQRDialog.value = true;
};

// 计算dotsOptions
const dotsOptions = computed(() => {
  if (info.colorMode === "single") {
    return {
      type: info.dotType,
      color: info.preColor,
    };
  } else {
    return {
      type: info.dotType,
      gradient: {
        type: info.gradientType,
        rotation: (info.gradientRotation * Math.PI) / 180, // 转换为弧度
        colorStops: [
          { offset: 0, color: info.gradientColor1 },
          { offset: 1, color: info.gradientColor2 },
        ],
      },
    };
  }
});

// 计算cornersSquareOptions
const cornersSquareOptions = computed(() => {
  if (info.cornerSquareColorMode === "single") {
    return {
      type: info.cornerSquareType,
      color: info.cornerSquareColor,
    };
  } else {
    return {
      type: info.cornerSquareType,
      gradient: {
        type: info.cornerSquareGradientType,
        rotation: (info.cornerSquareGradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: info.cornerSquareGradientColor1 },
          { offset: 1, color: info.cornerSquareGradientColor2 },
        ],
      },
    };
  }
});

// 计算cornersDotOptions
const cornersDotOptions = computed(() => {
  if (info.cornerDotColorMode === "single") {
    return {
      type: info.cornerDotType,
      color: info.cornerDotColor,
    };
  } else {
    return {
      type: info.cornerDotType,
      gradient: {
        type: info.cornerDotGradientType,
        rotation: (info.cornerDotGradientRotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: info.cornerDotGradientColor1 },
          { offset: 1, color: info.cornerDotGradientColor2 },
        ],
      },
    };
  }
});

// 下载二维码功能
const downloadQR = () => {
  if (!info.content) {
    ElMessage.warning(t('tools.qrcode.msg_generate_first'));
    return;
  }
  
  // 查找二维码图片元素
  const qrImage = document.querySelector('.qr-code-image') as HTMLImageElement;
  if (!qrImage) {
    ElMessage.error(t('tools.qrcode.msg_element_not_found'));
    return;
  }
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = qrSize.value;
    
    canvas.width = size;
    canvas.height = size;
    
    // 绘制背景
    ctx!.fillStyle = info.bgColor;
    ctx!.fillRect(0, 0, size, size);
    
    const img = new Image();
    
    img.onload = () => {
      ctx!.drawImage(img, 0, 0, size, size);
      
      // 下载图片
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${downloadFileName.value}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          ElMessage.success(t('tools.qrcode.msg_download_success'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      ElMessage.error(t('tools.qrcode.msg_image_generate_fail'));
    };
    
    // 直接使用二维码图片的src
    img.src = qrImage.src;
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error(t('tools.qrcode.msg_download_fail'));
  }
};
</script>

<template>
  <div class="flex flex-col mt-3 ml-4 flex-1 mr-3">
    <DetailHeader :title="$t('tools.qrcode.title')"></DetailHeader>

    <!-- 桌面端布局：左右分栏 -->
    <div
      class="hidden lg:flex flex-col lg:flex-row gap-6 w-full p-6 rounded-2xl bg-white shadow-sm"
    >
      <!-- 左侧控制面板 -->
      <div class="flex-1 space-y-4">
        <div class="space-y-4">
          <!-- 内容输入 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700"
              >{{ $t('tools.qrcode.label_content') }}</label
            >
            <el-input
              v-model="info.content"
              type="textarea"
              :rows="4"
              :placeholder="$t('tools.qrcode.placeholder')"
              class="w-full"
              @input="handleContentChange"
            />
          </div>

          <!-- 清除内容按钮 -->
          <div class="flex gap-3">
            <el-button @click="clearContent" class="flex-1">
              {{ $t('tools.qrcode.btn_clear') }}
            </el-button>
          </div>

          <!-- 尺寸设置 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_size') }}</label>
            <el-select
              v-model="info.size"
              class="w-full"
              @change="handleSizeChange"
            >
              <el-option :label="$t('tools.qrcode.size_small')" value="128" />
              <el-option :label="$t('tools.qrcode.size_normal')" value="200" />
              <el-option :label="$t('tools.qrcode.size_medium')" value="300" />
              <el-option :label="$t('tools.qrcode.size_large')" value="400" />
              <el-option :label="$t('tools.qrcode.size_xlarge')" value="500" />
            </el-select>
          </div>

          <!-- 纠错级别 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_error_level') }}</label>
            <el-select
              v-model="info.errorCorrectionLevel"
              class="w-full"
              @change="handleErrorCorrectionChange"
            >
              <el-option :label="$t('tools.qrcode.error_l')" value="L" />
              <el-option :label="$t('tools.qrcode.error_m')" value="M" />
              <el-option :label="$t('tools.qrcode.error_q')" value="Q" />
              <el-option :label="$t('tools.qrcode.error_h')" value="H" />
            </el-select>
          </div>

          <!-- Logo上传 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_logo') }}</label>
            <el-upload
              ref="uploadLogo"
              action="#"
              :auto-upload="false"
              :limit="1"
              list-type="picture-card"
              accept=".png,.ico,.jpg,.jpeg"
              :on-change="handleChange"
              :on-exceed="handleExceed"
              :on-remove="handleRemove"
              :file-list="
                info.fileList.length > 0
                  ? info.fileList.map((url) => ({ url, name: 'logo' }))
                  : []
              "
              :show-file-list="false"
              class="w-full"
            >
              <template v-if="info.fileList.length === 0">
                <el-icon><Plus /></el-icon>
              </template>
              <template v-else>
                <div class="relative w-full h-full">
                  <img
                    class="w-full h-full object-cover"
                    :src="info.fileList[0]"
                    alt=""
                  />
                  <span class="absolute top-1 right-1">
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click="handleRemove()"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </span>
                </div>
              </template>
            </el-upload>
          </div>

          <!-- 配置模式选择 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_style_config') }}</label>
            <el-tabs v-model="info.configMode" class="w-full">
              <el-tab-pane :label="$t('tools.qrcode.tab_preset')" name="preset">
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="(preset, key) in presetConfigs"
                      :key="key"
                      class="preset-card"
                      :class="{ 'preset-card-active': info.presetConfig === key }"
                      @click="applyPreset(key)"
                    >
                      <div class="preset-preview">
                        <QRCodeVue3
                          :value="'预览'"
                          :width="60"
                          :height="60"
                          :qrOptions="{
                            typeNumber: 0,
                            mode: 'Byte',
                            errorCorrectionLevel: 'H',
                          }"
                          :dotsOptions="{
                            type: preset.dotType,
                            color: preset.colorMode === 'single' ? preset.preColor : preset.gradientColor1,
                          }"
                          :background-options="{ color: preset.bgColor }"
                          :cornersSquareOptions="{
                            type: preset.cornerSquareType,
                            color: preset.cornerSquareColor,
                          }"
                          :cornersDotOptions="{
                            type: preset.cornerDotType,
                            color: preset.cornerDotColor,
                          }"
                        />
                      </div>
                      <div class="preset-info">
                        <h4 class="preset-name">{{ $t(preset.nameKey) }}</h4>
                        <p class="preset-desc">{{ $t(preset.descKey) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane :label="$t('tools.qrcode.tab_custom')" name="custom">
                <div class="space-y-4">
          <!-- 点样式设置 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_dot_style') }}</label>
            <el-select
              v-model="info.dotType"
              class="w-full"
              @change="handleDotTypeChange"
            >
              <el-option label="方形" value="square" />
              <el-option label="圆角" value="rounded" />
              <el-option label="圆点" value="dots" />
              <el-option label="经典" value="classy" />
              <el-option label="经典圆角" value="classy-rounded" />
              <el-option label="超圆角" value="extra-rounded" />
            </el-select>
          </div>

          <!-- 颜色设置 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_color_settings') }}</label>
            
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <!-- 颜色模式选择 -->
              <el-tabs v-model="info.colorMode" @tab-change="handleColorModeChange">
                <el-tab-pane :label="$t('tools.qrcode.tab_single')" name="single">
                  <div class="space-y-2">
                    <div class="flex gap-4">
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_fg') }}</label>
                        <el-color-picker
                          v-model="info.preColor"
                          @change="handleColorChange"
                        />
                      </div>
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_bg') }}</label>
                        <el-color-picker
                          v-model="info.bgColor"
                          @change="handleColorChange"
                        />
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
                
                <el-tab-pane :label="$t('tools.qrcode.tab_gradient')" name="gradient">
                  <div class="space-y-3">
                    <!-- 渐变类型 -->
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_gradient_type') }}</label>
                      <el-select
                        v-model="info.gradientType"
                        class="w-full"
                        @change="handleGradientChange"
                      >
                        <el-option label="线性渐变" value="linear" />
                        <el-option label="径向渐变" value="radial" />
                      </el-select>
                    </div>
                    
                    <!-- 渐变角度（线性渐变时显示） -->
                    <div v-if="info.gradientType === 'linear'">
                      <label class="text-xs text-gray-500 mb-1 block">
                        渐变角度: {{ info.gradientRotation }}°
                      </label>
                      <el-slider
                        v-model="info.gradientRotation"
                        :min="0"
                        :max="360"
                        :step="1"
                        @input="handleGradientChange"
                        show-input
                      />
                    </div>
                    
                    <!-- 渐变色选择 -->
                    <div class="flex gap-4">
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_start_color') }}</label>
                        <el-color-picker
                          v-model="info.gradientColor1"
                          @change="handleGradientChange"
                        />
                      </div>
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_end_color') }}</label>
                        <el-color-picker
                          v-model="info.gradientColor2"
                          @change="handleGradientChange"
                        />
                      </div>
                    </div>
                    
                    <!-- 背景色 -->
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_bg') }}</label>
                      <el-color-picker
                        v-model="info.bgColor"
                        @change="handleColorChange"
                      />
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <!-- 角落方块设置 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_corner_square') }}</label>
            
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <!-- 角落方块样式 -->
              <div class="mb-3">
                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_style') }}</label>
                <el-select
                  v-model="info.cornerSquareType"
                  class="w-full"
                  @change="handleDotTypeChange"
                >
                  <el-option :label="$t('tools.qrcode.dot_styles.square')" value="square" />
                  <el-option :label="$t('tools.qrcode.dot_styles.dot')" value="dot" />
                  <el-option :label="$t('tools.qrcode.dot_styles.extra_rounded')" value="extra-rounded" />
                </el-select>
              </div>
              
              <!-- 角落方块颜色设置 -->
              <el-tabs v-model="info.cornerSquareColorMode" @tab-change="handleCornerSquareColorModeChange">
                <el-tab-pane :label="$t('tools.qrcode.tab_single')" name="single">
                  <div class="space-y-2">
                    <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_color') }}</label>
                    <el-color-picker
                      v-model="info.cornerSquareColor"
                      @change="handleCornerSquareGradientChange"
                    />
                  </div>
                </el-tab-pane>
                
                <el-tab-pane :label="$t('tools.qrcode.tab_gradient')" name="gradient">
                  <div class="space-y-3">
                    <!-- 渐变类型 -->
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_gradient_type') }}</label>
                      <el-select
                        v-model="info.cornerSquareGradientType"
                        class="w-full"
                        @change="handleCornerSquareGradientChange"
                      >
                        <el-option label="线性渐变" value="linear" />
                        <el-option label="径向渐变" value="radial" />
                      </el-select>
                    </div>
                    
                    <!-- 渐变角度（线性渐变时显示） -->
                    <div v-if="info.cornerSquareGradientType === 'linear'">
                      <label class="text-xs text-gray-500 mb-1 block">
                        渐变角度: {{ info.cornerSquareGradientRotation }}°
                      </label>
                      <el-slider
                        v-model="info.cornerSquareGradientRotation"
                        :min="0"
                        :max="360"
                        :step="1"
                        @input="handleCornerSquareGradientChange"
                        show-input
                      />
                    </div>
                    
                    <!-- 渐变色选择 -->
                    <div class="flex gap-4">
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_start_color') }}</label>
                        <el-color-picker
                          v-model="info.cornerSquareGradientColor1"
                          @change="handleCornerSquareGradientChange"
                        />
                      </div>
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_end_color') }}</label>
                        <el-color-picker
                          v-model="info.cornerSquareGradientColor2"
                          @change="handleCornerSquareGradientChange"
                        />
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <!-- 角落点设置 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_corner_dot') }}</label>
            
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <!-- 角落点样式 -->
              <div class="mb-3">
                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_style') }}</label>
                <el-select
                  v-model="info.cornerDotType"
                  class="w-full"
                  @change="handleDotTypeChange"
                >
                  <el-option label="圆点" value="dot" />
                  <el-option label="方形" value="square" />
                </el-select>
              </div>
              
              <!-- 角落点颜色设置 -->
              <el-tabs v-model="info.cornerDotColorMode" @tab-change="handleCornerDotColorModeChange">
                <el-tab-pane :label="$t('tools.qrcode.tab_single')" name="single">
                  <div class="space-y-2">
                    <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_color') }}</label>
                    <el-color-picker
                      v-model="info.cornerDotColor"
                      @change="handleCornerDotGradientChange"
                    />
                  </div>
                </el-tab-pane>
                
                <el-tab-pane :label="$t('tools.qrcode.tab_gradient')" name="gradient">
                  <div class="space-y-3">
                    <!-- 渐变类型 -->
                    <div>
                      <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_gradient_type') }}</label>
                      <el-select
                        v-model="info.cornerDotGradientType"
                        class="w-full"
                        @change="handleCornerDotGradientChange"
                      >
                        <el-option label="线性渐变" value="linear" />
                        <el-option label="径向渐变" value="radial" />
                      </el-select>
                    </div>
                    
                    <!-- 渐变角度（线性渐变时显示） -->
                    <div v-if="info.cornerDotGradientType === 'linear'">
                      <label class="text-xs text-gray-500 mb-1 block">
                        渐变角度: {{ info.cornerDotGradientRotation }}°
                      </label>
                      <el-slider
                        v-model="info.cornerDotGradientRotation"
                        :min="0"
                        :max="360"
                        :step="1"
                        @input="handleCornerDotGradientChange"
                        show-input
                      />
                    </div>
                    
                    <!-- 渐变色选择 -->
                    <div class="flex gap-4">
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_start_color') }}</label>
                        <el-color-picker
                          v-model="info.cornerDotGradientColor1"
                          @change="handleCornerDotGradientChange"
                        />
                      </div>
                      <div class="flex-1">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_end_color') }}</label>
                        <el-color-picker
                          v-model="info.cornerDotGradientColor2"
                          @change="handleCornerDotGradientChange"
                        />
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
            </div>
      </div>

      <!-- 右侧预览区域 -->
      <div 
        class="preview-container" 
        :style="{ marginTop: dynamicMarginTop + 'px' }"
      >
        <div class="flex flex-col items-center space-y-4 lg:w-80">
          <template v-if="info.content && info.content.trim()">
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('tools.qrcode.preview_title') }}</h3>
              <p class="text-sm text-gray-500">{{ $t('tools.qrcode.preview_desc') }}</p>
            </div>
            <div class="qr-code bg-white p-4 rounded-lg border border-gray-200">
              <div class="qr-code-wrapper" @click="viewLargeQR">
                <QRCodeVue3
                  :key="info.qrKey"
                  :value="info.content || '预览'"
                  :width="qrSize"
                  :height="qrSize"
                  :qrOptions="{
                    typeNumber: 0,
                    mode: 'Byte',
                    errorCorrectionLevel: info.errorCorrectionLevel,
                  }"
                  :imageOptions="{
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 0,
                  }"
                  :dotsOptions="dotsOptions"
                  :image="info.fileList[0] || undefined"
                  :background-options="{ color: info.bgColor }"
                  :cornersSquareOptions="cornersSquareOptions"
                  :cornersDotOptions="cornersDotOptions"
                  myclass="qr-code-container"
                  imgclass="qr-code-image"
                />
              </div>
              
              <!-- 下载按钮 -->
              <button
                v-if="info.content"
                class="qr-download-btn"
                @click="downloadQR"
              >
                {{ $t('tools.qrcode.btn_download') }}
              </button>
            </div>
          </template>
          <template v-else>
            <!-- 占位内容 -->
            <div class="flex flex-col items-center justify-center h-64 w-full opacity-60">
              <el-icon size="48"><svg viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.2 0-372-166.8-372-372S306.8 140 512 140s372 166.8 372 372-166.8 372-372 372zm0-624c-139.2 0-252 112.8-252 252s112.8 252 252 252 252-112.8 252-252S651.2 260 512 260zm0 432c-99.2 0-180-80.8-180-180s80.8-180 180-180 180 80.8 180 180-80.8 180-180 180z" fill="#d3d3d3"/></svg></el-icon>
              <span class="text-gray-400 mt-4">请输入内容以生成二维码</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 移动端布局：预览区在前，控制面板在后 -->
    <div class="lg:hidden">
      <!-- 移动端预览区 -->
      <div class="w-full p-6 rounded-2xl bg-white shadow-sm mb-6">
        <div class="flex flex-col items-center space-y-4">
          <template v-if="info.content && info.content.trim()">
            <div class="text-center">
              <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('tools.qrcode.preview_title') }}</h3>
              <p class="text-sm text-gray-500">{{ $t('tools.qrcode.preview_desc') }}</p>
            </div>

            <div class="qr-code bg-white p-4 rounded-lg border border-gray-200">
              <div class="qr-code-wrapper" @click="viewLargeQR">
                <QRCodeVue3
                  :key="info.qrKey"
                  :value="info.content || '预览'"
                  :width="qrSize"
                  :height="qrSize"
                  :qrOptions="{
                    typeNumber: 0,
                    mode: 'Byte',
                    errorCorrectionLevel: info.errorCorrectionLevel,
                  }"
                  :imageOptions="{
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 0,
                  }"
                  :dotsOptions="dotsOptions"
                  :image="info.fileList[0] || undefined"
                  :background-options="{ color: info.bgColor }"
                  :cornersSquareOptions="cornersSquareOptions"
                  :cornersDotOptions="cornersDotOptions"
                  myclass="qr-code-container"
                  imgclass="qr-code-image"
                />
              </div>
              
              <!-- 下载按钮 -->
              <button
                v-if="info.content"
                class="qr-download-btn"
                @click="downloadQR"
              >
                {{ $t('tools.qrcode.btn_download') }}
              </button>
            </div>
          </template>
          <template v-else>
            <!-- 占位内容 -->
            <div class="flex flex-col items-center justify-center h-64 w-full opacity-60">
              <el-icon size="48"><svg viewBox="0 0 1024 1024"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.2 0-372-166.8-372-372S306.8 140 512 140s372 166.8 372 372-166.8 372-372 372zm0-624c-139.2 0-252 112.8-252 252s112.8 252 252 252 252-112.8 252-252S651.2 260 512 260zm0 432c-99.2 0-180-80.8-180-180s80.8-180 180-180 180 80.8 180 180-80.8 180-180 180z" fill="#d3d3d3"/></svg></el-icon>
              <span class="text-gray-400 mt-4">请输入内容以生成二维码</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 移动端控制面板 -->
      <div class="w-full p-6 rounded-2xl bg-white shadow-sm">
        <div class="space-y-4">
          <!-- 内容输入 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700"
              >{{ $t('tools.qrcode.label_content') }}</label
            >
            <el-input
              v-model="info.content"
              type="textarea"
              :rows="4"
              :placeholder="$t('tools.qrcode.placeholder')"
              class="w-full"
              @input="handleContentChange"
            />
          </div>

          <!-- 清除内容按钮 -->
          <div class="flex gap-3">
            <el-button @click="clearContent" class="flex-1">
              {{ $t('tools.qrcode.btn_clear') }}
            </el-button>
          </div>

          <!-- 尺寸设置 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_size') }}</label>
            <el-select
              v-model="info.size"
              class="w-full"
              @change="handleSizeChange"
            >
              <el-option :label="$t('tools.qrcode.size_small')" value="128" />
              <el-option :label="$t('tools.qrcode.size_normal')" value="200" />
              <el-option :label="$t('tools.qrcode.size_medium')" value="300" />
              <el-option :label="$t('tools.qrcode.size_large')" value="400" />
              <el-option :label="$t('tools.qrcode.size_xlarge')" value="500" />
            </el-select>
          </div>

          <!-- 纠错级别 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_error_level') }}</label>
            <el-select
              v-model="info.errorCorrectionLevel"
              class="w-full"
              @change="handleErrorCorrectionChange"
            >
              <el-option :label="$t('tools.qrcode.error_l')" value="L" />
              <el-option :label="$t('tools.qrcode.error_m')" value="M" />
              <el-option :label="$t('tools.qrcode.error_q')" value="Q" />
              <el-option :label="$t('tools.qrcode.error_h')" value="H" />
            </el-select>
          </div>

          <!-- Logo上传 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_logo') }}</label>
            <el-upload
              action="#"
              :auto-upload="false"
              :limit="1"
              list-type="picture-card"
              accept=".png,.ico,.jpg,.jpeg"
              :on-change="handleChange"
              :on-exceed="handleExceed"
              :on-remove="handleRemove"
              :file-list="
                info.fileList.length > 0
                  ? info.fileList.map((url) => ({ url, name: 'logo' }))
                  : []
              "
              :show-file-list="false"
              class="w-full"
            >
              <template v-if="info.fileList.length === 0">
                <el-icon><Plus /></el-icon>
              </template>
              <template v-else>
                <div class="relative w-full h-full">
                  <img
                    class="w-full h-full object-cover"
                    :src="info.fileList[0]"
                    alt=""
                  />
                  <span class="absolute top-1 right-1">
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click="handleRemove()"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </span>
                </div>
              </template>
            </el-upload>
          </div>

          <!-- 配置模式选择 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_style_config') }}</label>
            <el-tabs v-model="info.configMode" class="w-full">
              <el-tab-pane :label="$t('tools.qrcode.tab_preset')" name="preset">
                <div class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      v-for="(preset, key) in presetConfigs"
                      :key="key"
                      class="preset-card"
                      :class="{ 'preset-card-active': info.presetConfig === key }"
                      @click="applyPreset(key)"
                    >
                      <div class="preset-preview">
                        <QRCodeVue3
                          :value="'预览'"
                          :width="60"
                          :height="60"
                          :qrOptions="{
                            typeNumber: 0,
                            mode: 'Byte',
                            errorCorrectionLevel: 'H',
                          }"
                          :dotsOptions="{
                            type: preset.dotType,
                            color: preset.colorMode === 'single' ? preset.preColor : preset.gradientColor1,
                          }"
                          :background-options="{ color: preset.bgColor }"
                          :cornersSquareOptions="{
                            type: preset.cornerSquareType,
                            color: preset.cornerSquareColor,
                          }"
                          :cornersDotOptions="{
                            type: preset.cornerDotType,
                            color: preset.cornerDotColor,
                          }"
                        />
          </div>
                      <div class="preset-info">
                        <h4 class="preset-name">{{ $t(preset.nameKey) }}</h4>
                        <p class="preset-desc">{{ $t(preset.descKey) }}</p>
        </div>
      </div>
                  </div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="自定义配置" name="custom">
                <div class="space-y-4">
                  <!-- 点样式设置 -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_dot_style') }}</label>
                    <el-select
                      v-model="info.dotType"
                      class="w-full"
                      @change="handleDotTypeChange"
                    >
                      <el-option :label="$t('tools.qrcode.dot_styles.square')" value="square" />
                          <el-option :label="$t('tools.qrcode.dot_styles.rounded')" value="rounded" />
                          <el-option :label="$t('tools.qrcode.dot_styles.dots')" value="dots" />
                          <el-option :label="$t('tools.qrcode.dot_styles.classy')" value="classy" />
                          <el-option :label="$t('tools.qrcode.dot_styles.classy_rounded')" value="classy-rounded" />
                          <el-option :label="$t('tools.qrcode.dot_styles.extra_rounded')" value="extra-rounded" />
                    </el-select>
          </div>

                  <!-- 颜色设置 -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_color_settings') }}</label>
                    
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <!-- 颜色模式选择 -->
                      <el-tabs v-model="info.colorMode" @tab-change="handleColorModeChange">
                        <el-tab-pane :label="$t('tools.qrcode.tab_single')" name="single">
                          <div class="space-y-2">
                            <div class="flex gap-4">
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_fg') }}</label>
                                <el-color-picker
                                  v-model="info.preColor"
                                  @change="handleColorChange"
                                />
                              </div>
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_bg') }}</label>
                                <el-color-picker
                                  v-model="info.bgColor"
                                  @change="handleColorChange"
                                />
                              </div>
                            </div>
                          </div>
                        </el-tab-pane>
                        
                        <el-tab-pane :label="$t('tools.qrcode.tab_gradient')" name="gradient">
                          <div class="space-y-3">
                            <!-- 渐变类型 -->
                            <div>
                              <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_gradient_type') }}</label>
                              <el-select
                                v-model="info.gradientType"
                                class="w-full"
                                @change="handleGradientChange"
                              >
                                <el-option :label="$t('tools.qrcode.gradient_linear')" value="linear" />
                                <el-option :label="$t('tools.qrcode.gradient_radial')" value="radial" />
                              </el-select>
                            </div>
                            
                            <!-- 渐变角度（线性渐变时显示） -->
                            <div v-if="info.gradientType === 'linear'">
                              <label class="text-xs text-gray-500 mb-1 block">
                                {{ $t('tools.qrcode.label_gradient_angle') }}: {{ info.gradientRotation }}°
                              </label>
                              <el-slider
                                v-model="info.gradientRotation"
                                :min="0"
                                :max="360"
                                :step="1"
                                @input="handleGradientChange"
                                show-input
                              />
                            </div>
                            
                            <!-- 渐变色选择 -->
                            <div class="flex gap-4">
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_start_color') }}</label>
                                <el-color-picker
                                  v-model="info.gradientColor1"
                                  @change="handleGradientChange"
                                />
                              </div>
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_end_color') }}</label>
                                <el-color-picker
                                  v-model="info.gradientColor2"
                                  @change="handleGradientChange"
                                />
                              </div>
                            </div>
                            
                            <!-- 背景色 -->
                            <div>
                              <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_bg') }}</label>
                              <el-color-picker
                                v-model="info.bgColor"
                                @change="handleColorChange"
                              />
                            </div>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                  </div>

                  <!-- 角落方块设置 -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">{{ $t('tools.qrcode.label_corner_square') }}</label>
                    
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <!-- 角落方块样式 -->
                      <div class="mb-3">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_style') }}</label>
                        <el-select
                          v-model="info.cornerSquareType"
                          class="w-full"
                          @change="handleDotTypeChange"
                        >
                          <el-option :label="$t('tools.qrcode.dot_styles.square')" value="square" />
                          <el-option :label="$t('tools.qrcode.dot_styles.dot')" value="dot" />
                          <el-option :label="$t('tools.qrcode.dot_styles.extra_rounded')" value="extra-rounded" />
                        </el-select>
                      </div>
                      
                      <!-- 角落方块颜色设置 -->
                      <el-tabs v-model="info.cornerSquareColorMode" @tab-change="handleCornerSquareColorModeChange">
                        <el-tab-pane :label="$t('tools.qrcode.tab_single')" name="single">
                          <div class="space-y-2">
                            <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_color') }}</label>
                            <el-color-picker
                              v-model="info.cornerSquareColor"
                              @change="handleCornerSquareGradientChange"
                            />
                          </div>
                        </el-tab-pane>
                        
                        <el-tab-pane :label="$t('tools.qrcode.tab_gradient')" name="gradient">
                          <div class="space-y-3">
                            <!-- 渐变类型 -->
                            <div>
                              <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_gradient_type') }}</label>
                              <el-select
                                v-model="info.cornerSquareGradientType"
                                class="w-full"
                                @change="handleCornerSquareGradientChange"
                              >
                                <el-option :label="$t('tools.qrcode.gradient_linear')" value="linear" />
                                <el-option :label="$t('tools.qrcode.gradient_radial')" value="radial" />
                              </el-select>
                            </div>
                            
                            <!-- 渐变角度（线性渐变时显示） -->
                            <div v-if="info.cornerSquareGradientType === 'linear'">
                              <label class="text-xs text-gray-500 mb-1 block">
                                {{ $t('tools.qrcode.label_gradient_angle') }}: {{ info.cornerSquareGradientRotation }}°
                              </label>
                              <el-slider
                                v-model="info.cornerSquareGradientRotation"
                                :min="0"
                                :max="360"
                                :step="1"
                                @input="handleCornerSquareGradientChange"
                                show-input
                              />
                            </div>
                            
                            <!-- 渐变色选择 -->
                            <div class="flex gap-4">
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_start_color') }}</label>
                                <el-color-picker
                                  v-model="info.cornerSquareGradientColor1"
                                  @change="handleCornerSquareGradientChange"
                                />
                              </div>
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_end_color') }}</label>
                                <el-color-picker
                                  v-model="info.cornerSquareGradientColor2"
                                  @change="handleCornerSquareGradientChange"
                                />
                              </div>
                            </div>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                  </div>

                  <!-- 角落点设置 -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">角落点</label>
                    
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <!-- 角落点样式 -->
                      <div class="mb-3">
                        <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_style') }}</label>
                        <el-select
                          v-model="info.cornerDotType"
                          class="w-full"
                          @change="handleDotTypeChange"
                        >
                          <el-option :label="$t('tools.qrcode.dot_styles.dot')" value="dot" />
                          <el-option :label="$t('tools.qrcode.dot_styles.square')" value="square" />
                        </el-select>
                      </div>
                      
                      <!-- 角落点颜色设置 -->
                      <el-tabs v-model="info.cornerDotColorMode" @tab-change="handleCornerDotColorModeChange">
                        <el-tab-pane :label="$t('tools.qrcode.tab_single')" name="single">
                          <div class="space-y-2">
                            <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_color') }}</label>
                            <el-color-picker
                              v-model="info.cornerDotColor"
                              @change="handleCornerDotGradientChange"
                            />
                          </div>
                        </el-tab-pane>
                        
                        <el-tab-pane :label="$t('tools.qrcode.tab_gradient')" name="gradient">
                          <div class="space-y-3">
                            <!-- 渐变类型 -->
                            <div>
                              <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_gradient_type') }}</label>
                              <el-select
                                v-model="info.cornerDotGradientType"
                                class="w-full"
                                @change="handleCornerDotGradientChange"
                              >
                                <el-option :label="$t('tools.qrcode.gradient_linear')" value="linear" />
                                <el-option :label="$t('tools.qrcode.gradient_radial')" value="radial" />
                              </el-select>
                            </div>
                            
                            <!-- 渐变角度（线性渐变时显示） -->
                            <div v-if="info.cornerDotGradientType === 'linear'">
                              <label class="text-xs text-gray-500 mb-1 block">
                                {{ $t('tools.qrcode.label_gradient_angle') }}: {{ info.cornerDotGradientRotation }}°
                              </label>
                              <el-slider
                                v-model="info.cornerDotGradientRotation"
                                :min="0"
                                :max="360"
                                :step="1"
                                @input="handleCornerDotGradientChange"
                                show-input
                              />
                            </div>
                            
                            <!-- 渐变色选择 -->
                            <div class="flex gap-4">
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_start_color') }}</label>
                                <el-color-picker
                                  v-model="info.cornerDotGradientColor1"
                                  @change="handleCornerDotGradientChange"
                                />
                              </div>
                              <div class="flex-1">
                                <label class="text-xs text-gray-500 mb-1 block">{{ $t('tools.qrcode.label_end_color') }}</label>
                                <el-color-picker
                                  v-model="info.cornerDotGradientColor2"
                                  @change="handleCornerDotGradientChange"
                                />
                              </div>
                            </div>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <!-- 大图弹窗 -->
    <el-dialog
      v-model="showQRDialog"
      :title="$t('tools.qrcode.preview_title')"
      width="auto"
      :close-on-click-modal="true"
      :show-close="true"
      center
    >
      <div class="flex flex-col items-center">
              <QRCodeVue3
          :key="info.qrKey + '-large'"
                :value="info.content"
          :width="largeQRSize"
          :height="largeQRSize"
                :qrOptions="{
                  typeNumber: 0,
                  mode: 'Byte',
                  errorCorrectionLevel: info.errorCorrectionLevel,
                }"
                :imageOptions="{
                  hideBackgroundDots: true,
                  imageSize: 0.4,
                  margin: 0,
                }"
                :dotsOptions="dotsOptions"
                :image="info.fileList[0] || undefined"
                :background-options="{ color: info.bgColor }"
                :cornersSquareOptions="cornersSquareOptions"
                :cornersDotOptions="cornersDotOptions"
          myclass="qr-code-container-large"
          imgclass="qr-code-image-large"
              />
            </div>
    </el-dialog>

    <!-- 页面底部 ToolDetail，始终显示 -->
    <ToolDetail :title="$t('tools.qrcode.detail.title')">
      <div class="text-gray-600 leading-7">
        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.qrcode.detail.intro_title') }}</h3>
        <p class="mb-4">
          {{ $t('tools.qrcode.detail.intro_content') }}
        </p>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.qrcode.detail.level_title') }}</h3>
        <p class="mb-2">{{ $t('tools.qrcode.detail.level_intro') }}</p>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li><strong>{{ $t('tools.qrcode.detail.level_l') }}</strong></li>
          <li><strong>{{ $t('tools.qrcode.detail.level_m') }}</strong></li>
          <li><strong>{{ $t('tools.qrcode.detail.level_q') }}</strong></li>
          <li><strong>{{ $t('tools.qrcode.detail.level_h') }}</strong></li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.qrcode.detail.best_title') }}</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li><strong>{{ $t('tools.qrcode.detail.best_contrast') }}</strong></li>
          <li><strong>{{ $t('tools.qrcode.detail.best_quiet') }}</strong></li>
          <li><strong>{{ $t('tools.qrcode.detail.best_size') }}</strong></li>
        </ul>

        <h3 class="text-lg font-bold text-gray-800 mb-2">{{ $t('tools.qrcode.detail.faq') }}</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.qrcode.detail.q1') }}</h4>
            <p>{{ $t('tools.qrcode.detail.a1') }}</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900">{{ $t('tools.qrcode.detail.q2') }}</h4>
            <p>{{ $t('tools.qrcode.detail.a2') }}</p>
          </div>
        </div>
      </div>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 预设卡片样式 */
.preset-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  background: #fafbfc;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.preset-card-active {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
  background: #f0f7ff;
}
.preset-preview {
  flex-shrink: 0;
}
.preset-info {
  flex: 1;
}
.preset-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}
.preset-desc {
  font-size: 12px;
  color: #888;
}

/* 预览容器 */
  .preview-container {
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    padding: 16px;
  align-self: flex-start;
  margin-left: auto;
  transition: margin-top 0.1s ease;
}

@media (max-width: 1024px) {
  .preview-container {
    width: 100%;
    margin-left: 0;
    /* 移动端不设置 margin-top，使用固定位置 */
  }
}

/* 确保所有输入框和选择器都有正确的宽度限制 */
:deep(.el-input),
:deep(.el-select),
:deep(.el-input-number) {
  width: 100% !important;
  max-width: 100% !important;
}

:deep(.el-textarea__inner) {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* 确保颜色选择器不会超出容器 */
:deep(.el-color-picker) {
  width: 100% !important;
  max-width: 100% !important;
}

.color-picker-limit {
  max-width: 120px;
  width: 100%;
}

.qr-code {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 二维码包装器，添加点击效果 */
.qr-code-wrapper {
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.qr-code-wrapper:hover {
  transform: scale(1.05);
}

.qr-code-wrapper:active {
  transform: scale(1.02);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .qr-code {
    max-width: 300px;
    margin: 0 auto;
  }
}

/* 上传组件样式优化 */
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  transition: border-color 0.3s;
}

:deep(.el-upload--picture-card:hover) {
  border-color: #409eff;
}

/* 二维码组件样式 */
:deep(.qr-code canvas) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 自定义下载按钮样式 */
:deep(.qr-download-btn) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  margin-top: 12px;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.qr-download-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

:deep(.qr-download-btn:active) {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

/* 修改下载按钮文本为"下载二维码" */


/* :deep(.qr-download-btn::before) {
  content: "下载二维码";
  font-size: 14px;
  display: inline-block;
} */

/* 二维码容器样式 */
:deep(.qr-code-container) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 二维码图片样式 */
:deep(.qr-code-image) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

:deep(.qr-code-image:hover) {
  transform: scale(1.02);
}

/* 大图对话框中的二维码样式 */
:deep(.qr-code-container-large) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

:deep(.qr-code-image-large) {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

:deep(.qr-download-btn-large) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  margin-top: 16px;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.qr-download-btn-large:hover) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

:deep(.qr-download-btn-large:active) {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}



/* :deep(.qr-download-btn-large::before) {
  content: "下载二维码";
  font-size: 16px;
  display: inline-block;
} */

/* 让el-slider的输入框变窄，滑块更宽 */
:deep(.el-slider__input) {
  width: 120px !important;
  min-width: 0 !important;
  margin-left: 28px !important;
}

:deep(.el-slider__runway) {
  margin-left: 20px;
}

/* H5端滑动条布局优化 */
@media (max-width: 1024px) {
  /* 让滑动条和输入框分两行显示 */
  :deep(.el-slider) {
    width: 100% !important;
    margin-bottom: 8px;
  }
  
  /* 隐藏H5端的输入框，只保留滑动条 */
  :deep(.el-slider .el-slider__input) {
    display: none !important;
  }
  
  /* 或者如果你想保留输入框，可以这样布局 */
  /*
  :deep(.el-slider) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  :deep(.el-slider .el-slider__runway) {
    order: 1;
  }
  
  :deep(.el-slider .el-slider__input) {
    order: 2;
    width: 100% !important;
  }
  */
}

/* 桌面端保持原有布局 */
@media (min-width: 1025px) {
  :deep(.el-slider) {
    width: 100%;
  }
  
  :deep(.el-slider .el-slider__input) {
    width: 80px;
  }
}

</style>