<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed, watch } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'


const info = reactive({
  title: "tools.numbermemory.title",
})

// 游戏状态
const gameState = reactive({
  isPlaying: false,
  isShowingNumbers: false,
  isWaitingClick: false,
  gameOver: false,
  score: 0,
  highScore: 0,
  level: 1,
  currentClickIndex: 0,
  showTime: 4000, // 初始显示时间（毫秒）
  remainingTime: 0, // 剩余显示时间（毫秒）
})

// 检测是否为移动端
const isMobile = ref(false)

// 显示坐标开关
const showCoordinates = ref(false)

// 网格大小选项（PC端可选择）
const gridSizeOptions = [
  { label: '4×4', value: 4, maxNumbers: 16 },
  { label: '5×5', value: 5, maxNumbers: 25 },
  { label: '6×6', value: 6, maxNumbers: 36 },
  { label: '7×7', value: 7, maxNumbers: 49 },
  { label: '8×8', value: 8, maxNumbers: 64 },
  { label: '9×9', value: 9, maxNumbers: 81 },
  { label: '10×10', value: 10, maxNumbers: 100 },
]

// 当前选择的网格大小
const selectedGridSize = ref(4)

// 数字位置数据
const numbers = ref<Array<{
  id: number
  value: number
  row: number
  col: number
  isVisible: boolean
  isClicked: boolean
  isCorrect: boolean
}>>([])

// 当前网格大小
const currentGridSize = computed(() => {
  return isMobile.value ? 4 : selectedGridSize.value
})

// 当前网格的最大数字数量
const maxNumbersForCurrentGrid = computed(() => {
  return currentGridSize.value * currentGridSize.value
})

// 当前关卡的数字数量
const currentNumberCount = computed(() => {
  const maxNumbers = maxNumbersForCurrentGrid.value
  
  // 从4个数字开始，每3关增加一个数字
  const baseNumbers = 4
  const additionalNumbers = Math.floor((gameState.level - 1) / 3)
  const calculatedNumbers = baseNumbers + additionalNumbers
  
  // 如果计算出的数字数量小于最大数量，使用计算值；否则使用最大数量
  if (calculatedNumbers <= maxNumbers) {
    return calculatedNumbers
  } else {
    // 达到最大数字数后，始终使用最大数字数（无限模式）
    return maxNumbers
  }
})

// 动态计算显示时间
const calculateShowTime = () => {
  const numberCount = currentNumberCount.value
  const gridSize = currentGridSize.value
  
  // 基础时间：每个数字需要的时间
  const baseTimePerNumber = 800 // 每个数字800毫秒
  
  // 网格复杂度系数：网格越大，需要更多时间
  const gridComplexityFactor = gridSize / 4 // 4x4为基准
  
  // 关卡难度系数：关卡越高，时间稍微增加
  const levelFactor = 1 + (gameState.level - 1) * 0.05 // 每关增加5%
  
  // 计算总时间
  const totalTime = numberCount * baseTimePerNumber * gridComplexityFactor * levelFactor
  
  // 设置最小和最大时间限制
  const minTime = 2000 // 最少2秒
  const maxTime = 20000 // 最多20秒（增加上限以支持大网格）
  
  return Math.max(minTime, Math.min(maxTime, Math.round(totalTime)))
}

// 当前剩余时间（秒）
const remainingSeconds = computed(() => {
  return Math.ceil(gameState.remainingTime / 1000)
})

// 监听分数变化，实时更新最高分
watch(() => gameState.score, (newScore) => {
  if (newScore > gameState.highScore) {
    gameState.highScore = newScore
    // 实时保存到localStorage
    localStorage.setItem('numberMemoryHighScore', gameState.highScore.toString())
  }
})

// 检测设备类型
const detectDevice = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    selectedGridSize.value = 4 // 移动端固定4x4
  }
}

let gameTimer: number | null = null
let countdownTimer: number | null = null

// 生成随机位置
const generateRandomPositions = (count: number, gridSize: number) => {
  const positions: Array<{row: number, col: number}> = []
  const used = new Set<string>()
  
  while (positions.length < count) {
    const row = Math.floor(Math.random() * gridSize)
    const col = Math.floor(Math.random() * gridSize)
    const key = `${row}-${col}`
    
    if (!used.has(key)) {
      used.add(key)
      positions.push({ row, col })
    }
  }
  
  return positions
}

