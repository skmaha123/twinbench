import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import {
  Zap, Droplets, Fuel, Car, Building2, Bot, Plane, Box, Wind, Heart, User, Atom, Orbit,
  Radar, Fan, Waves, Factory, AlertTriangle,
  CheckCircle2, RotateCcw, Radio, Plus, Trash2, X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Built-in machine parameter schemas                                 */
/* ------------------------------------------------------------------ */

const DEFAULT_OBJECT_TYPES = {
  motor: {
    label: 'Induction Motor',
    subtitle: '3-phase squirrel-cage, 15 kW',
    icon: Zap,
    driveParam: 'rpm',
    params: [
      { key: 'rpm', label: 'Rotational Speed', unit: 'RPM', min: 0, max: 3600, nominal: 1800, step: 10 },
      { key: 'temperature', label: 'Winding Temp', unit: '°C', min: 20, max: 160, nominal: 75, step: 1 },
      { key: 'vibration', label: 'Vibration', unit: 'mm/s', min: 0, max: 12, nominal: 2.5, step: 0.1 },
      { key: 'current', label: 'Current Draw', unit: 'A', min: 0, max: 90, nominal: 35, step: 0.5 },
      { key: 'load', label: 'Load', unit: '%', min: 0, max: 120, nominal: 75, step: 1 },
    ],
  },
  pump: {
    label: 'Centrifugal Pump',
    subtitle: 'Single-stage, end-suction',
    icon: Droplets,
    driveParam: 'rpm',
    params: [
      { key: 'flowRate', label: 'Flow Rate', unit: 'L/min', min: 0, max: 500, nominal: 250, step: 5 },
      { key: 'pressure', label: 'Discharge Pressure', unit: 'bar', min: 0, max: 16, nominal: 8, step: 0.2 },
      { key: 'rpm', label: 'Rotational Speed', unit: 'RPM', min: 0, max: 3000, nominal: 1450, step: 10 },
      { key: 'temperature', label: 'Bearing Temp', unit: '°C', min: 20, max: 120, nominal: 60, step: 1 },
      { key: 'vibration', label: 'Vibration', unit: 'mm/s', min: 0, max: 10, nominal: 2, step: 0.1 },
    ],
  },
  engine: {
    label: 'Diesel Genset Engine',
    subtitle: '4-cylinder, water-cooled',
    icon: Fuel,
    driveParam: 'rpm',
    params: [
      { key: 'rpm', label: 'Rotational Speed', unit: 'RPM', min: 600, max: 6000, nominal: 2500, step: 10 },
      { key: 'temperature', label: 'Coolant Temp', unit: '°C', min: 60, max: 130, nominal: 90, step: 1 },
      { key: 'oilPressure', label: 'Oil Pressure', unit: 'bar', min: 1, max: 8, nominal: 4.5, step: 0.1 },
      { key: 'fuelConsumption', label: 'Fuel Flow', unit: 'L/h', min: 0, max: 40, nominal: 15, step: 0.5 },
      { key: 'vibration', label: 'Vibration', unit: 'mm/s', min: 0, max: 14, nominal: 3, step: 0.1 },
      { key: 'load', label: 'Load', unit: '%', min: 0, max: 120, nominal: 70, step: 1 },
    ],
  },
  ev: {
    label: 'Electric Vehicle',
    subtitle: 'Battery-electric passenger car',
    icon: Car,
    driveParam: 'speed',
    params: [
      { key: 'speed', label: 'Road Speed', unit: 'km/h', min: 0, max: 200, nominal: 80, step: 1 },
      { key: 'batterySOC', label: 'Battery SOC', unit: '%', min: 0, max: 100, nominal: 65, step: 1 },
      { key: 'batteryTemp', label: 'Battery Temp', unit: '°C', min: 10, max: 60, nominal: 32, step: 1 },
      { key: 'motorTemp', label: 'Motor Temp', unit: '°C', min: 20, max: 150, nominal: 85, step: 1 },
      { key: 'tirePressure', label: 'Tyre Pressure', unit: 'psi', min: 20, max: 40, nominal: 32, step: 0.5 },
    ],
  },
  campus: {
    label: 'Smart Campus',
    subtitle: 'Multi-building energy & occupancy twin',
    icon: Building2,
    driveParam: 'energyLoad',
    params: [
      { key: 'energyLoad', label: 'Energy Load', unit: 'kW', min: 0, max: 500, nominal: 220, step: 5 },
      { key: 'occupancy', label: 'Occupancy', unit: '%', min: 0, max: 100, nominal: 55, step: 1 },
      { key: 'airQuality', label: 'Air Quality Index', unit: 'AQI', min: 0, max: 300, nominal: 80, step: 1 },
      { key: 'waterUsage', label: 'Water Usage', unit: 'kL/day', min: 0, max: 50, nominal: 18, step: 0.5 },
      { key: 'avgTemp', label: 'Avg Ambient Temp', unit: '°C', min: 15, max: 40, nominal: 27, step: 0.5 },
    ],
  },
  robot: {
    label: 'Industrial Robot Arm',
    subtitle: '6-axis articulated manipulator',
    icon: Bot,
    driveParam: 'cycleRate',
    params: [
      { key: 'cycleRate', label: 'Cycle Rate', unit: '/min', min: 0, max: 40, nominal: 18, step: 1 },
      { key: 'jointTemp', label: 'Joint Temp', unit: '°C', min: 20, max: 95, nominal: 55, step: 1 },
      { key: 'payload', label: 'Payload', unit: 'kg', min: 0, max: 50, nominal: 12, step: 0.5 },
      { key: 'precisionError', label: 'Precision Error', unit: 'mm', min: 0, max: 2, nominal: 0.15, step: 0.01 },
      { key: 'vibration', label: 'Vibration', unit: 'mm/s', min: 0, max: 8, nominal: 1.5, step: 0.1 },
    ],
  },
  drone: {
    label: 'Survey Drone',
    subtitle: 'Quadcopter, aerial inspection',
    icon: Radar,
    driveParam: 'throttle',
    params: [
      { key: 'throttle', label: 'Throttle', unit: '%', min: 0, max: 100, nominal: 55, step: 1 },
      { key: 'altitude', label: 'Altitude', unit: 'm', min: 0, max: 500, nominal: 120, step: 5 },
      { key: 'batteryLevel', label: 'Battery Level', unit: '%', min: 0, max: 100, nominal: 65, step: 1 },
      { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s', min: 0, max: 25, nominal: 6, step: 0.5 },
      { key: 'motorTemp', label: 'Motor Temp', unit: '°C', min: 20, max: 100, nominal: 55, step: 1 },
    ],
  },
  windTurbine: {
    label: 'Wind Turbine',
    subtitle: 'Utility-scale, ~2 MW horizontal-axis',
    icon: Wind,
    driveParam: 'rotorSpeed',
    params: [
      { key: 'windSpeed', label: 'Wind Speed', unit: 'm/s', min: 0, max: 25, nominal: 11, step: 0.5 },
      { key: 'rotorSpeed', label: 'Rotor Speed', unit: 'RPM', min: 0, max: 20, nominal: 14, step: 0.5 },
      { key: 'powerOutput', label: 'Power Output', unit: 'kW', min: 0, max: 2200, nominal: 1800, step: 10 },
      { key: 'bladePitch', label: 'Blade Pitch Angle', unit: 'deg', min: -5, max: 90, nominal: 5, step: 1 },
      { key: 'generatorTemp', label: 'Generator Temp', unit: '°C', min: 20, max: 130, nominal: 75, step: 1 },
      { key: 'gearboxOilTemp', label: 'Gearbox Oil Temp', unit: '°C', min: 20, max: 100, nominal: 60, step: 1 },
      { key: 'vibration', label: 'Nacelle Vibration', unit: 'mm/s', min: 0, max: 15, nominal: 3, step: 0.1 },
      { key: 'yawError', label: 'Yaw Error', unit: 'deg', min: -30, max: 30, nominal: 4, step: 0.5 },
    ],
  },
  aircraft: {
    label: 'Aircraft',
    subtitle: 'Twin-engine commercial airframe',
    icon: Plane,
    driveParam: 'engineN1',
    params: [
      { key: 'engineN1', label: 'Engine N1 Speed', unit: '%', min: 0, max: 105, nominal: 92, step: 0.5 },
      { key: 'airspeed', label: 'Airspeed', unit: 'kt', min: 0, max: 550, nominal: 480, step: 5 },
      { key: 'altitude', label: 'Altitude', unit: 'ft', min: 0, max: 42000, nominal: 35000, step: 500 },
      { key: 'cabinPressureDiff', label: 'Cabin Pressure Diff', unit: 'psi', min: 0, max: 9, nominal: 8.1, step: 0.1 },
      { key: 'fuelFlow', label: 'Fuel Flow', unit: 'kg/h', min: 0, max: 5000, nominal: 2400, step: 50 },
      { key: 'vibration', label: 'Airframe Vibration', unit: 'mm/s', min: 0, max: 10, nominal: 1.8, step: 0.1 },
    ],
  },
  aircraftEngine: {
    label: 'Aircraft Engine',
    subtitle: 'High-bypass turbofan',
    icon: Fan,
    driveParam: 'n1Speed',
    params: [
      { key: 'n1Speed', label: 'Fan (N1) Speed', unit: '%', min: 0, max: 105, nominal: 92, step: 0.5 },
      { key: 'egt', label: 'Exhaust Gas Temp', unit: '°C', min: 300, max: 950, nominal: 650, step: 5 },
      { key: 'fuelFlow', label: 'Fuel Flow', unit: 'kg/h', min: 0, max: 3000, nominal: 1400, step: 25 },
      { key: 'oilPressure', label: 'Oil Pressure', unit: 'psi', min: 0, max: 90, nominal: 55, step: 1 },
      { key: 'vibration', label: 'Vibration', unit: 'mm/s', min: 0, max: 10, nominal: 1.5, step: 0.1 },
      { key: 'thrust', label: 'Thrust', unit: 'kN', min: 0, max: 120, nominal: 95, step: 1 },
    ],
  },
  aerofoil: {
    label: 'Aerofoil / Wing',
    subtitle: 'Wing section, streamline visualization',
    icon: Waves,
    driveParam: 'airspeed',
    params: [
      { key: 'airspeed', label: 'Airspeed', unit: 'm/s', min: 0, max: 300, nominal: 120, step: 2 },
      { key: 'angleOfAttack', label: 'Angle of Attack', unit: 'deg', min: -5, max: 20, nominal: 4, step: 0.5 },
      { key: 'liftCoefficient', label: 'Lift Coefficient', unit: 'Cl', min: 0, max: 2.2, nominal: 1.1, step: 0.05 },
      { key: 'dragCoefficient', label: 'Drag Coefficient', unit: 'Cd', min: 0, max: 0.3, nominal: 0.04, step: 0.005 },
      { key: 'surfaceTemp', label: 'Surface Temp', unit: '°C', min: -40, max: 60, nominal: 15, step: 1 },
      { key: 'flutter', label: 'Flutter Vibration', unit: 'mm/s', min: 0, max: 6, nominal: 0.8, step: 0.1 },
    ],
  },
  manufacturingPlant: {
    label: 'Manufacturing Plant',
    subtitle: 'Factory floor, production & energy twin',
    icon: Factory,
    driveParam: 'productionRate',
    params: [
      { key: 'productionRate', label: 'Production Rate', unit: 'units/h', min: 0, max: 500, nominal: 320, step: 5 },
      { key: 'lineUtilization', label: 'Line Utilization', unit: '%', min: 0, max: 100, nominal: 78, step: 1 },
      { key: 'energyLoad', label: 'Energy Load', unit: 'kW', min: 0, max: 800, nominal: 410, step: 10 },
      { key: 'defectRate', label: 'Defect Rate', unit: '%', min: 0, max: 15, nominal: 1.8, step: 0.1 },
      { key: 'ambientTemp', label: 'Ambient Temp', unit: '°C', min: 15, max: 45, nominal: 28, step: 0.5 },
      { key: 'downtimeRisk', label: 'Downtime Risk', unit: '%', min: 0, max: 100, nominal: 12, step: 1 },
    ],
  },
  humanBody: {
    label: 'Human Body',
    subtitle: 'Whole-body physiological digital twin',
    icon: User,
    driveParam: 'heartRate',
    params: [
      { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 40, max: 180, nominal: 72, step: 1 },
      { key: 'systolicBP', label: 'Systolic BP', unit: 'mmHg', min: 90, max: 200, nominal: 120, step: 1 },
      { key: 'spo2', label: 'Blood Oxygen (SpO2)', unit: '%', min: 75, max: 100, nominal: 98, step: 1 },
      { key: 'bodyTemp', label: 'Body Temperature', unit: '°C', min: 34, max: 41, nominal: 37, step: 0.1 },
      { key: 'respirationRate', label: 'Respiration Rate', unit: '/min', min: 8, max: 40, nominal: 16, step: 1 },
      { key: 'glucoseLevel', label: 'Blood Glucose', unit: 'mg/dL', min: 60, max: 250, nominal: 95, step: 1 },
    ],
  },
  composite: {
    label: 'E/GO Composite Laminate',
    subtitle: 'Epoxy + graphene oxide nanocomposite — materials twin',
    icon: Atom,
    driveParam: 'goContent',
    params: [
      { key: 'goContent', label: 'GO Content', unit: 'wt%', min: 0, max: 2, nominal: 0.4, step: 0.05 },
      { key: 'cureTemp', label: 'Cure Temperature', unit: '°C', min: 60, max: 200, nominal: 120, step: 5 },
      { key: 'humidity', label: 'Relative Humidity', unit: '%RH', min: 0, max: 100, nominal: 50, step: 5 },
      { key: 'exposureTemp', label: 'Exposure Temperature', unit: '°C', min: -20, max: 120, nominal: 25, step: 5 },
      { key: 'exposureDays', label: 'Exposure Duration', unit: 'days', min: 0, max: 365, nominal: 30, step: 5 },
    ],
    customMetrics: (params) => computeCompositeMetrics(null, params),
  },
  quantum: {
    label: 'Quantum Simulator (1-Qubit)',
    subtitle: 'Bloch sphere state visualization',
    icon: Orbit,
    driveParam: 'gateRate',
    params: [
      { key: 'theta', label: 'Polar Angle θ', unit: 'deg', min: 0, max: 180, nominal: 60, step: 1 },
      { key: 'phi', label: 'Azimuthal Angle φ', unit: 'deg', min: 0, max: 360, nominal: 45, step: 1 },
      { key: 't1Relaxation', label: 'T1 Relaxation Time', unit: 'µs', min: 10, max: 300, nominal: 85, step: 1 },
      { key: 't2Dephasing', label: 'T2 Dephasing Time', unit: 'µs', min: 5, max: 200, nominal: 55, step: 1 },
      { key: 'gateFidelity', label: 'Gate Fidelity', unit: '%', min: 90, max: 100, nominal: 99.4, step: 0.1 },
      { key: 'gateRate', label: 'Gate Operation Rate', unit: 'MHz', min: 0, max: 50, nominal: 20, step: 1 },
    ],
  },
};

const CUSTOM_ACCENTS = ['#9B7FD4', '#4F8DD8', '#D8714F', '#D8C24F', '#4FD895', '#D84FA0'];

/* Keyword → archetype matching so a custom object reuses the closest
   existing 3D shape and icon instead of always falling back to the
   generic placeholder. This is a heuristic, not true object recognition —
   it just saves the generic look for genuinely novel objects. */
const ARCHETYPE_KEYWORDS = [
  { key: 'composite', words: ['epoxy', 'graphene', 'composite', 'laminate', 'e/go', 'nanocomposite', 'go composite', 'resin'] },
  { key: 'quantum', words: ['qubit', 'quantum', 'bloch'] },
  { key: 'aircraftEngine', words: ['aircraft engine', 'jet engine', 'turbofan', 'turbojet', 'turbine engine'] },
  { key: 'aircraft', words: ['aircraft', 'airplane', 'airliner', 'fuselage'] },
  { key: 'aerofoil', words: ['aerofoil', 'airfoil', 'wing profile', 'wing section', 'naca'] },
  { key: 'manufacturingPlant', words: ['manufacturing plant', 'manufacturing', 'factory', 'production line', 'assembly line'] },
  { key: 'pump', words: ['pump', 'pumping', 'volute'] },
  { key: 'motor', words: ['motor', 'fan', 'blower', 'compressor'] },
  { key: 'engine', words: ['engine', 'genset', 'diesel', 'generator'] },
  { key: 'windTurbine', words: ['turbine', 'windmill', 'wind mill'] },
  { key: 'ev', words: ['vehicle', 'car', 'truck', 'ev', 'forklift', 'agv', 'cart'] },
  { key: 'drone', words: ['drone', 'uav', 'quadcopter', 'copter'] },
  { key: 'robot', words: ['robot', 'arm', 'manipulator', 'cobot', 'gantry'] },
  { key: 'campus', words: ['campus', 'building', 'facility', 'warehouse', 'site'] },
  { key: 'humanBody', words: ['human body', 'full body', 'whole body', 'human', 'body twin'] },
  { key: 'organ', words: ['heart', 'cardiac', 'lung', 'pulmonary', 'kidney', 'liver', 'organ', 'patient', 'physio', 'vitals'] },
];

function guessArchetype(name) {
  const n = name.toLowerCase();
  for (const a of ARCHETYPE_KEYWORDS) {
    if (a.words.some((w) => n.includes(w))) return a.key;
  }
  return null;
}

// Metadata for archetypes that guide custom-object geometry but aren't
// full built-in menu chips themselves (e.g. organs).
const EXTRA_ARCHETYPE_META = {
  organ: { label: 'physiological organ', icon: Heart },
};

function getArchetypeMeta(archetype) {
  if (!archetype) return null;
  return DEFAULT_OBJECT_TYPES[archetype]
    ? { label: DEFAULT_OBJECT_TYPES[archetype].label, icon: DEFAULT_OBJECT_TYPES[archetype].icon }
    : EXTRA_ARCHETYPE_META[archetype] || null;
}

const nominalParams = (paramList) => {
  const out = {};
  paramList.forEach((p) => { out[p.key] = p.nominal; });
  return out;
};

/* ------------------------------------------------------------------ */
/*  Health / prediction model (schema-agnostic)                        */
/* ------------------------------------------------------------------ */

// Shared best/expected/worst scenario projector, reused by every twin type's
// forecast — generic health-decay based, or a bespoke domain model (e.g. the
// composite material below) that hands it a starting health + decay rate.
function buildScenarioForecast(health, kNormal, threshold = 40) {
  const kBest = kNormal * 0.42;
  const kWorst = kNormal * 2.1;
  const forecast = [];
  const rul = { best: null, normal: null, worst: null };
  for (let t = 0; t <= 120; t += 2) {
    const noise = 1.6 * Math.sin(t * 0.35) * Math.exp(-t / 60);
    const hBest = Math.max(0, Math.min(100, health * Math.exp(-kBest * t) + noise * 0.5 + t * 0.01));
    const hNormal = Math.max(0, health * Math.exp(-kNormal * t) + noise);
    const hWorst = Math.max(0, health * Math.exp(-kWorst * t) + noise * 1.3);
    forecast.push({
      day: t,
      best: Math.round(hBest * 10) / 10,
      normal: Math.round(hNormal * 10) / 10,
      worst: Math.round(hWorst * 10) / 10,
    });
    if (rul.best === null && hBest <= threshold) rul.best = t;
    if (rul.normal === null && hNormal <= threshold) rul.normal = t;
    if (rul.worst === null && hWorst <= threshold) rul.worst = t;
  }
  if (rul.best === null) rul.best = 120;
  if (rul.normal === null) rul.normal = 120;
  if (rul.worst === null) rul.worst = 120;

  const dateFor = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };
  const maintDate = { best: dateFor(rul.best), normal: dateFor(rul.normal), worst: dateFor(rul.worst) };

  return { forecast, rul, maintDate, threshold };
}

function computeMetrics(schema, params) {
  const list = schema.params;
  let totalDev = 0;
  list.forEach((p) => {
    const spread = Math.max(p.nominal - p.min, p.max - p.nominal) || 1;
    const dev = Math.abs(params[p.key] - p.nominal) / spread;
    totalDev += Math.min(1, dev);
  });
  const avgDev = totalDev / list.length;
  const health = Math.round(Math.max(2, Math.min(100, 100 - avgDev * 100)));
  const efficiency = Math.round(Math.max(45, Math.min(98, 97 - avgDev * 55)));

  let status = 'healthy';
  if (health < 45) status = 'critical';
  else if (health < 75) status = 'warning';

  const kNormal = 0.008 + avgDev * 0.055;
  const { forecast, rul, maintDate, threshold } = buildScenarioForecast(health, kNormal);

  return { health, efficiency, status, avgDev, forecast, rul, maintDate, threshold };
}

// --- Epoxy / Graphene-Oxide (E/GO) composite laminate -------------------
// A simplified, pedagogical dose-response model (NOT a validated materials
// database): GO reinforcement follows the commonly-reported trend of rising
// mechanical performance up to an optimum dispersion loading (~0.3-0.5 wt%),
// then declining past that point due to agglomeration/void formation. GO
// also acts as a moisture/oxygen barrier that slows environmental
// degradation, again up to the point where agglomeration defeats it.
function computeCompositeMetrics(schema, params) {
  const go = params.goContent;
  const goOpt = 0.4; // wt% — assumed optimum dispersion loading
  const ratio = go / goOpt;
  // Peaks at 1.6x when go = goOpt, decays back toward baseline for go >> goOpt
  const reinforcement = 1 + 0.6 * ratio * Math.exp(1 - ratio);

  const cureTemp = params.cureTemp;
  const cureFactor = 1 - Math.min(0.3, Math.abs(cureTemp - 120) / 300);

  const tensileStrength = 65 * reinforcement * cureFactor; // MPa, neat epoxy baseline ~65 MPa
  const flexuralStrength = 110 * reinforcement * cureFactor; // MPa
  const modulus = 3.0 * (1 + 0.4 * ratio * Math.exp(1 - ratio)); // GPa

  const rh = params.humidity;
  const exposureTemp = params.exposureTemp;
  const days = params.exposureDays;

  // GO's barrier effect reduces moisture ingress up to the optimum, then
  // agglomeration voids let it creep back up.
  const moistureBarrier = 1 - 0.45 * ratio * Math.exp(1 - ratio) + 0.15 * Math.max(0, go - goOpt);
  const moistureUptake = Math.max(0, 0.022 * rh * moistureBarrier * Math.min(1, days / 180));

  const agingStress = Math.exp((exposureTemp - 25) / 35) * Math.min(1.4, days / 365);
  const degradationPct = Math.max(0, Math.min(70, agingStress * 14 + moistureUptake * 9 - 4 * (reinforcement - 1)));
  const retainedFactor = 1 - degradationPct / 100;

  const effectiveTensile = tensileStrength * retainedFactor;
  const effectiveFlexural = flexuralStrength * retainedFactor;

  const health = Math.round(Math.max(2, Math.min(100, 100 - degradationPct - Math.abs(go - goOpt) * 8)));
  const efficiency = Math.round(Math.max(20, Math.min(99, retainedFactor * 100 - Math.abs(go - goOpt) * 5)));

  let status = 'healthy';
  if (health < 45) status = 'critical';
  else if (health < 75) status = 'warning';

  // Environmental aging rate: faster with heat/moisture, slowed by
  // well-dispersed GO reinforcement, worsened by over-loading past optimum.
  const kNormal = Math.max(0.001, 0.004 + (degradationPct / 100) * 0.05 + Math.max(0, go - goOpt) * 0.012 - 0.15 * (reinforcement - 1));
  const { forecast, rul, maintDate, threshold } = buildScenarioForecast(health, kNormal);

  return {
    health, efficiency, status, avgDev: degradationPct / 100, forecast, rul, maintDate, threshold,
    derived: [
      { label: 'Tensile Strength', value: tensileStrength.toFixed(1), unit: 'MPa' },
      { label: 'Flexural Strength', value: flexuralStrength.toFixed(1), unit: 'MPa' },
      { label: "Young's Modulus", value: modulus.toFixed(2), unit: 'GPa' },
      { label: 'Moisture Uptake', value: moistureUptake.toFixed(2), unit: 'wt%' },
      { label: 'Property Retention', value: (retainedFactor * 100).toFixed(1), unit: '%' },
      { label: 'Effective Tensile (aged)', value: effectiveTensile.toFixed(1), unit: 'MPa' },
      { label: 'Effective Flexural (aged)', value: effectiveFlexural.toFixed(1), unit: 'MPa' },
    ],
  };
}

const STATUS_META = {
  healthy: { color: '#4FD8C4', label: 'Nominal', Icon: CheckCircle2 },
  warning: { color: '#E8A33D', label: 'Degraded', Icon: AlertTriangle },
  critical: { color: '#E2574C', label: 'Critical', Icon: AlertTriangle },
};

/* ------------------------------------------------------------------ */
/*  Three.js machine geometry factories                                */
/*  Every builder returns { group, rotors: [], oscillators: [], glowMats: [] } */
/* ------------------------------------------------------------------ */

function makeBodyMaterial(baseHex) {
  return new THREE.MeshStandardMaterial({
    color: baseHex, metalness: 0.55, roughness: 0.42,
    emissive: 0x000000, emissiveIntensity: 0.55,
  });
}

function buildMotor() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2b3138);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x565f68, metalness: 0.7, roughness: 0.3 });
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.9, roughness: 0.18 });

  const housing = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.2, 28), bodyMat);
  housing.rotation.z = Math.PI / 2;
  group.add(housing);

  for (let i = 0; i < 10; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.08, 0.22), trimMat);
    const a = (i / 10) * Math.PI * 2;
    fin.position.set(0, Math.sin(a) * 1.04, Math.cos(a) * 1.04);
    fin.rotation.x = a;
    group.add(fin);
  }

  const frontCap = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.18, 28), trimMat);
  frontCap.rotation.z = Math.PI / 2; frontCap.position.x = -1.1;
  group.add(frontCap);
  const backCap = frontCap.clone(); backCap.position.x = 1.1; group.add(backCap);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.4, 20), shaftMat);
  shaft.rotation.z = Math.PI / 2;
  group.add(shaft);

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 1.5), trimMat);
  base.position.y = -1.15;
  group.add(base);

  return { group, rotors: [shaft], oscillators: [], glowMats: [bodyMat] };
}

