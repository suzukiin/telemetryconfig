// Módulo para parsing e interpretação do arquivo MIB SOCEXCITER
const fs = require('fs');
const path = require('path');

class MIBParser {
    constructor() {
        this.measurements = {};
        this.alarms = {};
        this.baseOid = '1.3.6.1.4.1.25026.7'; // enterprises.linear.ec710lp
        this.parseMIB();
    }

    parseMIB() {
        // Definições principais baseadas no arquivo MIB SOCEXCITER
        
        // ===== MEDIÇÕES PRINCIPAIS =====
        this.measurements = {
            // Potência RF
            programmedPower: {
                oid: `${this.baseOid}.2.1.1`,
                name: 'Potência Programada',
                unit: 'W',
                description: 'Potência RF programada de saída',
                type: 'power',
                mask: 0.01
            },
            forwardPower: {
                oid: `${this.baseOid}.2.1.2`,
                name: 'Potência Direta',
                unit: 'W', 
                description: 'Potência RF total medida na saída',
                type: 'power',
                mask: 0.01
            },
            reflectedPower: {
                oid: `${this.baseOid}.2.1.3`,
                name: 'Potência Refletida',
                unit: 'W',
                description: 'Potência RF refletida medida na saída',
                type: 'power',
                mask: 0.01
            },
            
            // Temperatura Power Amplifier
            paTemperature: {
                oid: `${this.baseOid}.2.5.2`,
                name: 'Temperatura PA',
                unit: '°C',
                description: 'Temperatura do amplificador de potência',
                type: 'temperature',
                mask: 0.1
            },
            
            // Correntes
            paCurrent: {
                oid: `${this.baseOid}.2.5.1`,
                name: 'Corrente PA',
                unit: 'A',
                description: 'Corrente consumida pelo amplificador de potência',
                type: 'current',
                mask: 0.01
            },
            
            // Fontes de Alimentação
            powerSupply3v3: {
                oid: `${this.baseOid}.2.1.3`,
                name: 'Fonte 3.3V',
                unit: 'V',
                description: 'Tensão da fonte de 3.3V',
                type: 'voltage',
                mask: 0.1
            },
            powerSupply5v: {
                oid: `${this.baseOid}.2.1.4`,
                name: 'Fonte 5V',
                unit: 'V', 
                description: 'Tensão da fonte de 5V',
                type: 'voltage',
                mask: 0.1
            },
            powerSupply15v: {
                oid: `${this.baseOid}.2.1.5`,
                name: 'Fonte 15V',
                unit: 'V',
                description: 'Tensão da fonte de 15V',
                type: 'voltage',
                mask: 0.1
            },
            powerSupply28v: {
                oid: `${this.baseOid}.2.1.6`,
                name: 'Fonte 28V',
                unit: 'V',
                description: 'Tensão da fonte de 28V',
                type: 'voltage',
                mask: 0.1
            },
            powerSupply1_50v: {
                oid: `${this.baseOid}.2.2.1`,
                name: 'Fonte 1 - 50V',
                unit: 'V',
                description: 'Tensão da fonte de alimentação 1 (+50V)',
                type: 'voltage',
                mask: 0.1
            },
            powerSupply2_50v: {
                oid: `${this.baseOid}.2.3.1`,
                name: 'Fonte 2 - 50V',
                unit: 'V',
                description: 'Tensão da fonte de alimentação 2 (+50V)',
                type: 'voltage',
                mask: 0.1
            },
            powerSupply1Current: {
                oid: `${this.baseOid}.2.2.2`,
                name: 'Corrente Fonte 1',
                unit: 'A',
                description: 'Corrente total consumida pela fonte 1',
                type: 'current',
                mask: 0.1
            },
            powerSupply2Current: {
                oid: `${this.baseOid}.2.3.2`,
                name: 'Corrente Fonte 2',
                unit: 'A',
                description: 'Corrente total consumida pela fonte 2',
                type: 'current',
                mask: 0.1
            },
            powerSupply1Temperature: {
                oid: `${this.baseOid}.2.2.5`,
                name: 'Temp. Fonte 1',
                unit: '°C',
                description: 'Temperatura da fonte de alimentação 1',
                type: 'temperature',
                mask: 0.1
            },
            powerSupply2Temperature: {
                oid: `${this.baseOid}.2.3.5`,
                name: 'Temp. Fonte 2', 
                unit: '°C',
                description: 'Temperatura da fonte de alimentação 2',
                type: 'temperature',
                mask: 0.1
            },
            
            // Sintonizador Satélite
            satelliteTunerStatus: {
                oid: `${this.baseOid}.2.6.1`,
                name: 'Status Sintonizador',
                unit: '',
                description: 'Status do sintonizador de satélite (Locked/Unlocked)',
                type: 'status',
                values: { 0: 'Unlocked', 1: 'Locked' }
            },
            satelliteTunerSnr: {
                oid: `${this.baseOid}.2.6.2`,
                name: 'SNR Satélite',
                unit: 'dB',
                description: 'Relação sinal/ruído do sintonizador de satélite',
                type: 'signal',
                mask: 0.01
            },
            satelliteTunerRxLevel: {
                oid: `${this.baseOid}.2.6.3`,
                name: 'Nível RX Satélite',
                unit: 'dBm',
                description: 'Nível de sinal recebido do satélite',
                type: 'signal',
                mask: 0.01
            }
        };
        
        // ===== ALARMES PRINCIPAIS =====
        this.alarms = {
            // Alarmes de Potência
            outputPowerZero: {
                oid: `${this.baseOid}.3.1.1`,
                name: 'Potência de Saída Zero',
                description: 'Potência RF programada mas sem leitura de retorno',
                severity: 'critical',
                type: 'power'
            },
            overdriveLowPower: {
                oid: `${this.baseOid}.3.1.2`,
                name: 'Potência Excessiva',
                description: 'Potência do transmissor excedeu 20% do limite máximo',
                severity: 'warning',
                type: 'power'
            },
            reflectedPowerError: {
                oid: `${this.baseOid}.3.1.24`,
                name: 'Erro Potência Refletida',
                description: 'Erro na medição de potência refletida',
                severity: 'warning',
                type: 'power'
            },
            reducedPower: {
                oid: `${this.baseOid}.3.1.25`,
                name: 'Potência Reduzida',
                description: 'Potência reduzida por potência refletida ou falha SFN',
                severity: 'warning',
                type: 'power'
            },
            
            // Alarmes de Temperatura
            paTemperature: {
                oid: `${this.baseOid}.3.1.34`,
                name: 'Temperatura PA Alta',
                description: 'Temperatura do amplificador acima de 75°C',
                severity: 'warning',
                type: 'temperature'
            },
            superCriticalPaTemperature: {
                oid: `${this.baseOid}.3.1.33`,
                name: 'Temperatura PA Crítica',
                description: 'Temperatura do amplificador acima de 90°C',
                severity: 'critical',
                type: 'temperature'
            },
            
            // Alarmes de Fonte de Alimentação
            psu1CommFail: {
                oid: `${this.baseOid}.3.1.36`,
                name: 'Falha Comunicação PSU1',
                description: 'Falha de comunicação com a fonte de alimentação 1',
                severity: 'critical',
                type: 'power_supply'
            },
            psu2CommFail: {
                oid: `${this.baseOid}.3.1.43`,
                name: 'Falha Comunicação PSU2',
                description: 'Falha de comunicação com a fonte de alimentação 2',
                severity: 'critical',
                type: 'power_supply'
            },
            psu1HighCurrent: {
                oid: `${this.baseOid}.3.1.37`,
                name: 'Corrente PSU1 Alta',
                description: 'Corrente da fonte 1 acima de 23A',
                severity: 'warning',
                type: 'power_supply'
            },
            psu2HighCurrent: {
                oid: `${this.baseOid}.3.1.44`,
                name: 'Corrente PSU2 Alta',
                description: 'Corrente da fonte 2 acima de 23A',
                severity: 'warning',
                type: 'power_supply'
            },
            psu1HighTemp: {
                oid: `${this.baseOid}.3.1.39`,
                name: 'Temperatura PSU1 Alta',
                description: 'Temperatura da fonte 1 acima de 58°C',
                severity: 'warning',
                type: 'power_supply'
            },
            psu2HighTemp: {
                oid: `${this.baseOid}.3.1.46`,
                name: 'Temperatura PSU2 Alta',
                description: 'Temperatura da fonte 2 acima de 58°C',
                severity: 'warning',
                type: 'power_supply'
            },
            
            // Alarmes de Tensão
            v50EqpFail: {
                oid: `${this.baseOid}.3.1.11`,
                name: 'Falha +50V',
                description: 'Falha na fonte de alimentação +50V',
                severity: 'critical',
                type: 'voltage'
            },
            v15ExcFail: {
                oid: `${this.baseOid}.3.1.12`,
                name: 'Falha +15V',
                description: 'Falha na fonte de alimentação +15V',
                severity: 'critical',
                type: 'voltage'
            },
            v28ExcFail: {
                oid: `${this.baseOid}.3.1.13`,
                name: 'Falha +28V',
                description: 'Falha na fonte de alimentação +28V',
                severity: 'critical',
                type: 'voltage'
            },
            v3v3ExcFail: {
                oid: `${this.baseOid}.3.1.14`,
                name: 'Falha +3.3V',
                description: 'Falha na fonte de alimentação +3.3V',
                severity: 'critical',
                type: 'voltage'
            },
            
            // Alarmes de Sistema
            clockLockFail: {
                oid: `${this.baseOid}.3.1.8`,
                name: 'Falha Lock Clock',
                description: 'Perda de LOCK (PLL do Modulador)',
                severity: 'critical',
                type: 'system'
            },
            rfLoadFan: {
                oid: `${this.baseOid}.3.1.15`,
                name: 'Falha Ventilador',
                description: 'Falha no ventilador do PA e/ou FPGA',
                severity: 'warning',
                type: 'cooling'
            },
            fpgaCommun: {
                oid: `${this.baseOid}.3.1.19`,
                name: 'Falha Comunicação FPGA',
                description: 'Falha de comunicação FPGA com o Sistema Operacional',
                severity: 'critical',
                type: 'system'
            }
        };
    }