// 初始化关卡
const initLevel = () => {
  const count = currentNumberCount.value
  const gridSize = currentGridSize.value
  const positions = generateRandomPositions(count, gridSize)
  
  numbers.value = positions.map((pos, index) => ({
    id: index,
    value: index + 1,
    row: pos.row,
    col: pos.col,
    isVisible: true,
    isClicked: false,
    isCorrect: false,
  }))
  
  gameState.currentClickIndex = 0
  gameState.isShowingNumbers = true
  gameState.isWaitingClick = false
}

// 开始倒计时
const startCountdown = (totalTime: number) => {
  gameState.remainingTime = totalTime
  
  countdownTimer = setInterval(() => {
    gameState.remainingTime -= 100
    
    if (gameState.remainingTime <= 0) {
      gameState.remainingTime = 0
      hideNumbers()
    }
  }, 100) // 每100毫秒更新一次
}

// 开始游戏
const startGame = () => {
  gameState.isPlaying = true
  gameState.gameOver = false
  gameState.score = 0
  gameState.level = 1
  
  initLevel()
  
  // 计算显示时间并开始倒计时
  const showTime = calculateShowTime()
  startCountdown(showTime)
}

// 隐藏数字
const hideNumbers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  
  numbers.value.forEach(num => {
    num.isVisible = false
  })
  gameState.isShowingNumbers = false
  gameState.isWaitingClick = true
  gameState.remainingTime = 0
}

// 点击格子
const clickCell = (row: number, col: number) => {
  if (!gameState.isWaitingClick) return
  
  // 查找这个位置是否有数字
  const number = numbers.value.find(num => num.row === row && num.col === col)
  
  if (!number) {
    // 点击了空白位置，游戏结束
    gameOver()
    return
  }
  
  if (number.isClicked) {
    // 已经点击过了
    return
  }
  
  // 检查是否按正确顺序点击
  if (number.value === gameState.currentClickIndex + 1) {
    // 正确点击
    number.isClicked = true
    number.isCorrect = true
    number.isVisible = true // 显示数字
    gameState.currentClickIndex++
    gameState.score += 10
    // 最高分会通过watch自动更新
    
    // 检查是否完成当前关卡
    if (gameState.currentClickIndex >= numbers.value.length) {
      // 关卡完成
      setTimeout(() => {
        nextLevel()
      }, 500)
    }
  } else {
    // 错误点击，游戏结束
    number.isClicked = true
    number.isVisible = true
    gameOver()
  }
}

// 立即开始游戏（跳过等待时间）
const skipWaitingTime = () => {
  if (gameState.isShowingNumbers && countdownTimer) {
    hideNumbers()
  }
}

// 下一关
const nextLevel = () => {
  gameState.level++
  gameState.score += gameState.level * 10 // 关卡奖励增加
  // 最高分会通过watch自动更新
  
  // 移除游戏结束条件，让游戏可以无限进行
  initLevel()
  
  // 计算新的显示时间并开始倒计时
  const showTime = calculateShowTime()
  startCountdown(showTime)
}

// 游戏结束
const gameOver = () => {
  gameState.isPlaying = false
  gameState.gameOver = true
  gameState.isWaitingClick = false
  
  if (gameTimer) {
    clearTimeout(gameTimer)
    gameTimer = null
  }
  
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  
  // 显示所有数字
  numbers.value.forEach(num => {
    num.isVisible = true
    if (!num.isCorrect) {
      num.isClicked = true
    }
  })
  
  // 移除这里的最高分更新逻辑，因为已经通过watch实时更新了
}

