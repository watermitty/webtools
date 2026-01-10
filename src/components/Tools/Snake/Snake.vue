<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

import DetailHeader from "@/components/Layout/DetailHeader/DetailHeader.vue";
import ToolDetail from "@/components/Layout/ToolDetail/ToolDetail.vue";

// 定义类型
interface Position {
  x: number;
  y: number;
}



const info = reactive({
  title: "tools.snake.title",
});

// 游戏状态
const gameState = reactive({
  isPlaying: false,
  score: 0,
  highScore: 0,
  gameOver: false,
  gameTime: 0, // 游戏时间（秒）
  hasStarted: false, // 是否已开始过本局
});

// 游戏配置 - 根据屏幕尺寸调整
const config = reactive({
  gridSize: window.innerWidth < 1024 ? 10 : 20, // H5端使用15x15，桌面端使用20x20
  cellSize: window.innerWidth < 1024 ? 25 : 20, // H5端格子更大
  speed: 150,
  scorePerFood: 1,
});

// 速度选项
const speedOptions = computed(() => [
  { label: t('tools.snake.speed_slow'), value: 200 },
  { label: t('tools.snake.speed_normal'), value: 150 },
  { label: t('tools.snake.speed_fast'), value: 100 },
  { label: t('tools.snake.speed_extreme'), value: 50 },
]);

// 生成随机蛇的初始位置
const getRandomSnakePosition = (): Position[] => {
  const gridSize = config.gridSize;

  // 蛇头位置远离边界，留出更多安全距离
  const minDistance = 4; // 距离边界至少4格
  const headX =
    Math.floor(Math.random() * (gridSize - 2 * minDistance)) + minDistance;
  const headY =
    Math.floor(Math.random() * (gridSize - 2 * minDistance)) + minDistance;

  // 随机选择初始方向（右、下、左、上）
  const directions = [
    { x: 1, y: 0 }, // 向右
    { x: 0, y: 1 }, // 向下
    { x: -1, y: 0 }, // 向左
    { x: 0, y: -1 }, // 向上
  ];
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)];

  // 根据方向生成蛇身
  const body1: Position = {
    x: headX - randomDirection.x,
    y: headY - randomDirection.y,
  };
  const body2: Position = {
    x: headX - randomDirection.x * 2,
    y: headY - randomDirection.y * 2,
  };

  return [{ x: headX, y: headY }, body1, body2];
};

// 根据蛇身位置计算正确的初始方向
const getInitialDirection = (snakePosition: Position[]): Position => {
  if (snakePosition.length < 2) return { x: 1, y: 0 };

  const head = snakePosition[0];
  const neck = snakePosition[1];

  // 计算蛇头到蛇颈的方向
  const dx = head.x - neck.x;
  const dy = head.y - neck.y;

  return { x: dx, y: dy };
};

// 生成随机食物位置
const getRandomFoodPosition = (): Position => {
  const gridSize = config.gridSize;
  const x = Math.floor(Math.random() * gridSize);
  const y = Math.floor(Math.random() * gridSize);
  return { x, y };
};

// 保存初始的蛇和食物位置
let initialSnakePosition: Position[] = [];
let initialFoodPosition: Position = { x: 0, y: 0 };
let initialDirection: Position = { x: 1, y: 0 };

// 蛇的初始位置和方向
const snake = ref<Position[]>([]);

// 食物位置
const food = ref<Position>({ x: 0, y: 0 });

// 移动方向
const direction = ref<Position>({ x: 1, y: 0 });

// 初始化游戏位置
const initializeGamePositions = () => {
  initialSnakePosition = getRandomSnakePosition();
  initialFoodPosition = getRandomFoodPosition();
  initialDirection = getInitialDirection(initialSnakePosition);

  // 确保食物不在蛇身上
  while (
    initialSnakePosition.some(
      (segment) =>
        segment.x === initialFoodPosition.x &&
        segment.y === initialFoodPosition.y
    )
  ) {
    initialFoodPosition = getRandomFoodPosition();
  }

  // 设置初始显示位置
  snake.value = [...initialSnakePosition];
  food.value = { ...initialFoodPosition };
  direction.value = { ...initialDirection };
};

// 页面加载时初始化位置
initializeGamePositions();

// 游戏循环
let gameLoop: number | null = null;
// 计时器
let timeTimer: number | null = null;

// 生成随机食物位置
const generateFood = () => {
  const x = Math.floor(Math.random() * config.gridSize);
  const y = Math.floor(Math.random() * config.gridSize);

  // 确保食物不在蛇身上
  const isOnSnake = snake.value.some(
    (segment) => segment.x === x && segment.y === y
  );
  if (isOnSnake) {
    generateFood();
  } else {
    food.value = { x, y };
  }
};

