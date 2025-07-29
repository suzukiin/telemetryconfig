# 🚀 Dashboard de Telemetria - Raspberry Pi

Dashboard completo para monitoramento de telemetria SNMP em Raspberry Pi, acessível via Tailscale.

## 📋 Características

- 📊 **Monitoramento em tempo real** do sistema Raspberry Pi
- 🌡️ **Temperatura da CPU** (específico para RPi)
- 💾 **Uso de RAM e disco** em tempo real
- 🌐 **IP do Tailscale** automático
- ⚙️ **Configuração SNMP** com interface amigável
- 🧪 **Teste de conexão SNMP** integrado
- 📝 **Sistema de logs** em tempo real
- 📱 **Interface responsiva** para mobile e desktop

## 🛠️ Instalação

### Pré-requisitos

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar ferramentas SNMP (opcional)
sudo apt install snmp snmp-utils -y

# Instalar Tailscale (se não tiver)
curl -fsSL https://tailscale.com/install.sh | sh
```

### Instalação do Dashboard

```bash
# Clonar ou copiar os arquivos do projeto
cd /home/pi  # ou diretório de sua escolha

# Instalar dependências
npm install

# Dar permissão ao script de inicialização
chmod +x start.sh
```

## 🚀 Execução

### Opção 1: Script automático (recomendado)
```bash
./start.sh
```

### Opção 2: Execução manual
```bash
# Porta 3000 (sem sudo)
node index.js

# Porta 80 (com sudo)
sudo node index.js
```

### Opção 3: NPM script
```bash
npm start
```

## 🌐 Acesso

- **Local**: `http://localhost` (porta 80) ou `http://localhost:3000`
- **Rede local**: `http://[IP-do-raspberry]` ou `http://[IP-do-raspberry]:3000`
- **Via Tailscale**: `http://[tailscale-ip]` ou `http://[tailscale-ip]:3000`

## 📊 Dados Monitorados

### Sistema Raspberry Pi
- 🌡️ **Temperatura CPU**: Leitura direta do sensor térmico
- 💾 **RAM**: Uso atual e total disponível
- 💽 **Disco**: Espaço usado e disponível
- ⏱️ **Uptime**: Tempo que o sistema está ligado
- 🌐 **IP Tailscale**: Endereço VPN atual
- 📡 **Conectividade**: Status da conexão à internet

### Configuração SNMP
- 🖥️ **IP do equipamento** a ser monitorado
- 🔑 **Comunidade SNMP** para autenticação
- 📋 **OIDs** personalizáveis
- ⏲️ **Intervalo** de coleta configurável
- ⏱️ **Timeout** SNMP ajustável

## 🔧 Solução de Problemas

### Servidor não inicia
```bash
# Verificar se a porta está em uso
sudo netstat -tlnp | grep :80

# Verificar logs do Node.js
node index.js  # Ver mensagens de erro

# Executar script de diagnóstico
./start.sh
```

### Erro de permissão na porta 80
```bash
# Usar sudo para porta 80
sudo node index.js

# Ou usar porta 3000 sem sudo
node index.js
```

### Dados não aparecem
```bash
# Verificar comandos do sistema
free -m  # RAM
df -h    # Disco
cat /sys/class/thermal/thermal_zone0/temp  # Temperatura
tailscale ip --4  # IP Tailscale
```

### SNMP não funciona
```bash
# Instalar ferramentas SNMP
sudo apt install snmp snmp-utils

# Testar manualmente
snmpwalk -v2c -c public [IP] 1.3.6.1.2.1.1.1.0
```

## 📁 Estrutura do Projeto

```
📂 projeto/
├── 📄 index.js          # Servidor principal
├── 📄 package.json      # Dependências
├── 📄 start.sh          # Script Linux/Mac
├── 📄 start.bat         # Script Windows
├── 📄 README.md         # Documentação
├── 📂 views/
│   └── 📄 index.html    # Interface principal
└── 📂 public/
    └── 📄 style.css     # Estilos CSS
```

## 🔄 APIs Disponíveis

- `GET /` - Dashboard principal
- `GET /api/system-data` - Dados do sistema em JSON
- `POST /api/test-snmp` - Teste de conexão SNMP
- `POST /salvar` - Salvar configuração SNMP
- `GET /api/logs` - Logs do sistema

## 💡 Dicas

1. **Autostart**: Adicione ao `crontab` para iniciar automaticamente:
   ```bash
   @reboot cd /caminho/do/projeto && ./start.sh
   ```

2. **Firewall**: Libere a porta se necessário:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 3000
   ```

3. **Logs persistentes**: Os logs aparecem no console do Node.js

4. **Backup**: Faça backup do arquivo `config.json` com suas configurações

## 📝 Licença

ISC License - Use livremente para projetos pessoais e comerciais.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

---

**Desenvolvido para Raspberry Pi com ❤️**
