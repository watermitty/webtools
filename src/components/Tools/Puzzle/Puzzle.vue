<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { Refresh } from '@element-plus/icons-vue'


const info = reactive({
  title: "tools.puzzle.title",
})

interface Tile {
  id: number
  value: number
  currentPos: number
  isBlank: boolean
}

const gameState = reactive({
  size: 3, // 3x3 网格
  tiles: [] as Tile[],
  moves: 0,
  time: 0,
  isPlaying: false,
  isCompleted: false,
  timer: null as any,
})

const difficulty = ref(3) // 3x3, 4x4, 5x5

// 初始化游戏
const initGame = () => {
  gameState.size = difficulty.value
  gameState.moves = 0
  gameState.time = 0
  gameState.isPlaying = false
  gameState.isCompleted = false
  
  // 创建数字方块
  const totalTiles = gameState.size * gameState.size
  gameState.tiles = []
  
  for (let i = 0; i < totalTiles - 1; i++) {
    gameState.tiles.push({
      id: i,
      value: i + 1,
      currentPos: i,
      isBlank: false
    })
  }
  
  // 添加空白方块
  gameState.tiles.push({
    id: totalTiles - 1,
    value: 0,
    currentPos: totalTiles - 1,
    isBlank: true
  })
  
  shuffleTiles()
}

// 打乱方块 - 修复递归问题
const shuffleTiles = () => {
  const shuffleCount = 100 + Math.floor(Math.random() * 200)
  let attempts = 0
  const maxAttempts = 10
  
  const doShuffle = () => {
    for (let i = 0; i < shuffleCount; i++) {
      const blankTile = gameState.tiles.find(tile => tile.isBlank)
      if (!blankTile) continue
      
      const blankPos = blankTile.currentPos
      const adjacentTiles = getAdjacentTiles(blankPos)
      
      if (adjacentTiles.length > 0) {
        const randomTile = adjacentTiles[Math.floor(Math.random() * adjacentTiles.length)]
        moveTile(randomTile, false)
      }
    }
    
    // 检查是否完成，如果完成且尝试次数未超限，则重新打乱
    const isComplete = gameState.tiles.every(tile => {
      if (tile.isBlank) {
        return tile.currentPos === gameState.tiles.length - 1
      }
      return tile.currentPos === tile.value - 1
    })
    
    if (isComplete && attempts < maxAttempts) {
      attempts++
      doShuffle()
    }
  }
  
  doShuffle()
}

// 获取相邻的可移动方块
const getAdjacentTiles = (blankPos: number): Tile[] => {
  const adjacent: Tile[] = []
  const size = gameState.size
  
  // 检查上下左右四个方向
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 },  // 右
  ]
  
  const blankRow = Math.floor(blankPos / size)
  const blankCol = blankPos % size
  
  for (const dir of directions) {
    const newRow = blankRow + dir.row
    const newCol = blankCol + dir.col
    
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      const newPos = newRow * size + newCol
      const tile = gameState.tiles.find(t => t.currentPos === newPos)
      if (tile) {
        adjacent.push(tile)
      }
    }
  }
  
  return adjacent
}

// 移动方块
const moveTile = (tile: Tile, countMove = true) => {
  const blankTile = gameState.tiles.find(t => t.isBlank)
  if (!blankTile) return
  
  const blankPos = blankTile.currentPos
  const tilePos = tile.currentPos
  
  // 检查是否相邻
  const adjacentTiles = getAdjacentTiles(blankPos)
  if (!adjacentTiles.find(t => t.id === tile.id)) return
  
  // 交换位置
  tile.currentPos = blankPos
  blankTile.currentPos = tilePos
  
  // 只有在玩家操作时才增加步数和开始计时
  if (countMove) {
    gameState.moves++
    // 第一次移动时开始游戏
    if (!gameState.isPlaying && !gameState.isCompleted) {
      startGame()
    }
    // 只有在玩家操作时才检查完成状态
    checkCompletion()
  }
}

// 更清晰的完成状态判断
const checkCompletion = () => {
  const size = gameState.size
  const totalTiles = size * size
  
  const isComplete = gameState.tiles.every(tile => {
    if (tile.isBlank) {
      // 空白方块应该在右下角
      return tile.currentPos === totalTiles - 1
    } else {
      // 数字方块应该在对应位置
      const expectedPos = tile.value - 1
      return tile.currentPos === expectedPos
    }
  })
  
  if (isComplete) {
    gameState.isCompleted = true
    gameState.isPlaying = false
    if (gameState.timer) {
      clearInterval(gameState.timer)
      gameState.timer = null
    }
  }
}

// 开始游戏
const startGame = () => {
  gameState.isPlaying = true
  gameState.timer = setInterval(() => {
    gameState.time++
  }, 1000)
}