// 检查碰撞
const checkCollision = (head: Position) => {
  // 检查是否撞墙
  if (
    head.x < 0 ||
    head.x >= config.gridSize ||
    head.y < 0 ||
    head.y >= config.gridSize
  ) {
    return true;
  }

  // 检查是否撞到自己
  return snake.value.some(
    (segment) => segment.x === head.x && segment.y === head.y
  );
};

// 移动蛇
const moveSnake = () => {
  if (!gameState.isPlaying) return;

  const head = { ...snake.value[0] };
  head.x += direction.value.x;
  head.y += direction.value.y;

  // 检查碰撞
  if (checkCollision(head)) {
    gameOver();
    return;
  }

  snake.value.unshift(head);

  // 检查是否吃到食物
  if (head.x === food.value.x && head.y === food.value.y) {
    gameState.score += config.scorePerFood;

    // 实时检查并更新最高分
    if (gameState.score > gameState.highScore) {
      gameState.highScore = gameState.score;
      // 立即保存到本地存储
      saveHighScore();
    }

    generateFood();
  } else {
    snake.value.pop();
  }
};

// 游戏结束
const gameOver = () => {
  gameState.isPlaying = false;
  gameState.gameOver = true;

  // 游戏结束时再次检查最高分（以防万一）
  if (gameState.score > gameState.highScore) {
    gameState.highScore = gameState.score;
    // 立即保存到本地存储
    saveHighScore();
  }

  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  if (timeTimer) {
    clearInterval(timeTimer);
    timeTimer = null;
  }
};

// 格式化时间显示
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// 开始游戏
const startGame = () => {
  const resuming = gameState.hasStarted && !gameState.gameOver;

  gameState.isPlaying = true;
  gameState.gameOver = false;

  // 仅在首次开始或重新开始时重置
  if (!resuming) {
    gameState.score = 0;
    gameState.gameTime = 0;
    snake.value = [...initialSnakePosition];
    food.value = { ...initialFoodPosition };
    direction.value = { ...initialDirection };
  }

  if (gameLoop) {
    clearInterval(gameLoop);
  }
  if (timeTimer) {
    clearInterval(timeTimer);
  }

  gameLoop = setInterval(moveSnake, config.speed);
  timeTimer = setInterval(() => {
    if (gameState.isPlaying) {
      gameState.gameTime++;
    }
  }, 1000);

  gameState.hasStarted = true;
};

// 暂停游戏
const pauseGame = () => {
  if (gameState.isPlaying) {
    gameState.isPlaying = false;
    if (gameLoop) {
      clearInterval(gameLoop);
      gameLoop = null;
    }
    if (timeTimer) {
      clearInterval(timeTimer);
      timeTimer = null;
    }
  } else {
    gameState.isPlaying = true;
    gameLoop = setInterval(moveSnake, config.speed);
    // 重新启动计时器
    timeTimer = setInterval(() => {
      if (gameState.isPlaying) {
        gameState.gameTime++;
      }
    }, 1000);
  }
};

// 重新开始
const restartGame = () => {
  if (gameLoop) {
    clearInterval(gameLoop);
  }
  // 重新初始化位置
  initializeGamePositions();
  // 标记新一局
  gameState.hasStarted = false;
  startGame();
};

// 速度改变处理
const handleSpeedChange = () => {
  if (gameLoop && gameState.isPlaying) {
    clearInterval(gameLoop);
    gameLoop = setInterval(moveSnake, config.speed);
  }
};

// 虚拟方向键点击处理
const handleDirectionClick = (_direction: string) => {
  if (!gameState.isPlaying) return;
  console.log("_direction", _direction);
  switch (_direction) {
    case "up":
      if (direction.value.y === 0) {
        direction.value = { x: 0, y: -1 };
      }
      break;
    case "down":
      if (direction.value.y === 0) {
        direction.value = { x: 0, y: 1 };
      }
      break;
    case "left":
      if (direction.value.x === 0) {
        direction.value = { x: -1, y: 0 };
      }
      break;
    case "right":
      if (direction.value.x === 0) {
        direction.value = { x: 1, y: 0 };
      }
      break;
  }
};

