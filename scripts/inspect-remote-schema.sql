-- ============================================
-- Complete Remote Schema Inspection Script
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- ============================================
-- 1. LIST ALL TABLES
-- ============================================
SELECT 
    'TABLE' as object_type,
    table_name as object_name,
    NULL as details
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 2. GET ALL COLUMNS WITH DETAILS
-- ============================================
SELECT 
    'COLUMN' as object_type,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 3. GET PRIMARY KEYS
-- ============================================
SELECT
    'PRIMARY KEY' as object_type,
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- ============================================
-- 4. GET FOREIGN KEYS
-- ============================================
SELECT
    'FOREIGN KEY' as object_type,
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 5. GET INDEXES
-- ============================================
SELECT
    'INDEX' as object_type,
    tablename as table_name,
    indexname as index_name,
    indexdef as definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 6. GET FUNCTIONS
-- ============================================
SELECT 
    'FUNCTION' as object_type,
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ============================================
-- 7. GET TRIGGERS
-- ============================================
SELECT 
    'TRIGGER' as object_type,
    trigger_name,
    event_object_table as table_name,
    action_statement,
    action_timing,
    event_manipulation,
    action_orientation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 8. GET VIEWS
-- ============================================
SELECT 
    'VIEW' as object_type,
    table_name as view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 9. GET SEQUENCES (for auto-increment columns)
-- ============================================
SELECT 
    'SEQUENCE' as object_type,
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- ============================================
-- 10. SUMMARY QUERY (Quick Overview)
-- ============================================
SELECT 
    'SUMMARY' as section,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as table_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as column_count,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as function_count,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as trigger_count,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') as view_count;