function buildPump() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x293240);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x5a6572, metalness: 0.7, roughness: 0.3 });
  const impMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.85, roughness: 0.2 });

  const volute = new THREE.Mesh(new THREE.SphereGeometry(1.05, 26, 20), bodyMat);
  volute.scale.set(1, 1, 0.6);
  group.add(volute);

  const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.1, 16), trimMat);
  inlet.rotation.z = Math.PI / 2; inlet.position.set(-1.5, 0, 0.15);
  group.add(inlet);

  const outlet = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 16), trimMat);
  outlet.position.set(0, 1.35, 0.15);
  group.add(outlet);

  const impellerGroup = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 20), impMat);
  hub.rotation.x = Math.PI / 2;
  impellerGroup.add(hub);
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.09, 0.16), impMat);
    const a = (i / 6) * Math.PI * 2;
    blade.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0.15);
    blade.rotation.z = a;
    impellerGroup.add(blade);
  }
  impellerGroup.position.set(0, 0, 0.68);
  group.add(impellerGroup);

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 1.5), trimMat);
  base.position.y = -1.2;
  group.add(base);

  return { group, rotors: [impellerGroup], oscillators: [], glowMats: [bodyMat] };
}

function buildEngine() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2f2822);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x5f5449, metalness: 0.6, roughness: 0.35 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xb5773a, metalness: 0.75, roughness: 0.3 });
  const pulleyMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.85, roughness: 0.2 });

  const block = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.15, 1.5), bodyMat);
  group.add(block);

  for (let i = 0; i < 4; i++) {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.5, 16), trimMat);
    head.position.set(-0.85 + i * 0.58, 0.82, 0);
    group.add(head);
  }

  const manifold = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 10, 24, Math.PI), accentMat);
  manifold.rotation.y = Math.PI / 2;
  manifold.position.set(0, 0.15, 0.85);
  group.add(manifold);

  const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.24, 24), pulleyMat);
  pulley.rotation.z = Math.PI / 2;
  pulley.position.x = -1.35;
  const barA = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.06), trimMat);
  const barB = barA.clone(); barB.rotation.x = Math.PI / 2;
  pulley.add(barA); pulley.add(barB);
  group.add(pulley);

  const base = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.16, 1.6), trimMat);
  base.position.y = -0.85;
  group.add(base);

  return { group, rotors: [pulley], oscillators: [], glowMats: [bodyMat] };
}