// 重新开始
const restartGame = () => {
  if (gameState.timer) {
    clearInterval(gameState.timer)
    gameState.timer = null
  }
  initGame()
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 计算方块样式
const getTileStyle = (tile: Tile) => {
  const size = gameState.size
  const row = Math.floor(tile.currentPos / size)
  const col = tile.currentPos % size
  
  return {
    transform: `translate(${col * 100}%, ${row * 100}%)`,
    width: `${100 / size}%`,
    height: `${100 / size}%`,
  }
}

// 计算网格样式
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gameState.size}, 1fr)`,
  gridTemplateRows: `repeat(${gameState.size}, 1fr)`,
}))

// 添加键盘控制
const handleKeydown = (event: KeyboardEvent) => {
  if (gameState.isCompleted) return
  
  const blankTile = gameState.tiles.find(t => t.isBlank)
  if (!blankTile) return
  
  const blankPos = blankTile.currentPos
  const adjacentTiles = getAdjacentTiles(blankPos)
  
  let targetTile: Tile | null = null
  
  switch (event.key) {
    case 'ArrowUp':
      targetTile = adjacentTiles.find(t => t.currentPos === blankPos + gameState.size) || null
      break
    case 'ArrowDown':
      targetTile = adjacentTiles.find(t => t.currentPos === blankPos - gameState.size) || null
      break
    case 'ArrowLeft':
      targetTile = adjacentTiles.find(t => t.currentPos === blankPos + 1) || null
      break
    case 'ArrowRight':
      targetTile = adjacentTiles.find(t => t.currentPos === blankPos - 1) || null
      break
  }
  
  if (targetTile) {
    moveTile(targetTile)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (gameState.timer) {
    clearInterval(gameState.timer)
    gameState.timer = null
  }
  document.removeEventListener('keydown', handleKeydown)
})

onMounted(() => {
  initGame()
  document.addEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white">
      <!-- 游戏控制 -->
      <div class="flex flex-wrap gap-4 mb-6 items-center">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">{{ $t('tools.puzzle.difficulty') }}</span>
          <el-select v-model="difficulty" @change="restartGame" style="width: 100px">
            <el-option label="3x3" :value="3" />
            <el-option label="4x4" :value="4" />
            <el-option label="5x5" :value="5" />
          </el-select>
        </div>
        
        <el-button type="primary" @click="restartGame" :icon="Refresh">
          {{ $t('tools.puzzle.restart') }}
        </el-button>
        
        <div class="flex gap-4 text-sm">
          <div class="flex items-center gap-1">
            <span class="text-gray-600">{{ $t('tools.puzzle.moves') }}</span>
            <span class="font-bold text-blue-600">{{ gameState.moves }}</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-gray-600">{{ $t('tools.puzzle.time') }}</span>
            <span class="font-bold text-green-600">{{ formatTime(gameState.time) }}</span>
          </div>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div class="flex justify-center">
        <div class="relative bg-gray-200 rounded-lg overflow-hidden shadow-lg" 
             :style="{ width: `${gameState.size * 120}px`, height: `${gameState.size * 120}px` }">
          
          <!-- 网格背景 -->
          <div class="absolute inset-0" :style="gridStyle">
            <div v-for="i in gameState.size * gameState.size" :key="i" 
                 class="border border-gray-300 bg-gray-100"></div>
          </div>
          
          <!-- 数字方块 -->
          <div v-for="tile in gameState.tiles" :key="tile.id"
               class="absolute transition-all duration-200 ease-in-out cursor-pointer"
               :class="[
                 tile.isBlank ? 'bg-transparent' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl',
                 'flex items-center justify-center font-bold text-lg'
               ]"
               :style="getTileStyle(tile)"
               @click="moveTile(tile)">
            <span v-if="!tile.isBlank">{{ tile.value }}</span>
          </div>
        </div>
      </div>

      <!-- 完成提示 -->
      <div v-if="gameState.isCompleted" 
           class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <div class="text-green-800 font-bold text-lg mb-2">{{ $t('tools.puzzle.congrats') }}</div>
        <div class="text-green-600">
          {{ $t('tools.puzzle.time_used') }} {{ formatTime(gameState.time) }} | {{ $t('tools.puzzle.moves_used') }} {{ gameState.moves }}
        </div>
      </div>
    </div>

    <!-- 描述 -->
    <ToolDetail :title="$t('tools.puzzle.desc_title')">
      <el-text>
        {{ $t('tools.puzzle.desc_content') }}
        <br><br>
        <strong>{{ $t('tools.puzzle.rules_title') }}</strong>
        <span v-html="$t('tools.puzzle.rules_content')"></span>
        <br><br>
        <strong>{{ $t('tools.puzzle.controls_title') }}</strong>
        <span v-html="$t('tools.puzzle.controls_content')"></span>
        <br><br>
        <strong>{{ $t('tools.puzzle.tips_title') }}</strong>
        <br>{{ $t('tools.puzzle.tips_content') }}
        <br><br>
        <strong>{{ $t('tools.puzzle.difficulty_title') }}</strong>
        <span v-html="$t('tools.puzzle.difficulty_content')"></span>
        <br><br>
        <strong>{{ $t('tools.puzzle.history_title') }}</strong>
        <br>{{ $t('tools.puzzle.history_content') }}
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
.el-select {
  --el-select-border-color-hover: #409eff;
}
</style>