// 键盘控制
const handleKeydown = (event: KeyboardEvent) => {
  // 阻止所有方向键的默认行为
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
    ].includes(event.key)
  ) {
    event.preventDefault();
  }

  if (!gameState.isPlaying && event.key !== " ") return;

  switch (event.key.toLowerCase()) {
    case "arrowup":
    case "w":
      if (direction.value.y === 0) {
        direction.value = { x: 0, y: -1 };
      }
      break;
    case "arrowdown":
    case "s":
      if (direction.value.y === 0) {
        direction.value = { x: 0, y: 1 };
      }
      break;
    case "arrowleft":
    case "a":
      if (direction.value.x === 0) {
        direction.value = { x: -1, y: 0 };
      }
      break;
    case "arrowright":
    case "d":
      if (direction.value.x === 0) {
        direction.value = { x: 1, y: 0 };
      }
      break;
    case " ":
      if (gameState.gameOver) {
        restartGame();
      } else {
        pauseGame();
      }
      break;
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  // 从localStorage加载最高分
  loadHighScore();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (gameLoop) {
    clearInterval(gameLoop);
  }
  if (timeTimer) {
    clearInterval(timeTimer);
  }
  // 保存最高分到本地存储
  saveHighScore();
});

// 加载最高分
const loadHighScore = () => {
  try {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      const score = parseInt(savedHighScore);
      if (!isNaN(score) && score >= 0) {
        gameState.highScore = score;
      }
    }
  } catch (error) {
    console.error("加载最高分失败:", error);
  }
};

// 保存最高分
const saveHighScore = () => {
  try {
    localStorage.setItem("snakeHighScore", gameState.highScore.toString());
  } catch (error) {
    console.error("保存最高分失败:", error);
  }
};

// 清空最高分
const clearHighScore = () => {
  gameState.highScore = 0;
  try {
    localStorage.removeItem("snakeHighScore");
  } catch (error) {
    console.error("清空最高分失败:", error);
  }
};

// 计算画布尺寸 - 根据格子数量自适应
const canvasSize = config.gridSize * config.cellSize;

// 颜色配置选项
const colorSchemes = computed(() => [
  {
    name: t('tools.snake.colors.green'),
    head: '#15803d',
    body: '#22c55e',
    food: '#ef4444'
  },
  {
    name: t('tools.snake.colors.blue'),
    head: '#1d4ed8',
    body: '#3b82f6',
    food: '#f59e0b'
  },
  {
    name: t('tools.snake.colors.purple'),
    head: '#7c3aed',
    body: '#a855f7',
    food: '#10b981'
  },
  {
    name: t('tools.snake.colors.orange'),
    head: '#c2410c',
    body: '#f97316',
    food: '#8b5cf6'
  },
  {
    name: t('tools.snake.colors.pink'),
    head: '#be185d',
    body: '#ec4899',
    food: '#06b6d4'
  },
  {
    name: t('tools.snake.colors.red'),
    head: '#b91c1c',
    body: '#ef4444',
    food: '#10b981'
  },
  {
    name: t('tools.snake.colors.cyan'),
    head: '#0f766e',
    body: '#14b8a6',
    food: '#f97316'
  },
  {
    name: t('tools.snake.colors.yellow'),
    head: '#a16207',
    body: '#eab308',
    food: '#8b5cf6'
  },
  {
    name: t('tools.snake.colors.gray'),
    head: '#374151',
    body: '#6b7280',
    food: '#ef4444'
  },
  {
    name: t('tools.snake.colors.indigo'),
    head: '#3730a3',
    body: '#6366f1',
    food: '#f59e0b'
  },
  {
    name: t('tools.snake.colors.teal'),
    head: '#047857',
    body: '#10b981',
    food: '#f97316'
  },
  {
    name: t('tools.snake.colors.rose'),
    head: '#be123c',
    body: '#f43f5e',
    food: '#06b6d4'
  }
])

// 当前选中的颜色方案
const selectedColorScheme = ref(0)

// 获取当前颜色方案
const getCurrentColorScheme = () => {
  return colorSchemes.value[selectedColorScheme.value]
}
</script>