function buildEV() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2c333c);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x3a4650, metalness: 0.3, roughness: 0.15 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: 0.4, roughness: 0.6 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xdfe8ee, emissive: 0x9fd8ff, emissiveIntensity: 0.9 });

  const lower = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 1.3), bodyMat);
  lower.position.y = -0.35;
  group.add(lower);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.18), glassMat);
  cabin.position.set(-0.1, 0.2, 0);
  group.add(cabin);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 1.2), bodyMat);
  nose.position.set(1.35, -0.32, 0);
  group.add(nose);

  [[-1.5, -1], [-1.5, 1]].forEach(([x, z]) => {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), lightMat);
    lamp.position.set(x, -0.35, z * 0.55);
    group.add(lamp);
  });

  const wheels = [];
  [[-0.85, -0.72], [-0.85, 0.72], [0.85, -0.72], [0.85, 0.72]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.26, 20), wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, -0.62, z);
    group.add(wheel);
    wheels.push(wheel);
  });

  return { group, rotors: wheels, oscillators: [], glowMats: [bodyMat] };
}

function buildCampus() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2c3138);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x565f68, metalness: 0.5, roughness: 0.4 });
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.8, roughness: 0.25 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 3.4), trimMat);
  plinth.position.y = -1.3;
  group.add(plinth);

  const buildings = [
    { w: 0.55, h: 1.7, d: 0.55, x: -0.95, z: -0.75 },
    { w: 0.4, h: 1.0, d: 0.4, x: -0.15, z: -1.0 },
    { w: 0.6, h: 2.15, d: 0.55, x: 0.65, z: -0.35 },
    { w: 0.45, h: 0.85, d: 0.45, x: 0.85, z: 0.75 },
    { w: 0.42, h: 1.35, d: 0.42, x: -0.6, z: 0.85 },
  ];
  buildings.forEach((b) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), bodyMat);
    mesh.position.set(b.x, -1.3 + b.h / 2 + 0.05, b.z);
    group.add(mesh);
  });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 10), trimMat);
  pole.position.y = -0.45;
  group.add(pole);

  const dishGroup = new THREE.Group();
  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.12, 16, 1, true), dishMat);
  dish.rotation.x = Math.PI / 2;
  dishGroup.add(dish);
  const armBar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.03), trimMat);
  dishGroup.add(armBar);
  dishGroup.position.y = 0.5;
  group.add(dishGroup);

  return { group, rotors: [dishGroup], oscillators: [], glowMats: [bodyMat] };
}

