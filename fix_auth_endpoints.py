#!/usr/bin/env python3
"""
Script para corrigir autenticação em todos os endpoints de metas
"""
import os
import re

# Padrão antigo
OLD_PATTERN = r'''  // 1\. Authentication
  const user = event\.context\.user
  if \(!user\) \{
    throw createError\(\{ statusCode: 401, message: 'Unauthorized' \}\)
  \}

  try \{'''

# Novo padrão
NEW_PATTERN = '''  try {
    // 1. Authentication
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }'''

# Padrão para remover linha duplicada de supabase
DUPLICATE_PATTERN = r'\n    const supabase = await serverSupabaseClient\(event\)\n'

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Aplicar correção de autenticação
    content_fixed = re.sub(OLD_PATTERN, NEW_PATTERN, content, flags=re.MULTILINE)

    # Se mudou, remover linhas duplicadas de supabase
    if content_fixed != content:
        # Procurar por supabase duplicado logo após a autenticação
        content_fixed = re.sub(
            r'(const supabase = await serverSupabaseClient\(event\).*?auth\.getUser\(\).*?}\s+)' +
            r'(// \d+\..*?\n)\s+const supabase = await serverSupabaseClient\(event\)',
            r'\1\2',
            content_fixed,
            flags=re.DOTALL
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content_fixed)
        print(f"[OK] Fixed: {filepath}")
        return True
    else:
        print(f"[SKIP] Already fixed or no match: {filepath}")
        return False

# Lista de arquivos para corrigir
files = [
    r"c:\prapassar\prapassar-app\server\api\goals\[id].delete.ts",
    r"c:\prapassar\prapassar-app\server\api\goals\[id].get.ts",
    r"c:\prapassar\prapassar-app\server\api\goals\[id].put.ts",
    r"c:\prapassar\prapassar-app\server\api\goals\checklist\add.post.ts",
    r"c:\prapassar\prapassar-app\server\api\goals\checklist\toggle.post.ts",
    r"c:\prapassar\prapassar-app\server\api\goals\checklist\update.post.ts",
    r"c:\prapassar\prapassar-app\server\api\goals\checklist\[id].delete.ts",
]

fixed_count = 0
for file in files:
    if os.path.exists(file):
        if fix_file(file):
            fixed_count += 1
    else:
        print(f"[ERROR] File not found: {file}")

print(f"\n[DONE] Total: {fixed_count} files fixed")
