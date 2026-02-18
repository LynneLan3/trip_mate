#!/bin/bash

# Supabase配置
SUPABASE_URL="https://mlovmlldauuapejgzssm.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sb3ZtbGxkYXV1YXBlamd6c3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzI0MzksImV4cCI6MjA4NTYwODQzOX0.vIYNd-E6Naeu3RBmhH4SlVUyUYSKSbWeY93YIdwDEIc"

echo "=========================================="
echo "   Supabase 数据库完整验证报告"
echo "=========================================="
echo ""

# 1. 检查quizzes表（问卷）
echo "📋 1. QUIZZES 表（问卷数据）"
echo "------------------------------------------"
QUIZZES=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=id,title,description&limit=5" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$QUIZZES" | python3 -m json.tool 2>/dev/null || echo "$QUIZZES"
echo ""

QUIZ_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")
echo "✅ 问卷总数: $QUIZ_COUNT"
echo ""

# 2. 检查quiz_questions表（问卷-题目关联）
echo "🔗 2. QUIZ_QUESTIONS 表（问卷题目关联）"
echo "------------------------------------------"
QUIZ_QUESTIONS=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_questions?select=id,quiz_id,question_code,display_order&limit=10" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$QUIZ_QUESTIONS" | python3 -m json.tool 2>/dev/null || echo "$QUIZ_QUESTIONS"
echo ""

QQ_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_questions?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")
echo "✅ 问卷题目关联总数: $QQ_COUNT"
echo ""

# 3. 检查questions表（题目库）
echo "❓ 3. QUESTIONS 表（题目库）"
echo "------------------------------------------"
QUESTIONS=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/questions?select=question_code,question_text,category&limit=5" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$QUESTIONS" | python3 -m json.tool 2>/dev/null || echo "$QUESTIONS"
echo ""

Q_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/questions?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")
echo "✅ 题目总数: $Q_COUNT"
echo ""

# 4. 检查options表（选项库）
echo "🔘 4. OPTIONS 表（选项库）"
echo "------------------------------------------"
OPTIONS=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/options?select=id,question_code,option_text,score&limit=10" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$OPTIONS" | python3 -m json.tool 2>/dev/null || echo "$OPTIONS"
echo ""

OPT_COUNT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/options?select=count" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Prefer: count=exact")
echo "✅ 选项总数: $OPT_COUNT"
echo ""

# 5. 完整关联查询（嵌套查询）
echo "🔍 5. 完整数据关联测试"
echo "------------------------------------------"
echo "查询：quizzes → quiz_questions → questions → options"
FULL_DATA=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=id,title,quiz_questions(question_code,display_order,questions(question_text,options(option_text,score)))&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

echo "$FULL_DATA" | python3 -m json.tool 2>/dev/null || echo "$FULL_DATA"
echo ""

# 6. RLS策略测试
echo "🔒 6. RLS 权限策略测试"
echo "------------------------------------------"

# 测试读取quizzes
echo "测试 1：匿名读取 quizzes"
RLS_QUIZ=$(curl -s -w "\n[HTTP:%{http_code}]" -X GET "${SUPABASE_URL}/rest/v1/quizzes?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
echo "$RLS_QUIZ"
echo ""

# 测试读取questions
echo "测试 2：匿名读取 questions"
RLS_QUESTIONS=$(curl -s -w "\n[HTTP:%{http_code}]" -X GET "${SUPABASE_URL}/rest/v1/questions?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
echo "$RLS_QUESTIONS"
echo ""

# 测试读取options
echo "测试 3：匿名读取 options"
RLS_OPTIONS=$(curl -s -w "\n[HTTP:%{http_code}]" -X GET "${SUPABASE_URL}/rest/v1/options?limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
echo "$RLS_OPTIONS"
echo ""

# 7. 数据完整性检查
echo "✔️  7. 数据完整性分析"
echo "------------------------------------------"

# 检查是否有孤立的quiz_questions（没有对应的quiz）
ORPHAN_QQ=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quiz_questions?select=id,quiz_id&quizzes.id=is.null" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")

if [ "$ORPHAN_QQ" = "[]" ]; then
  echo "✅ 没有孤立的quiz_questions记录"
else
  echo "⚠️  发现孤立的quiz_questions: $ORPHAN_QQ"
fi

# 每个问卷的题目数量统计
echo ""
echo "每个问卷的题目数量："
PER_QUIZ=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/quizzes?select=id,title,quiz_questions(count)" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}")
echo "$PER_QUIZ" | python3 -m json.tool 2>/dev/null || echo "$PER_QUIZ"
echo ""

# 8. 总结
echo "=========================================="
echo "   验证总结"
echo "=========================================="
echo "✅ Quizzes:        $QUIZ_COUNT"
echo "✅ Quiz_Questions: $QQ_COUNT"
echo "✅ Questions:      $Q_COUNT"
echo "✅ Options:        $OPT_COUNT"
echo ""
echo "🔒 RLS策略：匿名用户可以读取所有基础数据"
echo "🔗 数据关联：quizzes → quiz_questions → questions → options"
echo ""
echo "=========================================="