function buildRobot() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2b3138);
  const clawMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.85, roughness: 0.2 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.32, 24), bodyMat);
  base.position.y = -1.05;
  group.add(base);

  const lowerPivot = new THREE.Group();
  lowerPivot.position.set(0, -0.88, 0);
  const lowerArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.05, 0.24), bodyMat);
  lowerArm.position.y = 0.52;
  lowerPivot.add(lowerArm);
  lowerPivot.rotation.z = -0.15;
  group.add(lowerPivot);

  const upperPivot = new THREE.Group();
  upperPivot.position.set(0, 1.05, 0);
  const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.85, 0.19), bodyMat);
  upperArm.position.y = 0.42;
  upperPivot.add(upperArm);
  upperPivot.rotation.z = 0.3;
  lowerPivot.add(upperPivot);

  const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.08), clawMat);
  clawL.position.set(-0.08, 0.9, 0);
  const clawR = clawL.clone(); clawR.position.x = 0.08;
  upperPivot.add(clawL); upperPivot.add(clawR);

  return {
    group,
    rotors: [],
    oscillators: [
      { mesh: lowerPivot, axis: 'z', base: -0.15, amp: 0.32, freq: 0.55, phase: 0 },
      { mesh: upperPivot, axis: 'z', base: 0.3, amp: 0.48, freq: 0.85, phase: 1.4 },
    ],
    glowMats: [bodyMat],
  };
}

function buildDrone() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2c333c);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x565f68, metalness: 0.6, roughness: 0.35 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.85 });

  const hub = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.5), bodyMat);
  group.add(hub);

  const rotors = [];
  const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  dirs.forEach(([sx, sz]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.08), trimMat);
    const ang = Math.atan2(sz, sx);
    arm.rotation.y = -ang;
    arm.position.set(sx * 0.42, 0, sz * 0.42);
    group.add(arm);

    const propGroup = new THREE.Group();
    propGroup.position.set(sx * 0.82, 0.06, sz * 0.82);
    const bladeA = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.06), bladeMat);
    const bladeB = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.5), bladeMat);
    propGroup.add(bladeA); propGroup.add(bladeB);
    group.add(propGroup);
    rotors.push(propGroup);
  });

  [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), trimMat);
    leg.position.set(x, -0.24, z);
    group.add(leg);
  });

  return { group, rotors, oscillators: [], glowMats: [bodyMat] };
}

function buildWindTurbine() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0xd8dde2);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x565f68, metalness: 0.6, roughness: 0.35 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.3, roughness: 0.4 });

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.22, 2.6, 16), bodyMat);
  tower.position.y = -0.4;
  group.add(tower);

  const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.28, 0.32), trimMat);
  nacelle.position.set(0.05, 0.94, 0);
  group.add(nacelle);

  const hubGroup = new THREE.Group();
  hubGroup.position.set(0.52, 0.94, 0);
  hubGroup.rotation.z = Math.PI / 2;

  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), trimMat);
  hubGroup.add(hub);

  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1.15, 4), bladeMat);
    blade.scale.set(1, 1, 0.22);
    blade.position.y = 0.65;
    const bladePivot = new THREE.Group();
    bladePivot.rotation.z = (i / 3) * Math.PI * 2;
    bladePivot.add(blade);
    hubGroup.add(bladePivot);
  }
  group.add(hubGroup);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 20), trimMat);
  base.position.y = -1.72;
  group.add(base);

  return { group, rotors: [hubGroup], oscillators: [], glowMats: [bodyMat] };
}

