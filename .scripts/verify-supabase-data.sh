#!/bin/bash

# Supabase配置
SUPABASE_URL="https://mlovmlldauuapejgzssm.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb3ZtbGxkYXV1YXBlamd6c3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzI0MzksImV4cCI6MjA4NTYwODQzOX0.vIYNd-E6Naeu3RBmhH4SlVUyUYSKSbWeY93YIdwDEIc"

echo "======================================"
echo "Supabase 数据验证报告"
echo "======================================"
echo ""

# 1. 检查quizzes表
echo "1️⃣  检查 quizzes 表..."
echo "----------------------------------------"
QUIZZES_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=*" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "响应: $QUIZZES_RESPONSE" | jq '.'
QUIZZES_COUNT=$(echo "$QUIZZES_RESPONSE" | jq '. | length')
echo "✅ 找到 $QUIZZES_COUNT 个问卷"
echo ""

# 2. 检查quiz_questions表（关联题目）
echo "2️⃣  检查 quiz_questions 表及关联..."
echo "----------------------------------------"
QUESTIONS_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_questions?select=id,quiz_id,question_text,question_type&limit=100" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "响应: $QUESTIONS_RESPONSE" | jq '.'
QUESTIONS_COUNT=$(echo "$QUESTIONS_RESPONSE" | jq '. | length')
echo "✅ 找到 $QUESTIONS_COUNT 个题目"
echo ""

# 按问卷分组统计
if [ "$QUESTIONS_COUNT" -gt 0 ]; then
  echo "📊 每个问卷的题目数量："
  echo "$QUESTIONS_RESPONSE" | jq -r 'group_by(.quiz_id) | .[] | "\(.[] | .quiz_id): \(length)个题目"' | sort -u
  echo ""
fi

# 3. 检查quiz_options表（选项数据）
echo "3️⃣  检查 quiz_options 表..."
echo "----------------------------------------"
OPTIONS_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_options?select=id,question_id,option_text&limit=100" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "响应: $OPTIONS_RESPONSE" | jq '.'
OPTIONS_COUNT=$(echo "$OPTIONS_RESPONSE" | jq '. | length')
echo "✅ 找到 $OPTIONS_COUNT 个选项"
echo ""

# 4. 测试RLS策略 - 尝试读取特定问卷
echo "4️⃣  测试 RLS 策略（匿名读取）..."
echo "----------------------------------------"
if [ "$QUIZZES_COUNT" -gt 0 ]; then
  FIRST_QUIZ_ID=$(echo "$QUIZZES_RESPONSE" | jq -r '.[0].id')
  echo "尝试读取问卷 ID: $FIRST_QUIZ_ID"
  
  SINGLE_QUIZ=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?id=eq.${FIRST_QUIZ_ID}&select=*" \
    -H "apikey: ${ANON_KEY}" \
    -H "Authorization: Bearer ${ANON_KEY}")
  
  echo "单个问卷响应: $SINGLE_QUIZ" | jq '.'
  
  if [ "$(echo "$SINGLE_QUIZ" | jq '. | length')" -gt 0 ]; then
    echo "✅ RLS策略允许匿名读取问卷"
  else
    echo "❌ RLS策略可能阻止了匿名读取"
  fi
else
  echo "⚠️  没有问卷数据，跳过RLS测试"
fi
echo ""

# 5. 完整性检查
echo "5️⃣  数据完整性检查..."
echo "----------------------------------------"
if [ "$QUIZZES_COUNT" -eq 0 ]; then
  echo "❌ 问题：quizzes表为空"
  NEEDS_DATA=true
fi

if [ "$QUESTIONS_COUNT" -eq 0 ]; then
  echo "❌ 问题：quiz_questions表为空"
  NEEDS_DATA=true
fi

if [ "$OPTIONS_COUNT" -eq 0 ]; then
  echo "❌ 问题：quiz_options表为空"
  NEEDS_DATA=true
fi

if [ "$QUIZZES_COUNT" -gt 0 ] && [ "$QUESTIONS_COUNT" -gt 0 ] && [ "$OPTIONS_COUNT" -gt 0 ]; then
  echo "✅ 数据完整性良好"
  NEEDS_DATA=false
else
  NEEDS_DATA=true
fi
echo ""

