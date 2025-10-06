import requests
import os

# Configurações do Supabase
SUPABASE_URL = "https://ubeivchkuoptmhkcglny.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZWl2Y2hrdW9wdG1oa2NnbG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTU4NDksImV4cCI6MjA3NDk5MTg0OX0.Q8hPuJsdeRKz-edKqVRTTCZo-mMtVNq1eoafJiF1St4"

# Ler o arquivo SQL
script_dir = os.path.dirname(os.path.abspath(__file__))
sql_file = os.path.join(script_dir, "create-mindmaps-tables.sql")

with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

print("=== Executando Schema de Mapas Mentais ===")
print(f"URL: {SUPABASE_URL}")
print(f"SQL: {len(sql_content)} caracteres")

# Dividir em comandos individuais
commands = []
current_command = []

for line in sql_content.split('\n'):
    line = line.strip()

    # Pular comentários e linhas vazias
    if not line or line.startswith('--'):
        continue

    current_command.append(line)

    # Se a linha termina com ;, é o fim de um comando
    if line.endswith(';'):
        commands.append(' '.join(current_command))
        current_command = []

print(f"\nTotal de comandos: {len(commands)}")

# Executar cada comando
success_count = 0
error_count = 0

for i, cmd in enumerate(commands, 1):
    print(f"\n[{i}/{len(commands)}] Executando comando...")
    print(f"Comando: {cmd[:100]}...")

    # Fazer requisição para o Supabase
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "query": cmd
        }
    )

    if response.status_code in [200, 201, 204]:
        print(f"[OK] Sucesso")
        success_count += 1
    else:
        print(f"[ERRO] Status: {response.status_code}")
        print(f"Resposta: {response.text[:200]}")
        error_count += 1

print(f"\n=== Resumo ===")
print(f"Sucessos: {success_count}")
print(f"Erros: {error_count}")
print(f"Total: {len(commands)}")
