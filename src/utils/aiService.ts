import {
  CheckInEntry,
  AIStateClassification,
  EmpathyFeedback,
  CheerType,
  ExerciseType,
  DietType,
  SleepQuality,
  MoodType,
} from '../types'

// 文案模板库（80%使用模板，20%使用LLM）
const FEEDBACK_TEMPLATES = {
  high_effort: {
    cute: {
      title: '今天超棒！',
      empathyLine: '你不是靠狠，你是靠稳。这个最强。',
      achievementLine: '今天的努力都算数，每一步都值得骄傲！',
      microAction: '记得给自己一个拥抱',
    },
    calm: {
      title: '坚持得很好',
      empathyLine: '稳定的节奏比爆发更有力量',
      achievementLine: '今天完成得很好，继续保持',
      microAction: '适当休息，保持状态',
    },
    funny: {
      title: '卷王本卷！',
      empathyLine: '今天又是自律的一天呢',
      achievementLine: '这节奏，体重看了都要抖三抖',
      microAction: '奖励自己一下',
    },
    serious: {
      title: '优秀表现',
      empathyLine: '持续的努力正在带来改变',
      achievementLine: '今天的完成度很高，目标在靠近',
      microAction: '保持这个节奏',
    },
  },
  mid_effort: {
    cute: {
      title: '今天也不错',
      empathyLine: '小步前进也是前进',
      achievementLine: '你做到了力所能及的事',
      microAction: '明天继续加油',
    },
    calm: {
      title: '稳步进行',
      empathyLine: '保持节奏就好',
      achievementLine: '今天有在坚持，很好',
      microAction: '保持现状',
    },
    funny: {
      title: '不卷不躺',
      empathyLine: '今天走的是稳健路线',
      achievementLine: '至少没躺平，值得表扬',
      microAction: '明天再努力一点',
    },
    serious: {
      title: '正常完成',
      empathyLine: '稳定的执行很重要',
      achievementLine: '今天有完成打卡，继续保持',
      microAction: '逐步提升强度',
    },
  },
  low_effort: {
    cute: {
      title: '电量低也没关系',
      empathyLine: '电量低也没关系，我们先把"不放弃"打个卡',
      achievementLine: '至少你还记得打卡，这已经很棒了',
      microAction: '今晚好好休息',
    },
    calm: {
      title: '理解你的状态',
      empathyLine: '偶尔的低电量是正常的',
      achievementLine: '打卡本身就是一种坚持',
      microAction: '先照顾好自己',
    },
    funny: {
      title: '躺平日',
      empathyLine: '今天走的是佛系路线',
      achievementLine: '至少打卡了，不算完全躺平',
      microAction: '明天再战',
    },
    serious: {
      title: '需要调整',
      empathyLine: '今天完成度较低，可能需要调整',
      achievementLine: '打卡了就是进步',
      microAction: '分析原因，明天改进',
    },
  },
  binge: {
    cute: {
      title: '你不是失败',
      empathyLine: '你不是失败，你只是很累。今晚先照顾好自己',
      achievementLine: '能意识到并记录，已经是勇气',
      microAction: '明天重新开始',
    },
    calm: {
      title: '理解你的感受',
      empathyLine: '偶尔的失控不代表失败',
      achievementLine: '记录本身就是一种面对',
      microAction: '不要自责，明天继续',
    },
  },
  low_mood: {
    cute: {
      title: '抱抱你',
      empathyLine: '心情不好的时候，先照顾好情绪',
      achievementLine: '你今天已经很努力了',
      microAction: '做点让自己开心的事',
    },
    calm: {
      title: '理解你的状态',
      empathyLine: '情绪波动是正常的',
      achievementLine: '坚持打卡本身就是进步',
      microAction: '先调整心情',
    },
  },
}

// 节点1：状态识别/分类
export function classifyCheckInState(entry: CheckInEntry, history: CheckInEntry[]): AIStateClassification {
  // 规则优先的分类逻辑
  let effortLevel: 'high' | 'mid' | 'low' = 'mid'
  let moodState: 'positive' | 'neutral' | 'low' | 'anxious' | 'irritable' = 'neutral'
  let riskFlag: 'binge' | 'self_blame' | 'overtraining_suspect' | undefined
  let contextHint: 'busy' | 'period' | 'social_event' | 'travel' | 'sick' | undefined
  let recommendedTone: 'cute' | 'calm' | 'funny' | 'serious' = 'calm'

  // 分析努力程度
  const exerciseCount = entry.exercises?.length || 0
  const hasGoodDiet = entry.diet === 'controlled' || entry.diet === 'normal'
  const hasGoodWater = entry.water === true
  const hasGoodSleep = entry.sleep === 'good'

  const completedItems = [
    exerciseCount > 0,
    hasGoodDiet,
    hasGoodWater,
    hasGoodSleep,
  ].filter(Boolean).length

  if (completedItems >= 3) {
    effortLevel = 'high'
  } else if (completedItems >= 1) {
    effortLevel = 'mid'
  } else {
    effortLevel = 'low'
  }

  // 分析心情状态
  if (entry.mood === 'excited' || entry.mood === 'happy') {
    moodState = 'positive'
  } else if (entry.mood === 'sad') {
    moodState = 'low'
  } else if (entry.mood === 'anxious') {
    moodState = 'anxious'
  }

  // 风险识别
  if (entry.diet === 'binge') {
    riskFlag = 'binge'
  }

  // 从备注中提取上下文（简单关键词匹配）
  if (entry.note) {
    const note = entry.note.toLowerCase()
    if (note.includes('忙') || note.includes('累')) {
      contextHint = 'busy'
    } else if (note.includes('旅行') || note.includes('出差')) {
      contextHint = 'travel'
    } else if (note.includes('生病') || note.includes('不舒服')) {
      contextHint = 'sick'
    }
  }

  // 根据用户偏好或状态推荐语气
  // 这里可以根据用户设置调整
  recommendedTone = 'calm'

  return {
    effortLevel,
    moodState,
    riskFlag,
    contextHint,
    recommendedTone,
    confidence: 0.8,
  }
}