function buildGeneric() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2b3138);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x565f68, metalness: 0.6, roughness: 0.35 });

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), bodyMat);
  group.add(core);

  const edges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.95, 1));
  const wire = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x6a7580 }));
  group.add(wire);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.018, 8, 48), trimMat);
  ring.rotation.x = Math.PI / 2.4;
  group.add(ring);

  return { group, rotors: [group], oscillators: [], glowMats: [bodyMat] };
}

function buildOrgan() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0xb5504c);
  const vesselMat = new THREE.MeshStandardMaterial({ color: 0x8a3c3a, metalness: 0.2, roughness: 0.5 });

  const lobeGeo = new THREE.SphereGeometry(0.44, 22, 22);
  const lobeL = new THREE.Mesh(lobeGeo, bodyMat);
  lobeL.position.set(-0.26, 0.3, 0);
  group.add(lobeL);
  const lobeR = new THREE.Mesh(lobeGeo, bodyMat);
  lobeR.position.set(0.26, 0.3, 0.02);
  group.add(lobeR);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.0, 22), bodyMat);
  tip.rotation.x = Math.PI;
  tip.position.set(0, -0.42, 0);
  group.add(tip);

  const aorta = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.55, 14), vesselMat);
  aorta.position.set(0.02, 0.78, -0.05);
  aorta.rotation.z = 0.35;
  group.add(aorta);

  const vesselA = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.45, 10), vesselMat);
  vesselA.position.set(-0.42, 0.62, 0.05);
  vesselA.rotation.z = -0.5;
  group.add(vesselA);
  const vesselB = vesselA.clone();
  vesselB.position.set(0.5, 0.5, -0.1);
  vesselB.rotation.z = 0.65;
  group.add(vesselB);

  return {
    group, rotors: [], oscillators: [],
    pulses: [{ mesh: group, base: 1, amp: 0.085, freq: 1.7 }],
    glowMats: [bodyMat],
  };
}

function buildAircraft() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0xd7dde2);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x8a929c, metalness: 0.4, roughness: 0.45 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x3a4650, metalness: 0.3, roughness: 0.15 });

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 3.0, 20), bodyMat);
  fuselage.rotation.z = Math.PI / 2;
  group.add(fuselage);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 20), bodyMat);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 1.75;
  group.add(nose);

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), glassMat);
  cockpit.position.set(1.35, 0.06, 0);
  group.add(cockpit);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.045, 2.7), bodyMat);
  wing.position.set(-0.05, -0.08, 0);
  group.add(wing);

  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.035, 1.05), trimMat);
  tailWing.position.set(-1.35, 0.02, 0);
  group.add(tailWing);

  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.05), trimMat);
  tailFin.position.set(-1.4, 0.28, 0);
  group.add(tailFin);

  const fans = [];
  [-0.85, 0.85].forEach((z) => {
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.42, 16), trimMat);
    nacelle.rotation.z = Math.PI / 2;
    nacelle.position.set(-0.05, -0.32, z);
    group.add(nacelle);

    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), bodyMat);
    fan.rotation.z = Math.PI / 2;
    fan.position.set(0.16, -0.32, z);
    group.add(fan);
    fans.push(fan);
  });

  return { group, rotors: fans, oscillators: [], glowMats: [bodyMat] };
}

function buildAircraftEngine() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2c333c);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x707a85, metalness: 0.75, roughness: 0.25 });
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.8, roughness: 0.2 });

  const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.58, 1.9, 28), bodyMat);
  casing.rotation.z = Math.PI / 2;
  group.add(casing);

  const inletRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 10, 30), trimMat);
  inletRing.rotation.y = Math.PI / 2;
  inletRing.position.x = -0.95;
  group.add(inletRing);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.5, 24), trimMat);
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.x = 1.2;
  group.add(nozzle);

  const fanGroup = new THREE.Group();
  fanGroup.position.x = -0.9;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 16), trimMat);
  hub.rotation.z = Math.PI / 2;
  fanGroup.add(hub);
  for (let i = 0; i < 18; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.09), bladeMat);
    const a = (i / 18) * Math.PI * 2;
    blade.position.set(0, Math.cos(a) * 0.36, Math.sin(a) * 0.36);
    blade.rotation.x = a;
    fanGroup.add(blade);
  }
  group.add(fanGroup);

  const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.14), trimMat);
  pylon.position.set(0, -0.85, 0);
  group.add(pylon);
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.6), trimMat);
  base.position.y = -1.35;
  group.add(base);

  return { group, rotors: [fanGroup], oscillators: [], glowMats: [bodyMat] };
}

function buildAerofoil() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2c333c);

  const shape = new THREE.Shape();
  const upper = [[0, 0], [0.06, 0.055], [0.22, 0.085], [0.42, 0.09], [0.62, 0.07], [0.82, 0.038], [1, 0]];
  const lower = [[0.82, -0.028], [0.62, -0.048], [0.42, -0.052], [0.22, -0.04], [0.06, -0.018], [0, 0]];
  shape.moveTo(upper[0][0] * 1.6 - 0.8, upper[0][1] * 1.6);
  upper.slice(1).forEach(([x, y]) => shape.lineTo(x * 1.6 - 0.8, y * 1.6));
  lower.forEach(([x, y]) => shape.lineTo(x * 1.6 - 0.8, y * 1.6));

  const wingMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false, curveSegments: 24 }),
    bodyMat
  );
  wingMesh.position.set(0, 0, -1.1);
  group.add(wingMesh);

  const streamMat = new THREE.LineBasicMaterial({ color: 0x4fd8c4, transparent: true, opacity: 0.55 });
  [0.14, 0.22, -0.1, -0.18].forEach((yOff, i) => {
    const pts = [];
    for (let t = 0; t <= 1; t += 0.05) {
      const x = t * 2.2 - 1.1;
      const bump = Math.sin(t * Math.PI) * (yOff > 0 ? 0.1 : -0.06) * (i < 2 ? 1 : 0.5);
      pts.push(new THREE.Vector3(x * 0 + (t * 1.7 - 0.85), yOff + bump, t * 2.4 - 1.2));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), streamMat);
    group.add(line);
  });

  group.rotation.y = 0.15;

  return {
    group, rotors: [], oscillators: [{ mesh: group, axis: 'x', base: 0.07, amp: 0.05, freq: 0.5, phase: 0 }],
    glowMats: [bodyMat],
  };
}

function buildManufacturingPlant() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x2c3138);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x565f68, metalness: 0.5, roughness: 0.4 });
  const ventMat = new THREE.MeshStandardMaterial({ color: 0xc3cad1, metalness: 0.7, roughness: 0.3 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 3.0), trimMat);
  plinth.position.y = -1.35;
  group.add(plinth);

  const shed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.3), bodyMat);
  shed.position.set(-0.1, -0.8, -0.1);
  group.add(shed);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.1, 1.4), trimMat);
  roof.position.set(-0.1, -0.24, -0.1);
  group.add(roof);

  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.3, 12), trimMat);
  chimney.position.set(0.55, 0.42, 0.35);
  group.add(chimney);

  const ventGroup = new THREE.Group();
  ventGroup.position.set(0.55, 1.12, 0.35);
  const ventCap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.14, 12), ventMat);
  ventGroup.add(ventCap);
  const ventBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.02), ventMat);
  ventGroup.add(ventBar);
  group.add(ventGroup);

  [-0.95, -0.55].forEach((z, i) => {
    const silo = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.1, 16), trimMat);
    silo.position.set(-1.15, -0.7, z * 0.6 - 0.6);
    group.add(silo);
  });

  const conveyor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.28), trimMat);
  conveyor.position.set(0.9, -1.1, 0.9);
  conveyor.rotation.y = -0.3;
  group.add(conveyor);

  return { group, rotors: [ventGroup], oscillators: [], glowMats: [bodyMat] };
}