// 重新开始
const restartGame = () => {
  if (gameTimer) {
    clearTimeout(gameTimer)
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  startGame()
}

// 重置游戏
const resetGame = () => {
  if (gameTimer) {
    clearTimeout(gameTimer)
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  gameState.isPlaying = false
  gameState.gameOver = false
  gameState.isShowingNumbers = false
  gameState.isWaitingClick = false
  gameState.score = 0
  gameState.level = 1
  gameState.currentClickIndex = 0
  gameState.remainingTime = 0
  numbers.value = []
}

// 获取格子内容
const getCellContent = (row: number, col: number) => {
  const number = numbers.value.find(num => num.row === row && num.col === col)
  return number
}

// 获取格子样式
const getCellClass = (row: number, col: number) => {
  const number = getCellContent(row, col)
  if (!number) {
    return 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
  }
  
  if (number.isCorrect) {
    return 'bg-green-400 text-white cursor-default'
  } else if (number.isClicked) {
    return 'bg-red-400 text-white cursor-default'
  } else if (number.isVisible) {
    return 'bg-blue-400 text-white cursor-pointer'
  } else {
    return 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
  }
}

// 生命周期
onMounted(() => {
  // 检测设备类型
  detectDevice()
  
  // 监听窗口大小变化
  window.addEventListener('resize', detectDevice)
  
  // 从localStorage加载最高分
  const savedHighScore = localStorage.getItem('numberMemoryHighScore')
  if (savedHighScore) {
    gameState.highScore = parseInt(savedHighScore)
  }
})

onUnmounted(() => {
  if (gameTimer) {
    clearTimeout(gameTimer)
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  // 移除事件监听器
  window.removeEventListener('resize', detectDevice)
  // 最高分已经通过watch实时保存，这里不需要再保存
})
</script>

<template>
  <div class="flex flex-col mt-3 ml-4 flex-1 mr-3">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-6 rounded-2xl bg-white shadow-sm border border-gray-200">
      <div class="max-w-4xl mx-auto">
        <!-- 游戏信息 -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div class="text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h3 class="text-sm font-medium text-blue-900">{{ $t('tools.numbermemory.score') }}</h3>
            <p class="text-xl font-bold text-blue-600">{{ gameState.score }}</p>
          </div>
          <div class="text-center bg-green-50 p-3 rounded-lg border border-green-200">
            <h3 class="text-sm font-medium text-green-900">{{ $t('tools.numbermemory.high_score') }}</h3>
            <p class="text-xl font-bold text-green-600">{{ gameState.highScore }}</p>
          </div>
          <div class="text-center bg-purple-50 p-3 rounded-lg border border-purple-200">
            <h3 class="text-sm font-medium text-purple-900">{{ $t('tools.numbermemory.level') }}</h3>
            <p class="text-xl font-bold text-purple-600">{{ gameState.level }}</p>
          </div>
          <div class="text-center bg-orange-50 p-3 rounded-lg border border-orange-200">
            <h3 class="text-sm font-medium text-orange-900">{{ $t('tools.numbermemory.number_count') }}</h3>
            <p class="text-xl font-bold text-orange-600">{{ currentNumberCount }}</p>
          </div>
          <div class="text-center bg-indigo-50 p-3 rounded-lg border border-indigo-200">
            <h3 class="text-sm font-medium text-indigo-900">{{ $t('tools.numbermemory.grid_size') }}</h3>
            <div v-if="isMobile" class="text-xl font-bold text-indigo-600">
              {{ currentGridSize }}×{{ currentGridSize }}
            </div>
            <div v-else class="flex flex-col items-center">
              <el-select
                v-model="selectedGridSize"
                size="small"
                class="mb-1"
                style="width: 80px"
              >
                <el-option
                  v-for="option in gridSizeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <span class="text-xs text-indigo-500">{{ $t('tools.numbermemory.max_count', { count: maxNumbersForCurrentGrid }) }}</span>
            </div>
          </div>
        </div>

        <!-- 游戏主区域 -->
        <div class="flex flex-col lg:flex-row gap-6 mb-6">
          <!-- 左侧：游戏状态提示区域 -->
          <div class="lg:w-1/3">
            <!-- 显示坐标开关 -->
            <div class="mb-4">
              <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div class="flex items-center gap-2">
                  <el-switch
                    v-model="showCoordinates"
                    :active-text="$t('tools.numbermemory.show_coords')"
                    :inactive-text="$t('tools.numbermemory.hide_coords')"
                  />
                </div>
              </div>
            </div>

            <!-- 游戏状态提示 -->
            <div v-if="gameState.isPlaying" class="mb-4">
              <div v-if="gameState.isShowingNumbers" class="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 class="text-lg font-medium text-blue-900 mb-2">{{ $t('tools.numbermemory.remember') }}</h3>
                <div class="flex items-center justify-center gap-2 mb-3">
                  <span class="text-blue-600">{{ $t('tools.numbermemory.time_left') }}</span>
                  <span 
                    class="text-2xl font-bold transition-colors duration-300"
                    :class="{
                      'text-green-600': remainingSeconds > 2,
                      'text-yellow-600': remainingSeconds === 2,
                      'text-orange-600': remainingSeconds === 1,
                      'text-red-600': remainingSeconds === 0
                    }"
                  >
                    {{ remainingSeconds }}
                  </span>
                  <span class="text-blue-600">{{ $t('tools.numbermemory.seconds') }}</span>
                </div>
                <div class="mb-3">
                  <el-button 
                    @click="skipWaitingTime"
                    type="success"
                    size="small"
                    class="bg-green-500 hover:bg-green-600 border-green-600 w-full"
                  >
                    {{ $t('tools.numbermemory.start_now') }}
                  </el-button>
                </div>
                <p class="text-blue-600 text-sm">{{ $t('tools.numbermemory.grid_size') }}: {{ currentGridSize }}×{{ currentGridSize }}</p>
                <p class="text-blue-600 text-sm">{{ $t('tools.numbermemory.number_count') }}: {{ currentNumberCount }}</p>
                <p class="text-blue-600 text-sm">{{ $t('tools.numbermemory.max_count', { count: maxNumbersForCurrentGrid }) }}</p>
              </div>
              <div v-else-if="gameState.isWaitingClick" class="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h3 class="text-lg font-medium text-green-900 mb-2">{{ $t('tools.numbermemory.click_order') }}</h3>
                <p class="text-green-600">{{ $t('tools.numbermemory.next_num') }} {{ gameState.currentClickIndex + 1 }}</p>
              </div>
            </div>

            <!-- 游戏结束提示 -->
            <div v-if="gameState.gameOver" class="mb-4">
              <div class="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-md">
                <h3 class="text-lg font-medium text-red-900 mb-2">{{ $t('tools.numbermemory.game_over') }}</h3>
                <p class="text-red-600 text-sm">{{ $t('tools.numbermemory.final_score') }} {{ gameState.score }}</p>
                <p class="text-red-600 text-sm">{{ $t('tools.numbermemory.level_reached') }} {{ gameState.level }}</p>
                <p class="text-red-600 text-sm">{{ $t('tools.numbermemory.grid_size') }}: {{ currentGridSize }}×{{ currentGridSize }}</p>
                <p class="text-red-600 text-sm">{{ $t('tools.numbermemory.max_count', { count: maxNumbersForCurrentGrid }) }}</p>
                <p v-if="gameState.score === gameState.highScore && gameState.score > 0" class="text-yellow-600 font-medium mt-2 text-sm">
                  {{ $t('tools.numbermemory.new_record') }}
                </p>
              </div>
            </div>

            <!-- 游戏控制 -->
            <div class="flex flex-col gap-2 mb-4">
              <!-- 第一个按钮位置 - 固定高度容器 -->
              <div class="h-8">
                <el-button 
                  v-if="!gameState.isPlaying && !gameState.gameOver"
                  @click="startGame" 
                  type="primary"
                  class="bg-blue-500 hover:bg-blue-600 border-blue-600 w-full h-full"
                >
                  {{ $t('tools.numbermemory.start_game') }}
                </el-button>
                
                <el-button 
                  v-if="gameState.isPlaying"
                  @click="restartGame" 
                  type="warning"
                  class="bg-orange-500 hover:bg-orange-600 border-orange-600 w-full h-full"
                >
                  {{ $t('tools.numbermemory.restart') }}
                </el-button>
                
                <el-button 
                  v-if="gameState.gameOver"
                  @click="restartGame" 
                  type="success"
                  class="bg-green-500 hover:bg-green-600 border-green-600 w-full h-full"
                >
                  {{ $t('tools.numbermemory.play_again') }}
                </el-button>
              </div>
              
              <!-- 第二个按钮位置 - 固定高度容器 -->
              <div class="h-8">
                <el-button 
                  v-if="gameState.isPlaying || gameState.gameOver"
                  @click="resetGame" 
                  type="info"
                  class="bg-gray-500 hover:bg-gray-600 border-gray-600 w-full h-full"
                >
                  {{ $t('tools.numbermemory.reset') }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧：游戏网格区域 -->
          <div class="lg:w-2/3 flex justify-center">
            <div class="relative">
              <!-- X轴坐标 -->
              <div v-if="showCoordinates" class="flex mb-1">
                <!-- 左上角空白区域，与Y轴坐标宽度匹配 -->
                <div style="width: 32px;"></div>
                <!-- 与网格左边距匹配 -->
                <div style="width: 12px;"></div>
                <div 
                  v-for="col in currentGridSize" 
                  :key="`x-${col}`"
                  class="text-center text-xs text-gray-500 font-medium flex items-center justify-center"
                  :style="{ 
                    width: '50px',
                    marginRight: col < currentGridSize ? '8px' : '0'
                  }"
                >
                  {{ col }}
                </div>
              </div>
              
              <!-- 网格和Y轴坐标 -->
              <div class="flex">
                <!-- Y轴坐标 -->
                <div v-if="showCoordinates" class="flex flex-col" style="width: 32px;">
                  <!-- 与网格上边距匹配 -->
                  <div style="height: 12px;"></div>
                  <div 
                    v-for="row in currentGridSize" 
                    :key="`y-${row}`"
                    class="flex items-center justify-center text-xs text-gray-500 font-medium"
                    :style="{ 
                      height: '50px',
                      marginBottom: row < currentGridSize ? '8px' : '0'
                    }"
                  >
                    {{ row }}
                  </div>
                </div>
                
                <!-- 游戏网格 -->
                <div 
                  class="bg-gray-200 p-3 rounded-lg shadow-lg grid gap-2"
                  :style="{
                    gridTemplateColumns: `repeat(${currentGridSize}, 1fr)`,
                    width: `${currentGridSize * 50 + (currentGridSize - 1) * 8 + 24}px`,
                    height: `${currentGridSize * 50 + (currentGridSize - 1) * 8 + 24}px`
                  }"
                >
                  <div
                    v-for="row in currentGridSize"
                    :key="`row-${row}`"
                    class="contents"
                  >
                    <div
                      v-for="col in currentGridSize"
                      :key="`cell-${row}-${col}`"
                      class="rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-105"
                      :class="getCellClass(row - 1, col - 1)"
                      :style="{
                        width: '50px',
                        height: '50px'
                      }"
                      @click="clickCell(row - 1, col - 1)"
                    >
                      <span v-if="getCellContent(row - 1, col - 1)?.isVisible">
                        {{ getCellContent(row - 1, col - 1)?.value }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏说明 -->
        <div class="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 shadow-sm">
          <h3 class="text-lg font-medium text-gray-900 mb-3">{{ $t('tools.numbermemory.instructions_title') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div class="bg-white p-3 rounded border border-gray-200">
              <p><strong class="text-blue-600">{{ $t('tools.numbermemory.goal_label') }}</strong>{{ $t('tools.numbermemory.goal_text') }}</p>
              <p><strong class="text-blue-600">{{ $t('tools.numbermemory.how_label') }}</strong>{{ $t('tools.numbermemory.how_text') }}</p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p><strong class="text-green-600">{{ $t('tools.numbermemory.score_rule_label') }}</strong>{{ $t('tools.numbermemory.score_rule_text') }}</p>
              <p><strong class="text-red-600">{{ $t('tools.numbermemory.fail_label') }}</strong>{{ $t('tools.numbermemory.fail_text') }}</p>
            </div>
          </div>
        </div>

        <!-- 网格说明 -->
        <div class="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 class="text-sm font-medium text-blue-900 mb-2">{{ $t('tools.numbermemory.design_title') }}</h3>
          <div class="text-xs text-blue-700 space-y-1">
            <p>{{ $t('tools.numbermemory.design_mobile') }}</p>
            <p>{{ $t('tools.numbermemory.design_pc') }}</p>
            <p>{{ $t('tools.numbermemory.design_infinite') }}</p>
            <p>{{ $t('tools.numbermemory.design_difficulty') }}</p>
            <p>{{ $t('tools.numbermemory.design_time') }}</p>
            <p>{{ $t('tools.numbermemory.design_coords') }}</p>
            <p>{{ $t('tools.numbermemory.design_fast') }}</p>
          </div>
        </div>
      </div>
    </div>

    <ToolDetail :title="$t('tools.numbermemory.description')">
      <el-text>
        <span v-html="$t('tools.numbermemory.desc')"></span>
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 网格动画效果 */
.grid-cell {
  transition: all 0.3s ease;
}

.grid-cell:hover {
  transform: scale(1.05);
}

/* 数字显示动画 */
@keyframes numberShow {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.number-show {
  animation: numberShow 0.3s ease-out;
}

/* 正确点击动画 */
@keyframes correctClick {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.correct-click {
  animation: correctClick 0.5s ease-in-out;
}

/* 倒计时动画 */
@keyframes countdownPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.countdown-pulse {
  animation: countdownPulse 0.5s ease-in-out;
}
</style>
