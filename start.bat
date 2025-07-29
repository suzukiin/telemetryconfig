@echo off
echo 🚀 Script de inicialização do Dashboard de Telemetria
echo 📅 Data/Hora: %date% %time%
echo 💻 Sistema: Windows
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 💡 Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js versão:
node --version
echo ✅ NPM versão:
npm --version
echo.

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    npm install
    echo.
)

REM Verificar arquivos necessários
if not exist "index.js" (
    echo ❌ Arquivo index.js não encontrado!
    pause
    exit /b 1
)

if not exist "views\index.html" (
    echo ❌ Arquivo views\index.html não encontrado!
    pause
    exit /b 1
)

if not exist "public\style.css" (
    echo ❌ Arquivo public\style.css não encontrado!
    pause
    exit /b 1
)

echo ✅ Todos os arquivos necessários encontrados
echo.

echo 🚀 Iniciando servidor...
echo 💡 Para parar o servidor: Ctrl+C
echo 💡 Acesse: http://localhost:3000 (ou porta 80 se executar como admin)
echo.

node index.js

pause