function buildHumanBody() {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xbfdde0, transparent: true, opacity: 0.5, metalness: 0.1, roughness: 0.35,
    emissive: 0x000000, emissiveIntensity: 0.6, side: THREE.DoubleSide,
  });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0xff5f5f, emissive: 0xff5f5f, emissiveIntensity: 1.1 });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), skinMat);
  head.position.y = 1.55;
  group.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.14, 12), skinMat);
  neck.position.y = 1.35;
  group.add(neck);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.95, 16), skinMat);
  torso.position.y = 0.78;
  group.add(torso);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.28, 16), skinMat);
  pelvis.position.y = 0.22;
  group.add(pelvis);

  [-1, 1].forEach((side) => {
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.55, 12), skinMat);
    upperArm.position.set(side * 0.42, 0.95, 0);
    upperArm.rotation.z = side * 0.22;
    group.add(upperArm);
    const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.5, 12), skinMat);
    lowerArm.position.set(side * 0.55, 0.5, 0);
    lowerArm.rotation.z = side * 0.1;
    group.add(lowerArm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), skinMat);
    hand.position.set(side * 0.6, 0.22, 0);
    group.add(hand);
  });

  [-1, 1].forEach((side) => {
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.62, 14), skinMat);
    thigh.position.set(side * 0.14, -0.32, 0);
    group.add(thigh);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.6, 14), skinMat);
    shin.position.set(side * 0.14, -0.93, 0);
    group.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.26), skinMat);
    foot.position.set(side * 0.14, -1.27, 0.06);
    group.add(foot);
  });

  const heartCore = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), coreMat);
  heartCore.position.set(-0.06, 0.92, 0.2);
  group.add(heartCore);

  group.position.y = -0.15;

  return {
    group, rotors: [], oscillators: [],
    pulses: [{ mesh: heartCore, base: 1, amp: 0.4, freq: 1.8 }],
    glowMats: [skinMat],
  };
}

function buildComposite() {
  const group = new THREE.Group();
  const bodyMat = makeBodyMaterial(0x3a4048);
  const plyMat = new THREE.MeshStandardMaterial({ color: 0x23262b, metalness: 0.3, roughness: 0.6, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const speckleMat = new THREE.PointsMaterial({ color: 0x15171a, size: 0.02, transparent: true, opacity: 0.85 });
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x8a929c, metalness: 0.7, roughness: 0.3 });

  // ASTM-style dogbone tensile-test coupon silhouette, extruded to give
  // laminate thickness.
  const shape = new THREE.Shape();
  const top = [[-1.1, 0.25], [-0.55, 0.25], [-0.3, 0.12], [0.3, 0.12], [0.55, 0.25], [1.1, 0.25]];
  const bot = [[1.1, -0.25], [0.55, -0.25], [0.3, -0.12], [-0.3, -0.12], [-0.55, -0.25], [-1.1, -0.25]];
  shape.moveTo(top[0][0], top[0][1]);
  top.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  bot.forEach(([x, y]) => shape.lineTo(x, y));

  const coupon = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false, curveSegments: 12 }),
    bodyMat
  );
  coupon.position.z = -0.08;
  group.add(coupon);

  for (let i = 0; i < 4; i++) {
    const ply = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.42), plyMat);
    ply.position.set(0, 0, 0.081 - i * 0.001);
    group.add(ply);
  }

  const speckleCount = 260;
  const positions = new Float32Array(speckleCount * 3);
  for (let i = 0; i < speckleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.55;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.14;
  }
  const speckleGeo = new THREE.BufferGeometry();
  speckleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  group.add(new THREE.Points(speckleGeo, speckleMat));

  [-1.0, 1.0].forEach((x) => {
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.32), gripMat);
    grip.position.set(x, 0, 0);
    group.add(grip);
  });

  return {
    group, rotors: [],
    oscillators: [{ mesh: group, axis: 'z', base: 0, amp: 0.045, freq: 0.55, phase: 0 }],
    glowMats: [bodyMat],
  };
}

function buildQuantum() {
  const group = new THREE.Group();

  const sphereMat = makeBodyMaterial(0x2b3138);
  sphereMat.wireframe = true;
  sphereMat.transparent = true;
  sphereMat.opacity = 0.4;
  const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), sphereMat);
  group.add(sphereMesh);

  const trimMat = new THREE.MeshStandardMaterial({ color: 0x6a7580, metalness: 0.4, roughness: 0.4 });
  const equator = new THREE.Mesh(new THREE.TorusGeometry(1, 0.008, 8, 64), trimMat);
  equator.rotation.x = Math.PI / 2;
  group.add(equator);

  const poleTop = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), trimMat);
  poleTop.position.set(0, 1, 0);
  group.add(poleTop);
  const poleBottom = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), trimMat);
  poleBottom.position.set(0, -1, 0);
  group.add(poleBottom);

  const origin = new THREE.Vector3(0, 0, 0);
  const axisColor = 0x4a525c;
  group.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1.2, axisColor, 0.1, 0.05));
  group.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 1.25, axisColor, 0.1, 0.05));
  group.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 1.2, axisColor, 0.1, 0.05));

  const stateArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 1.05, 0x4fd8c4, 0.16, 0.08);
  group.add(stateArrow);

  return {
    group, rotors: [sphereMesh], oscillators: [],
    glowMats: [sphereMat], quantumArrow: stateArrow,
  };
}

const BUILDERS = {
  motor: buildMotor, pump: buildPump, engine: buildEngine,
  ev: buildEV, campus: buildCampus, robot: buildRobot, drone: buildDrone,
  windTurbine: buildWindTurbine, organ: buildOrgan, humanBody: buildHumanBody,
  aircraft: buildAircraft, aircraftEngine: buildAircraftEngine,
  aerofoil: buildAerofoil, manufacturingPlant: buildManufacturingPlant,
  composite: buildComposite, quantum: buildQuantum,
};

/* ------------------------------------------------------------------ */
/*  Radial gauge                                                       */
/* ------------------------------------------------------------------ */

function RadialGauge({ value, max = 100, color, label, sub }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = circ * (1 - pct);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={r} fill="none" stroke="#2a2f36" strokeWidth="8" />
        <circle
          cx="52" cy="52" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 52 52)"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
        />
        <text x="52" y="49" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
          fontSize="22" fontWeight="600" fill="#E8ECEF">{Math.round(value)}</text>
        <text x="52" y="65" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
          fontSize="9" fill="#7A8590">{sub}</text>
      </svg>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#525A63',
      }}>{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3D Twin viewport                                                   */
/* ------------------------------------------------------------------ */

function TwinViewport({ builderKey, statusColor, driveNorm, blochTheta, blochPhi }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const rotorsRef = useRef([]);
  const oscillatorsRef = useRef([]);
  const pulsesRef = useRef([]);
  const glowMatsRef = useRef([]);
  const glowLightRef = useRef(null);
  const quantumArrowRef = useRef(null);
  const speedRef = useRef(0.1);
  const angleRef = useRef(0.6);
  const clockRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x8899aa, 0.55);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 5, 3);
    scene.add(dir);
    const glowLight = new THREE.PointLight(0x4fd8c4, 1.4, 8);
    glowLight.position.set(0, 0.6, 1.6);
    scene.add(glowLight);
    glowLightRef.current = glowLight;

    const grid = new THREE.GridHelper(12, 24, 0x33424a, 0x1c252b);
    grid.position.y = -1.4;
    scene.add(grid);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      clockRef.current += 0.016;
      angleRef.current += 0.0022;
      const radius = 5.2;
      camera.position.set(Math.sin(angleRef.current) * radius, 1.6, Math.cos(angleRef.current) * radius);
      camera.lookAt(0, -0.1, 0);

      const spin = 0.01 + speedRef.current * 0.42;
      rotorsRef.current.forEach((r) => r.rotateY(spin));
      oscillatorsRef.current.forEach((o) => {
        const freq = o.freq * (0.35 + speedRef.current * 1.5);
        o.mesh.rotation[o.axis] = o.base + Math.sin(clockRef.current * freq + (o.phase || 0)) * o.amp;
      });
      pulsesRef.current.forEach((p) => {
        const freq = p.freq * (0.5 + speedRef.current * 1.3);
        const s = p.base + Math.max(0, Math.sin(clockRef.current * freq)) * p.amp;
        p.mesh.scale.set(s, s, s);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  // rebuild machine geometry when object type changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (scene._machine) scene.remove(scene._machine);
    const build = BUILDERS[builderKey] || buildGeneric;
    const { group, rotors, oscillators, pulses, glowMats, quantumArrow } = build();
    scene.add(group);
    scene._machine = group;
    rotorsRef.current = rotors;
    oscillatorsRef.current = oscillators;
    pulsesRef.current = pulses || [];
    glowMatsRef.current = glowMats;
    quantumArrowRef.current = quantumArrow || null;
  }, [builderKey]);

  // update glow color / motion intensity reactively
  useEffect(() => {
    glowMatsRef.current.forEach((m) => {
      m.emissive.set(statusColor);
      m.emissiveIntensity = 0.35;
    });
    if (glowLightRef.current) glowLightRef.current.color.set(statusColor);
    speedRef.current = driveNorm;
    if (quantumArrowRef.current && blochTheta !== undefined && blochPhi !== undefined) {
      const t = (blochTheta * Math.PI) / 180;
      const p = (blochPhi * Math.PI) / 180;
      const dir = new THREE.Vector3(Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)).normalize();
      quantumArrowRef.current.setDirection(dir);
      quantumArrowRef.current.setColor(new THREE.Color(statusColor));
    }
  }, [statusColor, driveNorm, builderKey, blochTheta, blochPhi]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}

