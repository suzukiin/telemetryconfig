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
                oid: `${this.baseOid}.1.2.1.1.0`,
                name: 'Potência Programada',
                unit: 'W',
                description: 'Potência RF programada de saída',
                type: 'power',
                mask: 0.01
            },
            forwardPower: {
                oid: `${this.baseOid}.1.2.1.2.0`,
                name: 'Potência Direta',
                unit: 'W', 
                description: 'Potência RF total medida na saída',
                type: 'power',
                mask: 0.01
            },
            reflectedPower: {
                oid: `${this.baseOid}.1.2.1.3.0`,
                name: 'Potência Refletida',
                unit: 'W',
                description: 'Potência RF refletida medida na saída',
                type: 'power',
                mask: 0.01
            },
            
            // Temperatura Power Amplifier
            paTemperature: {
                oid: `${this.baseOid}.1.2.5.2.0`,
                name: 'Temperatura PA',
                unit: '°C',
                description: 'Temperatura do amplificador de potência',
                type: 'temperature',
                mask: 0.01
            },
            
            // Correntes
            paCurrent: {
                oid: `${this.baseOid}.1.2.5.1.0`,
                name: 'Corrente PA',
                unit: 'A',
                description: 'Corrente consumida pelo amplificador de potência',
                type: 'current',
                mask: 0.01
            },
        };
        
        // ===== ALARMES PRINCIPAIS =====
        this.alarms = {
            // Alarmes de Potência
            outputPowerZero: {
                oid: `${this.baseOid}.1.3.1.27.0`,
                name: 'Potência de Saída Zero',
                description: 'Potência RF programada mas sem leitura de retorno',
                severity: 'critical',
                type: 'power'
            },
            reflectedPowerError: {
                oid: `${this.baseOid}.1.3.1.58.0`,
                name: 'Erro Potência Refletida',
                description: 'Erro na medição de potência refletida',
                severity: 'warning',
                type: 'power'
            },
            reducedPower: {
                oid: `${this.baseOid}.1.3.1.53.0`,
                name: 'Potência Reduzida',
                description: 'Potência reduzida por potência refletida ou falha SFN',
                severity: 'warning',
                type: 'power'
            },
            
            // Alarmes de Temperatura
            paTemperature: {
                oid: `${this.baseOid}.1.3.1.34.0`,
                name: 'Temperatura PA Alta',
                description: 'Temperatura do amplificador acima de 75°C',
                severity: 'warning',
                type: 'temperature'
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
