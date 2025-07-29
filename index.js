const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Função para executar comandos shell e retornar promessa
function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

// Função para obter dados do sistema
async function getSystemData() {
    try {
        const data = {};

        // IP do Tailscale
        try {
            data.tailscaleIP = await execPromise('tailscale ip --4');
        } catch (error) {
            data.tailscaleIP = 'Não disponível';
        }

        // Temperatura da CPU (específico para Raspberry Pi)
        try {
            const tempRaw = await execPromise('cat /sys/class/thermal/thermal_zone0/temp');
            data.cpuTemp = (parseInt(tempRaw) / 1000).toFixed(1);
        } catch (error) {
            data.cpuTemp = 'N/A';
        }

        // Uso de RAM
        try {
            const memInfo = await execPromise('free -m');
            const lines = memInfo.split('\n');
            const memLine = lines[1].split(/\s+/);
            const total = parseInt(memLine[1]);
            const used = parseInt(memLine[2]);
            data.ramUsage = Math.round((used / total) * 100);
            data.ramTotal = total;
            data.ramUsed = used;
        } catch (error) {
            data.ramUsage = 0;
            data.ramTotal = 0;
            data.ramUsed = 0;
        }

        // Uso do disco
        try {
            const diskInfo = await execPromise('df -h / | tail -1');
            const diskData = diskInfo.split(/\s+/);
            data.diskUsage = parseInt(diskData[4].replace('%', ''));
            data.diskTotal = diskData[1];
            data.diskUsed = diskData[2];
            data.diskAvailable = diskData[3];
        } catch (error) {
            data.diskUsage = 0;
            data.diskTotal = '0B';
            data.diskUsed = '0B';
            data.diskAvailable = '0B';
        }

        // Uptime
        try {
            const uptimeSeconds = os.uptime();
            const days = Math.floor(uptimeSeconds / 86400);
            const hours = Math.floor((uptimeSeconds % 86400) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            data.uptime = `${days}d ${hours}h ${minutes}m`;
        } catch (error) {
            data.uptime = 'N/A';
        }

        // Conectividade (ping para o Google DNS)
        try {
            await execPromise('ping -c 1 -W 2 8.8.8.8');
            data.connectivity = 'Estável';
        } catch (error) {
            data.connectivity = 'Instável';
        }

        // Informações adicionais do sistema
        data.hostname = os.hostname();
        data.platform = os.platform();
        data.arch = os.arch();
        data.loadAverage = os.loadavg();

        return data;
    } catch (error) {
        console.error('Erro ao obter dados do sistema:', error);
        return {
            tailscaleIP: 'Erro',
            cpuTemp: 'N/A',
            ramUsage: 0,
            diskUsage: 0,
            uptime: 'N/A',
            connectivity: 'Erro'
        };
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// API para obter dados do sistema em tempo real
app.get('/api/system-data', async (req, res) => {
    try {
        const systemData = await getSystemData();
        res.json(systemData);
    } catch (error) {
        console.error('Erro na API system-data:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API para testar conexão SNMP
app.post('/api/test-snmp', async (req, res) => {
    const { ip, comunidade } = req.body;
    
    if (!ip || !comunidade) {
        return res.status(400).json({ 
            success: false, 
            message: 'IP e comunidade são obrigatórios' 
        });
    }

    try {
        // Comando snmpwalk para testar conectividade
        const command = `snmpwalk -v2c -c ${comunidade} ${ip} 1.3.6.1.2.1.1.1.0`;
        await execPromise(command);
        
        res.json({ 
            success: true, 
            message: 'Conexão SNMP estabelecida com sucesso!' 
        });
    } catch (error) {
        res.json({ 
            success: false, 
            message: `Falha na conexão SNMP: ${error.message}` 
        });
    }
});

app.post('/salvar', (req, res) => {
    try {
        fs.writeFileSync('config.json', JSON.stringify(req.body, null, 2));
        
        // Log da configuração salva
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: 'SUCCESS',
            message: `Configuração SNMP salva para ${req.body.ip}`
        };
        
        // Salvar no log (você pode implementar um sistema de log mais robusto)
        console.log(`[${timestamp}] SUCCESS: Configuração SNMP salva para ${req.body.ip}`);
        
        res.json({ 
            success: true, 
            message: '✅ Configuração salva com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao salvar configuração' 
        });
    }
});

// API para obter logs (implementação básica)
app.get('/api/logs', (req, res) => {
    try {
        // Por enquanto, retorna logs simulados
        // Você pode implementar um sistema de log real aqui
        const logs = [
            {
                timestamp: new Date().toISOString(),
                level: 'INFO',
                message: 'Sistema iniciado com sucesso'
            },
            {
                timestamp: new Date(Date.now() - 60000).toISOString(),
                level: 'SUCCESS',
                message: 'Conectado ao dispositivo via SNMP'
            }
        ];
        
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter logs' });
    }
});

app.listen(80, () => {
    console.log('🚀 Servidor de telemetria rodando na porta 80');
    console.log('📊 Dashboard disponível em: http://localhost');
    
    // Teste inicial dos dados do sistema
    getSystemData().then(data => {
        console.log('📈 Dados do sistema carregados:', {
            tailscaleIP: data.tailscaleIP,
            cpuTemp: data.cpuTemp + '°C',
            ramUsage: data.ramUsage + '%',
            diskUsage: data.diskUsage + '%',
            uptime: data.uptime
        });
    }).catch(error => {
        console.error('❌ Erro ao carregar dados do sistema:', error.message);
    });
});