/* ------------------------------------------------------------------ */
/*  Parameter slider row                                               */
/* ------------------------------------------------------------------ */

function ParamSlider({ p, value, onChange, accent }) {
  const nomPct = ((p.nominal - p.min) / (p.max - p.min)) * 100;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: '0.04em', color: '#B7BFC8', textTransform: 'uppercase' }}>{p.label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: accent }}>{value}{p.unit}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type="range" min={p.min} max={p.max} step={p.step} value={value}
          onChange={(e) => onChange(p.key, parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: accent, height: 4, cursor: 'pointer' }}
        />
        <div style={{
          position: 'absolute', left: `${nomPct}%`, top: -3, width: 2, height: 10,
          background: '#7A8590', pointerEvents: 'none',
        }} title="nominal" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#7A8590', marginTop: 2 }}>
        <span>{p.min}</span>
        <span>nom {p.nominal}</span>
        <span>{p.max}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom object builder form                                         */
/* ------------------------------------------------------------------ */

function blankRow() {
  return { uid: Math.random().toString(36).slice(2), label: '', unit: '', min: 0, max: 100, nominal: 50, step: 1 };
}

function CustomObjectForm({ onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [rows, setRows] = useState([blankRow(), blankRow()]);

  const updateRow = (uid, field, value) => {
    setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, [field]: value } : r)));
  };
  const addRow = () => setRows((prev) => [...prev, blankRow()]);
  const removeRow = (uid) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.uid !== uid) : prev));

  const rowIssues = rows.map((r) => {
    if (!r.label.trim()) return 'needs a label';
    if (r.min === '' || r.max === '' || Number.isNaN(Number(r.min)) || Number.isNaN(Number(r.max))) return 'needs min & max values';
    if (Number(r.min) >= Number(r.max)) return 'min must be less than max';
    return null;
  });
  const nameIssue = name.trim().length === 0 ? 'give the object a name' : null;
  const issues = [nameIssue, ...rowIssues].filter(Boolean);
  const canSubmit = issues.length === 0;

  const submit = () => {
    if (!canSubmit) return;
    const usedKeys = new Set();
    const paramList = rows.map((r) => {
      let key = r.label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'param';
      let uniq = key; let n = 1;
      while (usedKeys.has(uniq)) { uniq = `${key}_${n}`; n += 1; }
      usedKeys.add(uniq);
      const min = parseFloat(r.min); const max = parseFloat(r.max);
      const nominal = Math.min(Math.max(parseFloat(r.nominal), min), max);
      return { key: uniq, label: r.label.trim(), unit: r.unit, min, max, nominal, step: parseFloat(r.step) || 1 };
    });
    const id = `custom_${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(36).slice(-4)}`;
    const archetype = guessArchetype(name);
    const meta = getArchetypeMeta(archetype);
    onCreate({
      id,
      type: {
        label: name.trim(),
        subtitle: meta ? `Custom digital twin · modeled as ${meta.label.toLowerCase()}` : 'Custom digital twin',
        icon: meta ? meta.icon : Box,
        builderKey: archetype,
        driveParam: paramList[0].key,
        params: paramList,
      },
    });
  };

  const inputStyle = {
    background: '#14171B', border: '1px solid #2a2f36', borderRadius: 5, color: '#E8ECEF',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: '6px 7px', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 600, letterSpacing: '0.02em' }}>
          Define a new twin type
        </div>
        <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#7A8590', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em', color: '#7A8590', textTransform: 'uppercase', marginBottom: 5 }}>Object name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HVAC Chiller, Wind Turbine, CNC Lathe"
          style={{ ...inputStyle, fontFamily: "'Inter', sans-serif", fontSize: 14, padding: '9px 10px' }} />
      </div>

      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, letterSpacing: '0.1em', color: '#7A8590', textTransform: 'uppercase', marginBottom: 8 }}>
        Parameters
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr 0.7fr 0.7fr 32px', gap: 8, marginBottom: 6, fontSize: 10.5, color: '#7A8590', fontFamily: "'Barlow Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <span>Label</span><span>Unit</span><span>Min</span><span>Max</span><span>Nominal</span><span />
      </div>
      {rows.map((r, i) => (
        <div key={r.uid}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 0.7fr 0.7fr 0.7fr 32px', gap: 8, marginBottom: rowIssues[i] ? 3 : 7, alignItems: 'center' }}>
            <input style={{ ...inputStyle, border: rowIssues[i] ? '1px solid #E2574C' : inputStyle.border }} value={r.label} onChange={(e) => updateRow(r.uid, 'label', e.target.value)} placeholder="Bearing Temp" />
            <input style={inputStyle} value={r.unit} onChange={(e) => updateRow(r.uid, 'unit', e.target.value)} placeholder="°C" />
            <input style={{ ...inputStyle, border: rowIssues[i] ? '1px solid #E2574C' : inputStyle.border }} type="number" value={r.min} onChange={(e) => updateRow(r.uid, 'min', e.target.value)} />
            <input style={{ ...inputStyle, border: rowIssues[i] ? '1px solid #E2574C' : inputStyle.border }} type="number" value={r.max} onChange={(e) => updateRow(r.uid, 'max', e.target.value)} />
            <input style={inputStyle} type="number" value={r.nominal} onChange={(e) => updateRow(r.uid, 'nominal', e.target.value)} />
            <button onClick={() => removeRow(r.uid)} style={{ background: 'transparent', border: 'none', color: '#8B94A0', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              <Trash2 size={15} />
            </button>
          </div>
          {rowIssues[i] && (
            <div style={{ color: '#E2574C', fontSize: 11, marginBottom: 7, fontFamily: "'JetBrains Mono', monospace" }}>
              row {i + 1}: {rowIssues[i]}
            </div>
          )}
        </div>
      ))}

      <button onClick={addRow} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px dashed #525A63',
        borderRadius: 6, color: '#7A8590', fontSize: 12.5, padding: '6px 10px', cursor: 'pointer', marginTop: 4, marginBottom: 16,
      }}>
        <Plus size={13} /> Add parameter
      </button>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={submit} disabled={!canSubmit} style={{
          padding: '10px 18px', borderRadius: 8, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
          background: canSubmit ? '#4FD8C4' : '#21252b', color: canSubmit ? '#1A1E23' : '#525A63',
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.03em',
        }}>
          Create Twin Type
        </button>
        <button onClick={onCancel} style={{
          padding: '10px 18px', borderRadius: 8, border: '1px solid #2a2f36', background: 'transparent',
          color: '#525A63', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14,
        }}>
          Cancel
        </button>
        {!canSubmit && (
          <span style={{ color: '#E8A33D', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            can't create yet — {issues[0]}{issues.length > 1 ? ` (+${issues.length - 1} more)` : ''}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main app                                                           */
/* ------------------------------------------------------------------ */

export default function DigitalTwinApp() {
  const [objectTypes, setObjectTypes] = useState(DEFAULT_OBJECT_TYPES);
  const [objectType, setObjectType] = useState('motor');
  const [params, setParams] = useState(nominalParams(DEFAULT_OBJECT_TYPES.motor.params));
  const [twinActive, setTwinActive] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const schema = objectTypes[objectType];

  const handleTypeChange = (key) => {
    setObjectType(key);
    setParams(nominalParams(objectTypes[key].params));
  };

  const handleParamChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const generateTwin = () => {
    setTwinActive(true);
    setGeneratedAt(new Date());
  };

  const resetTwin = () => {
    setParams(nominalParams(schema.params));
  };

  const handleCreateCustom = ({ id, type }) => {
    setObjectTypes((prev) => ({ ...prev, [id]: type }));
    setObjectType(id);
    setParams(nominalParams(type.params));
    setShowCustomForm(false);
  };

  const deleteCustomType = (key) => {
    setObjectTypes((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (objectType === key) {
      setObjectType('motor');
      setParams(nominalParams(DEFAULT_OBJECT_TYPES.motor.params));
      setTwinActive(false);
    }
    setPendingDelete(null);
  };

  const metrics = useMemo(
    () => (schema.customMetrics ? schema.customMetrics(params) : computeMetrics(schema, params)),
    [schema, params]
  );
  const statusMeta = STATUS_META[metrics.status];
  const driveSchema = schema.params.find((p) => p.key === schema.driveParam) || schema.params[0];
  const driveNorm = driveSchema ? Math.max(0, params[driveSchema.key] / driveSchema.max) : 0.3;

  const customCount = Object.keys(objectTypes).length - Object.keys(DEFAULT_OBJECT_TYPES).length;
  const customIndex = Math.max(0, customCount - 1);

  return (
    <div style={{
      minHeight: '100vh', width: '100%', background: '#14171B',
      backgroundImage:
        'linear-gradient(rgba(79,216,196,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(79,216,196,0.035) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      color: '#E8ECEF', fontFamily: "'Inter', sans-serif", padding: '28px 32px 48px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        input[type=range] { -webkit-appearance: none; background: #2a2f36; border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: currentColor; cursor: pointer; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }
        ::selection { background: #4FD8C433; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radio size={20} color="#4FD8C4" />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '0.24em', color: '#4FD8C4' }}>TWINBENCH</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 34, margin: '4px 0 0', letterSpacing: '0.01em' }}>
            Industrial Digital Twin Studio
          </h1>
          <p style={{ color: '#7A8590', fontSize: 14, margin: '4px 0 0' }}>
            Pick or define an object, generate its twin, and forecast its condition.
          </p>
        </div>
        {generatedAt && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#7A8590', textAlign: 'right' }}>
            twin instantiated&nbsp;
            {generatedAt.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Object type selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {Object.entries(objectTypes).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const active = key === objectType;
          const isCustom = key.startsWith('custom_');
          const accent = isCustom ? CUSTOM_ACCENTS[customIndex % CUSTOM_ACCENTS.length] : '#4FD8C4';
          return (
            <div key={key} style={{ position: 'relative', display: 'flex' }}>
              <button
                onClick={() => handleTypeChange(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: isCustom ? '10px 30px 10px 16px' : '10px 16px',
                  borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${active ? accent : '#2a2f36'}`,
                  background: active ? `${accent}14` : '#1A1E23',
                  color: active ? accent : '#525A63', transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: '0.02em' }}>{cfg.label}</span>
              </button>
              {isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(key);
                  }}
                  title="Delete this twin type"
                  style={{
                    position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)',
                    width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', color: active ? accent : '#525A63', cursor: 'pointer',
                    opacity: 0.75,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={() => setShowCustomForm((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px',
            borderRadius: 8, cursor: 'pointer', border: '1px dashed #525A63',
            background: 'transparent', color: '#7A8590',
          }}
        >
          <Plus size={16} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: '0.02em' }}>Custom Object</span>
        </button>
      </div>

      {pendingDelete && objectTypes[pendingDelete] && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, background: '#2a1a1a',
          border: '1px solid #E2574C', borderRadius: 8, padding: '10px 16px', marginBottom: 18,
        }}>
          <AlertTriangle size={16} color="#E2574C" />
          <span style={{ fontSize: 13.5, color: '#E2574C' }}>
            Delete "{objectTypes[pendingDelete].label}"? This can't be undone.
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => deleteCustomType(pendingDelete)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: '#E2574C', color: '#1A1E23', fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 13, letterSpacing: '0.03em',
            }}>
              Delete
            </button>
            <button onClick={() => setPendingDelete(null)} style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid #E2574C', background: 'transparent',
              color: '#E2574C', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCustomForm && (
        <CustomObjectForm onCreate={handleCreateCustom} onCancel={() => setShowCustomForm(false)} />
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) minmax(320px, 1fr) minmax(280px, 340px)', gap: 20, alignItems: 'start' }}>

        {/* Parameters panel */}
        <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#7A8590', textTransform: 'uppercase', marginBottom: 4 }}>
            Input Parameters
          </div>
          <div style={{ fontSize: 13, color: '#7A8590', marginBottom: 18 }}>{schema.subtitle}</div>
          {schema.params.map((p) => (
            <ParamSlider key={p.key} p={p} value={params[p.key]} onChange={handleParamChange} accent="#4FD8C4" />
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={generateTwin} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#4FD8C4', color: '#1A1E23', fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 15, letterSpacing: '0.04em',
            }}>
              {twinActive ? 'Update Twin' : 'Generate Twin'}
            </button>
            <button onClick={resetTwin} title="Reset to nominal" style={{
              width: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, border: '1px solid #2a2f36', background: 'transparent', color: '#7A8590', cursor: 'pointer',
            }}>
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* 3D viewport */}
        <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px 0' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#7A8590', textTransform: 'uppercase' }}>
              Live Twin — {schema.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: statusMeta.color }}>
              <statusMeta.Icon size={13} />
              {statusMeta.label.toUpperCase()}
            </div>
          </div>
          <div style={{ height: 380, position: 'relative', background: '#14171B' }}>
            {twinActive ? (
              <TwinViewport
                builderKey={schema.builderKey || objectType}
                statusColor={statusMeta.color}
                driveNorm={driveNorm}
                blochTheta={params.theta}
                blochPhi={params.phi}
              />
            ) : (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#525A63', gap: 10,
              }}>
                <schema.icon size={34} strokeWidth={1.3} />
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, letterSpacing: '0.04em' }}>
                  Set parameters and generate the twin
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '10px 18px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#8B94A0', borderTop: '1px solid #22262c' }}>
            motion speed reflects {schema.driveParam} · glow color reflects predicted health state · camera auto-orbits
          </div>
        </div>

        {/* KPI + prediction panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, padding: '18px 16px' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#7A8590', textTransform: 'uppercase', marginBottom: 14 }}>
              Key Performance Indicators
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <RadialGauge value={metrics.health} color={statusMeta.color} label="Health" sub="score" />
              <RadialGauge value={metrics.efficiency} color="#4FD8C4" label="Efficiency" sub="percent" />
            </div>
          </div>

          <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#7A8590', textTransform: 'uppercase' }}>
                Predicted Behaviour
              </div>
              <div style={{ display: 'flex', gap: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                <span style={{ color: '#4FD8C4' }}>● best</span>
                <span style={{ color: '#4FD8C4' }}>● expected</span>
                <span style={{ color: '#E2574C' }}>● worst</span>
              </div>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.forecast} margin={{ top: 4, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid stroke="#21252b" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#7A8590', fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#2a2f36' }} label={{ value: 'days', position: 'insideBottomRight', fill: '#8B94A0', fontSize: 10, offset: -2 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#7A8590', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
                  <Tooltip contentStyle={{ background: '#1A1E23', border: '1px solid #2a2f36', borderRadius: 6, fontSize: 12 }} labelFormatter={(d) => `day ${d}`} formatter={(v, k) => [`${v}%`, k]} />
                  <ReferenceLine y={metrics.threshold} stroke="#E2574C" strokeDasharray="3 3" strokeOpacity={0.6} />
                  <Line type="monotone" dataKey="best" stroke="#4FD8C4" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  <Line type="monotone" dataKey="worst" stroke="#E2574C" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  <Line type="monotone" dataKey="normal" stroke="#4FD8C4" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: '#4FD8C4' }}>{metrics.rul.best}d</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10.5, color: '#7A8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>best RUL</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: '#4FD8C4' }}>{metrics.rul.normal}d</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10.5, color: '#7A8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>expected RUL</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: '#E2574C' }}>{metrics.rul.worst}d</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10.5, color: '#7A8590', textTransform: 'uppercase', letterSpacing: '0.06em' }}>worst RUL</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              <span style={{ color: '#7A8590' }}>maintenance due (expected)</span>
              <span style={{ color: '#B7BFC8' }}>{metrics.maintDate.normal.toLocaleDateString()}</span>
            </div>
          </div>

          {metrics.derived && (
            <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#7A8590', textTransform: 'uppercase', marginBottom: 10 }}>
                Derived Material Properties
              </div>
              {metrics.derived.map((d) => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #22262c' }}>
                  <span style={{ fontSize: 12.5, color: '#525A63' }}>{d.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: '#B7BFC8' }}>{d.value}{d.unit}</span>
                </div>
              ))}
              <div style={{ fontSize: 10.5, color: '#8B94A0', marginTop: 8, lineHeight: 1.4 }}>
                Simplified pedagogical dose-response model — illustrates the reinforcement/agglomeration trend reported in GO-epoxy literature, not a validated materials database.
              </div>
            </div>
          )}

          <div style={{ background: '#1A1E23', border: '1px solid #262B32', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: '0.14em', color: '#7A8590', textTransform: 'uppercase', marginBottom: 10 }}>
              Sensor Readout
            </div>
            {schema.params.map((p) => {
              const spread = Math.max(p.nominal - p.min, p.max - p.nominal) || 1;
              const dev = Math.min(1, Math.abs(params[p.key] - p.nominal) / spread);
              const c = dev < 0.35 ? '#4FD8C4' : dev < 0.7 ? '#E8A33D' : '#E2574C';
              return (
                <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #22262c' }}>
                  <span style={{ fontSize: 12.5, color: '#525A63' }}>{p.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: c }}>{params[p.key]}{p.unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