    getMeasurements() {
        return this.measurements;
    }

    getAlarms() {
        return this.alarms;
    }

    getMeasurementOids() {
        return Object.keys(this.measurements).map(key => ({
            key,
            oid: this.measurements[key].oid,
            name: this.measurements[key].name,
            unit: this.measurements[key].unit,
            type: this.measurements[key].type
        }));
    }

    getAlarmOids() {
        return Object.keys(this.alarms).map(key => ({
            key,
            oid: this.alarms[key].oid,
            name: this.alarms[key].name,
            severity: this.alarms[key].severity,
            type: this.alarms[key].type
        }));
    }

    formatValue(key, rawValue) {
        const measurement = this.measurements[key];
        if (!measurement) return rawValue;

        if (measurement.mask) {
            return (parseInt(rawValue) * measurement.mask).toFixed(2);
        }

        if (measurement.values) {
            return measurement.values[rawValue] || rawValue;
        }

        return rawValue;
    }

    getAlarmStatus(key, rawValue) {
        const alarm = this.alarms[key];
        if (!alarm) return null;

        const isActive = parseInt(rawValue) === 1;
        return {
            active: isActive,
            name: alarm.name,
            description: alarm.description,
            severity: alarm.severity,
            type: alarm.type
        };
    }

    getCriticalMeasurements() {
        return [
            'forwardPower',
            'reflectedPower',
            'paTemperature',
            'paCurrent',
            'powerSupply1_50v',
            'powerSupply2_50v',
            'satelliteTunerStatus',
            'satelliteTunerSnr'
        ];
    }

    getCriticalAlarms() {
        return [
            'outputPowerZero',
            'superCriticalPaTemperature',
            'paTemperature',
            'psu1CommFail',
            'psu2CommFail',
            'clockLockFail',
            'v50EqpFail',
            'fpgaCommun'
        ];
    }
}

module.exports = MIBParser;
