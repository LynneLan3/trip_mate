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
QUIZZES_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=id,title,category,is_public" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$QUIZZES_RESPONSE"
echo ""

# 2. 检查quiz_questions表
echo "2️⃣  检查 quiz_questions 表..."
echo "----------------------------------------"
QUESTIONS_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_questions?select=id,quiz_id,question_text,question_type,order_num" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$QUESTIONS_RESPONSE"
echo ""

# 3. 检查quiz_options表
echo "3️⃣  检查 quiz_options 表..."
echo "----------------------------------------"
OPTIONS_RESPONSE=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_options?select=id,question_id,option_text,order_num&limit=20" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$OPTIONS_RESPONSE"
echo ""

# 4. 检查完整的问卷数据（包含关联）
echo "4️⃣  检查完整问卷数据（嵌套查询）..."
echo "----------------------------------------"
FULL_QUIZ=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=id,title,category,quiz_questions(id,question_text,quiz_options(id,option_text))&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$FULL_QUIZ"
echo ""

# 5. 测试RLS - 尝试匿名访问
echo "5️⃣  测试 RLS 策略..."
echo "----------------------------------------"
echo "测试匿名读取quizzes（应该成功）："
RLS_TEST=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "${SUPABASE_URL}/rest/v1/quizzes?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$RLS_TEST"
echo ""

# 6. 检查问卷数量
echo "6️⃣  统计数据..."
echo "----------------------------------------"
QUIZ_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")

QUESTION_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_questions?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")

OPTION_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_options?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")

echo "问卷数量: $QUIZ_COUNT"
echo "题目数量: $QUESTION_COUNT"
echo "选项数量: $OPTION_COUNT"
echo ""

echo "======================================"
echo "验证完成"
echo "======================================"