# 6. 如果需要数据，提供插入脚本
if [ "$NEEDS_DATA" = true ]; then
  echo "6️⃣  需要插入测试数据"
  echo "----------------------------------------"
  echo "正在准备测试数据..."
  
  # 创建测试问卷
  echo ""
  echo "插入测试问卷..."
  INSERT_QUIZ=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/quizzes" \
    -H "apikey: ${ANON_KEY}" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d '{
      "title": "人格测试 - 你是哪种动物？",
      "description": "通过5个有趣的问题，发现你的内在人格特质",
      "category": "personality",
      "image_url": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800",
      "is_public": true
    }')
  
  echo "问卷插入响应: $INSERT_QUIZ" | jq '.'
  NEW_QUIZ_ID=$(echo "$INSERT_QUIZ" | jq -r '.[0].id // empty')
  
  if [ -n "$NEW_QUIZ_ID" ]; then
    echo "✅ 成功创建测试问卷，ID: $NEW_QUIZ_ID"
    
    # 插入测试题目
    echo ""
    echo "插入测试题目..."
    INSERT_QUESTIONS=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/quiz_questions" \
      -H "apikey: ${ANON_KEY}" \
      -H "Authorization: Bearer ${ANON_KEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=representation" \
      -d "[
        {
          \"quiz_id\": \"${NEW_QUIZ_ID}\",
          \"question_text\": \"周末你更喜欢做什么？\",
          \"question_type\": \"single\",
          \"order_num\": 1
        },
        {
          \"quiz_id\": \"${NEW_QUIZ_ID}\",
          \"question_text\": \"遇到困难时，你会？\",
          \"question_type\": \"single\",
          \"order_num\": 2
        },
        {
          \"quiz_id\": \"${NEW_QUIZ_ID}\",
          \"question_text\": \"你的朋友会怎么形容你？\",
          \"question_type\": \"single\",
          \"order_num\": 3
        }
      ]")
    
    echo "题目插入响应: $INSERT_QUESTIONS" | jq '.'
    QUESTION_IDS=($(echo "$INSERT_QUESTIONS" | jq -r '.[].id'))
    
    if [ ${#QUESTION_IDS[@]} -gt 0 ]; then
      echo "✅ 成功创建 ${#QUESTION_IDS[@]} 个题目"
      
      # 为第一个题目插入选项
      echo ""
      echo "为题目插入选项..."
      INSERT_OPTIONS=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/quiz_options" \
        -H "apikey: ${ANON_KEY}" \
        -H "Authorization: Bearer ${ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "[
          {
            \"question_id\": \"${QUESTION_IDS[0]}\",
            \"option_text\": \"在家休息，看书或看电影\",
            \"order_num\": 1
          },
          {
            \"question_id\": \"${QUESTION_IDS[0]}\",
            \"option_text\": \"和朋友出去聚会\",
            \"order_num\": 2
          },
          {
            \"question_id\": \"${QUESTION_IDS[0]}\",
            \"option_text\": \"去户外冒险\",
            \"order_num\": 3
          },
          {
            \"question_id\": \"${QUESTION_IDS[1]}\",
            \"option_text\": \"冷静分析，制定计划\",
            \"order_num\": 1
          },
          {
            \"question_id\": \"${QUESTION_IDS[1]}\",
            \"option_text\": \"寻求他人帮助\",
            \"order_num\": 2
          },
          {
            \"question_id\": \"${QUESTION_IDS[1]}\",
            \"option_text\": \"直面挑战，勇往直前\",
            \"order_num\": 3
          },
          {
            \"question_id\": \"${QUESTION_IDS[2]}\",
            \"option_text\": \"聪明、理性\",
            \"order_num\": 1
          },
          {
            \"question_id\": \"${QUESTION_IDS[2]}\",
            \"option_text\": \"热情、友善\",
            \"order_num\": 2
          },
          {
            \"question_id\": \"${QUESTION_IDS[2]}\",
            \"option_text\": \"勇敢、冒险\",
            \"order_num\": 3
          }
        ]")
      
      echo "选项插入响应: $INSERT_OPTIONS" | jq '.'
      OPTIONS_INSERTED=$(echo "$INSERT_OPTIONS" | jq '. | length')
      echo "✅ 成功创建 $OPTIONS_INSERTED 个选项"
    else
      echo "❌ 题目创建失败"
    fi
  else
    echo "❌ 问卷创建失败"
    echo "错误信息: $INSERT_QUIZ"
  fi
else
  echo "6️⃣  数据已存在，无需插入"
fi

echo ""
echo "======================================"
echo "验证完成"
echo "======================================"