// 节点2：情绪反馈生成
export function generateEmpathyFeedback(
  entry: CheckInEntry,
  aiState: AIStateClassification
): EmpathyFeedback {
  // 80%使用模板，20%可以调用LLM（这里简化处理，都用模板）
  const tone = aiState.recommendedTone
  let templateKey = `${aiState.effortLevel}_effort` as keyof typeof FEEDBACK_TEMPLATES

  // 特殊处理暴食和低情绪
  if (aiState.riskFlag === 'binge') {
    templateKey = 'binge' as keyof typeof FEEDBACK_TEMPLATES
  } else if (aiState.moodState === 'low') {
    templateKey = 'low_mood' as keyof typeof FEEDBACK_TEMPLATES
  }

  const templates = FEEDBACK_TEMPLATES[templateKey]
  const template = templates?.[tone] || templates?.calm || {
    title: '今天辛苦了',
    empathyLine: '坚持本身就是一种胜利',
    achievementLine: '你做得很好',
    microAction: '继续加油',
  }

  return {
    title: template.title,
    empathyLine: template.empathyLine,
    achievementLine: template.achievementLine,
    microAction: template.microAction,
    styleTag: tone,
    safeLevel: 'normal',
  }
}

// 节点3：伴侣互动推荐
export function recommendCheerType(
  currentUserState: AIStateClassification,
  partnerCheckedIn: boolean,
  partnerMood?: MoodType
): CheerType {
  // 规则优先的推荐逻辑
  if (currentUserState.moodState === 'low' || currentUserState.moodState === 'anxious') {
    return 'hug'
  }
  if (currentUserState.effortLevel === 'high') {
    return 'praise'
  }
  if (currentUserState.effortLevel === 'low' || !partnerCheckedIn) {
    return 'micro_task'
  }
  return 'praise'
}

// 生成鼓励卡内容
export function generateCheerContent(
  type: CheerType,
  style: 'cute' | 'calm' | 'funny' | 'serious' = 'cute'
): string {
  const contents = {
    praise: {
      cute: '今天超棒的！继续加油💪',
      calm: '做得很好，继续保持',
      funny: '卷王本卷！',
      serious: '优秀的表现',
    },
    hug: {
      cute: '抱抱你，今天辛苦了🤗',
      calm: '理解你的感受，一起加油',
      funny: '给你一个熊抱！',
      serious: '支持你，一起坚持',
    },
    micro_task: {
      cute: '一起做个小任务吧～',
      calm: '一起完成一个小目标',
      funny: '来，一起卷！',
      serious: '一起完成今天的任务',
    },
  }

  return contents[type][style] || contents[type].cute
}

// 节点4：断卡风险预测（简化版）
export function predictChurnRisk(
  userId: string,
  checkIns: CheckInEntry[],
  lastCheckInDate?: string
): { riskScore: number; riskBucket: 'low' | 'mid' | 'high'; interventionType: 'none' | 'gentle_ping' | 'invite_partner' } {
  if (!lastCheckInDate) {
    return { riskScore: 0.5, riskBucket: 'mid', interventionType: 'gentle_ping' }
  }

  const today = new Date()
  const lastDate = new Date(lastCheckInDate)
  const daysSinceLastCheckIn = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  // 简单规则：断卡1天=中风险，2天以上=高风险
  if (daysSinceLastCheckIn === 0) {
    return { riskScore: 0.1, riskBucket: 'low', interventionType: 'none' }
  } else if (daysSinceLastCheckIn === 1) {
    return { riskScore: 0.5, riskBucket: 'mid', interventionType: 'gentle_ping' }
  } else {
    return { riskScore: 0.8, riskBucket: 'high', interventionType: 'invite_partner' }
  }
}

// 节点5：周报总结（简化版）
export function generateWeeklyRecap(
  userId: string,
  weekCheckIns: CheckInEntry[],
  weekStart: string,
  weekEnd: string
): { highlight: string; progress: string[]; nextWeekMicroGoal: string } {
  const checkInCount = weekCheckIns.length
  const exerciseDays = weekCheckIns.filter(c => c.exercises && c.exercises.length > 0).length
  const goodMoodDays = weekCheckIns.filter(c => c.mood === 'happy' || c.mood === 'excited').length

  const highlight = `本周打卡${checkInCount}天，坚持得很好！`
  const progress: string[] = []
  
  if (exerciseDays > 0) {
    progress.push(`运动${exerciseDays}天`)
  }
  if (goodMoodDays > 0) {
    progress.push(`心情不错的日子有${goodMoodDays}天`)
  }
  if (checkInCount >= 5) {
    progress.push('连续打卡表现优秀')
  }

  const nextWeekMicroGoal = checkInCount >= 5 
    ? '继续保持这个节奏' 
    : '争取打卡5天以上'

  return { highlight, progress, nextWeekMicroGoal }
}