<template>
  <div class="flex flex-col mt-3 ml-4 flex-1 mr-3">
    <DetailHeader :title="$t(info.title)"></DetailHeader>

    <div class="p-6 rounded-2xl bg-white shadow-sm border border-gray-200">
      <div class="max-w-2xl mx-auto">
        <!-- 游戏信息 -->
        <div class="flex justify-between items-center mb-6">
          <div
            class="text-center bg-blue-50 p-4 rounded-lg border border-blue-200 flex-1 mx-2"
          >
            <h3 class="text-lg font-medium text-blue-900">{{ $t('tools.snake.score') }}</h3>
            <p class="text-2xl font-bold text-blue-600">
              {{ gameState.score }}
            </p>
          </div>
          <div
            class="text-center bg-green-50 p-4 rounded-lg border border-green-200 flex-1 mx-2 relative"
          >
            <h3 class="text-lg font-medium text-green-900">{{ $t('tools.snake.high_score') }}</h3>
            <div class="flex items-center justify-center space-x-2">
              <p class="text-2xl font-bold text-green-600">
                {{ gameState.highScore }}
              </p>
              <!-- 清空最高分按钮 -->
              <el-button 
                @click="clearHighScore"
                type="danger"
                size="small"
                :disabled="gameState.isPlaying || (!gameState.gameOver && gameState.gameTime > 0)"
                class="bg-red-500 hover:bg-red-600 border-red-600 text-xs h-6 px-2"
              >
                {{ $t('tools.snake.clear') }}
              </el-button>
            </div>
          </div>
          <div
            class="text-center bg-purple-50 p-4 rounded-lg border border-purple-200 flex-1 mx-2"
          >
            <h3 class="text-lg font-medium text-purple-900">{{ $t('tools.snake.game_time') }}</h3>
            <p class="text-2xl font-bold text-purple-600">
              {{ formatTime(gameState.gameTime) }}
            </p>
          </div>
        </div>

        <!-- 游戏设置 -->
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center space-x-6">
            <div class="flex items-center space-x-3">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap">{{ $t('tools.snake.label_speed') }}</label>
              <el-select 
                v-model="config.speed" 
                @change="handleSpeedChange"
                :disabled="gameState.isPlaying"
                :style="{ width: '100px' }"
              >
                <el-option
                  v-for="option in speedOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
            
            <!-- 颜色主题选择 -->
            <div class="flex items-center space-x-3">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap">{{ $t('tools.snake.label_theme') }}</label>
              <el-select 
                v-model="selectedColorScheme" 
                :disabled="gameState.isPlaying"
                :style="{ width: '120px' }"
              >
                <el-option
                  v-for="(scheme, index) in colorSchemes"
                  :key="index"
                  :label="scheme.name"
                  :value="index"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 游戏画布 -->
        <div class="flex justify-center mb-6">
          <div
            class="bg-gray-100 relative shadow-lg"
            :style="{
              width: canvasSize + 'px',
              height: canvasSize + 'px',
              maxWidth: '100%',
              maxHeight: '60vh',
            }"
          >
            <!-- 网格线 -->
            <div
              v-for="i in config.gridSize - 1"
              :key="`h-${i}`"
              class="absolute bg-gray-300"
              :style="{
                width: '1px',
                height: canvasSize + 'px',
                left: i * config.cellSize + 'px',
                top: '0px',
              }"
            ></div>
            <div
              v-for="i in config.gridSize - 1"
              :key="`v-${i}`"
              class="absolute bg-gray-300"
              :style="{
                height: '1px',
                width: canvasSize + 'px',
                left: '0px',
                top: i * config.cellSize + 'px',
              }"
            ></div>

            <!-- 蛇身 -->
            <div
              v-for="(segment, index) in snake"
              :key="index"
              class="absolute shadow-sm"
              :style="{
                width: config.cellSize - 1 + 'px',
                height: config.cellSize - 1 + 'px',
                left: segment.x * config.cellSize + 'px',
                top: segment.y * config.cellSize + 'px',
                zIndex: index === 0 ? 2 : 1,
              }"
            >
              <!-- 蛇头 -->
              <div 
                v-if="index === 0" 
                class="w-full h-full rounded-sm"
                :style="{ backgroundColor: getCurrentColorScheme().head }"
              ></div>
              <!-- 蛇身 -->
              <div 
                v-else 
                class="w-full h-full rounded-sm"
                :style="{ backgroundColor: getCurrentColorScheme().body }"
              ></div>
            </div>

            <!-- 食物 -->
            <div
              class="absolute rounded-full shadow-md animate-pulse"
              :style="{
                width: config.cellSize - 2 + 'px',
                height: config.cellSize - 2 + 'px',
                left: food.x * config.cellSize + 1 + 'px',
                top: food.y * config.cellSize + 1 + 'px',
                zIndex: 3,
                backgroundColor: getCurrentColorScheme().food
              }"
            ></div>
          </div>
        </div>

        <!-- 游戏控制：按钮条件 -->
        <div class="flex justify-center space-x-4 mb-6">
          <el-button
            v-if="!gameState.isPlaying && !gameState.gameOver && !gameState.hasStarted"
            @click="startGame"
            type="primary"
            class="bg-blue-500 hover:bg-blue-600 border-blue-600"
          >
            {{ $t('tools.snake.btn_start') }}
          </el-button>
          <el-button
            v-if="gameState.isPlaying"
            @click="pauseGame"
            type="warning"
            class="bg-orange-500 hover:bg-orange-600 border-orange-600"
          >
            {{ $t('tools.snake.btn_pause') }}
          </el-button>
          <el-button
            v-if="!gameState.isPlaying && !gameState.gameOver && gameState.hasStarted"
            @click="pauseGame"
            type="success"
            class="bg-green-500 hover:bg-green-600 border-green-600"
          >
            {{ $t('tools.snake.btn_continue') }}
          </el-button>
          <el-button
            v-if="gameState.gameOver"
            @click="restartGame"
            type="success"
            class="bg-green-500 hover:bg-green-600 border-green-600"
          >
            {{ $t('tools.snake.btn_restart') }}
          </el-button>
        </div>

        <!-- H5端虚拟方向键 -->
        <div class="lg:hidden flex justify-center mb-6">
          <div class="bg-gray-100 rounded-lg p-4 border border-gray-300">
            <h3 class="text-center text-sm font-medium text-gray-700 mb-3">
              {{ $t('tools.snake.direction_control') }}
            </h3>
            <div class="grid grid-cols-3 gap-2">
              <!-- 上 -->
              <div class="col-start-2">
                <el-button
                  @click="handleDirectionClick('up')"
                  :disabled="!gameState.isPlaying"
                  class="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  ↑
                </el-button>
              </div>
              <!-- 左 -->
              <div class="col-start-1 row-start-2">
                <el-button
                  @click="handleDirectionClick('left')"
                  :disabled="!gameState.isPlaying"
                  class="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  ←
                </el-button>
              </div>
              <!-- 下 -->
              <div class="col-start-2 row-start-2">
                <el-button
                  @click="handleDirectionClick('down')"
                  :disabled="!gameState.isPlaying"
                  class="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  ↓
                </el-button>
              </div>
              <!-- 右 -->
              <div class="col-start-3 row-start-2">
                <el-button
                  @click="handleDirectionClick('right')"
                  :disabled="!gameState.isPlaying"
                  class="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  →
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏结束提示 -->
        <div v-if="gameState.gameOver" class="text-center mb-6">
          <div
            class="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-md"
          >
            <h3 class="text-lg font-medium text-red-900 mb-2">{{ $t('tools.snake.game_over') }}</h3>
            <p class="text-red-600">{{ $t('tools.snake.final_score') }} {{ gameState.score }}</p>
            <p v-if="gameState.score > gameState.highScore" class="text-yellow-600 font-medium mt-2">
              {{ $t('tools.snake.new_record') }}
            </p>
          </div>
        </div>

        <!-- 操作说明 -->
        <div
          class="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 shadow-sm"
        >
          <h3 class="text-lg font-medium text-gray-900 mb-3">{{ $t('tools.snake.operation_title') }}</h3>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600"
          >
            <div class="bg-white p-3 rounded border border-gray-200">
              <p>
                <strong class="text-blue-600">{{ $t('tools.snake.op_keys') }}</strong
                >{{ $t('tools.snake.op_keys_desc') }}
              </p>
              <p>
                <strong class="text-blue-600">{{ $t('tools.snake.op_space') }}</strong>{{ $t('tools.snake.op_space_desc') }}
              </p>
            </div>
            <div class="bg-white p-3 rounded border border-gray-200">
              <p>
                <strong class="text-green-600">{{ $t('tools.snake.op_goal') }}</strong
                >{{ $t('tools.snake.op_goal_desc') }}
              </p>
              <p>
                <strong class="text-red-600">{{ $t('tools.snake.op_note') }}</strong>{{ $t('tools.snake.op_note_desc') }}
              </p>
            </div>
          </div>
          <!-- H5端操作说明 -->
          <div
            class="lg:hidden mt-4 bg-blue-50 p-3 rounded border border-blue-200"
          >
            <p class="text-sm text-blue-700">
              <strong>{{ $t('tools.snake.op_mobile') }}</strong>{{ $t('tools.snake.op_mobile_desc') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具详情 -->
    <ToolDetail :title="$t('tools.snake.desc_title')">
      <el-text>
        {{ $t('tools.snake.desc_content') }}
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
/* 自定义样式 */
.game-canvas {
  image-rendering: pixelated;
}

/* 添加一些动画效果 */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style> 