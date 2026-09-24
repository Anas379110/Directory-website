#!/bin/bash
# .claude/hooks/pre-commit-secrets-check.sh

if git diff --cached --name-only | grep -qE '\.env$|\.pem$|\.key$'; then
  echo "❌ رُفض الـ Commit: ملف حساس ضمن التغييرات"
  exit 1
fi

if git diff --cached | grep -qiE '(service_role|supabase_service)[a-z_]*\s*[:=]\s*["\047][A-Za-z0-9._-]{20,}'; then
  echo "❌ رُفض الـ Commit: مفتاح Supabase service_role مكشوف — هذا مفتاح إداري خطير"
  exit 1
fi

if git diff --cached | grep -qiE 'api[_-]?key\s*=\s*["\047][A-Za-z0-9]{20,}'; then
  echo "❌ رُفض الـ Commit: مفتاح API صريح بالكود"
  exit 1
fi

exit 0
