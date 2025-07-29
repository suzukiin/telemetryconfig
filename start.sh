#!/bin/bash

echo "🚀 Script de inicialização do Dashboard de Telemetria"
echo "📅 Data/Hora: $(date)"
echo "💻 Sistema: $(uname -a)"
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "💡 Para instalar: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

echo "✅ Node.js versão: $(node --version)"
echo "✅ NPM versão: $(npm --version)"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Verificar arquivos necessários
if [ ! -f "index.js" ]; then
    echo "❌ Arquivo index.js não encontrado!"
    exit 1
fi

if [ ! -f "views/index.html" ]; then
    echo "❌ Arquivo views/index.html não encontrado!"
    exit 1
fi

if [ ! -f "public/style.css" ]; then
    echo "❌ Arquivo public/style.css não encontrado!"
    exit 1
fi

echo "✅ Todos os arquivos necessários encontrados"
echo ""

# Verificar se a porta 80 está disponível
if sudo netstat -tlnp | grep :80 > /dev/null; then
    echo "⚠️  Porta 80 já está em uso"
    echo "💡 O servidor tentará usar a porta 3000 automaticamente"
    echo ""
fi

# Verificar comandos opcionais
echo "🔍 Verificando comandos opcionais:"

if command -v tailscale &> /dev/null; then
    echo "✅ Tailscale encontrado - IP será exibido"
    tailscale status --json > /dev/null 2>&1 && echo "   • Status: Conectado" || echo "   • Status: Desconectado"
else
    echo "⚠️  Tailscale não encontrado - IP não será exibido"
fi

if command -v snmpwalk &> /dev/null; then
    echo "✅ SNMP tools encontrados - Teste de conexão funcionará"
else
    echo "⚠️  SNMP tools não encontrados"
    echo "   • Para instalar: sudo apt install snmp snmp-utils"
fi

if [ -r "/sys/class/thermal/thermal_zone0/temp" ]; then
    echo "✅ Sensor de temperatura encontrado"
else
    echo "⚠️  Sensor de temperatura não encontrado"
fi

echo ""
echo "🚀 Iniciando servidor..."
echo "💡 Para executar com privilégios de porta 80: sudo node index.js"
echo "💡 Para executar sem sudo (porta 3000): node index.js"
echo "💡 Para parar o servidor: Ctrl+C"
echo ""

# Executar o servidor
if [ "$EUID" -eq 0 ]; then
    echo "🔑 Executando como root (porta 80)"
    node index.js
else
    echo "👤 Executando como usuário (porta 3000)"
    node index.js
fi
