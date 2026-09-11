import industrialMotorImg from './images/industrial_motor_m401.jpg';
import centrifugalPumpImg from './images/centrifugal_pump_p204.jpg';
import gearboxImg from './images/gearbox_g118.jpg';
import airCompressorImg from './images/air_compressor_c305.jpg';
import concretePillarImg from './images/concrete_pillar_cp021.jpg';
import steelBeamImg from './images/steel_beam_sb114.jpg';
import structuralJointImg from './images/structural_joint_sj087.jpg';
import electricalPanelImg from './images/electrical_panel_ep052.jpg';
import transformerTrImg from './images/transformer_tr009.jpg';
import storageTankImg from './images/storage_tank_st301.jpg';
import pipelinePlImg from './images/pipeline_pl201.jpg';
import pressureVesselImg from './images/pressure_vessel_pv102.jpg';

// Legacy fallbacks
import bridge102Img from './images/bridge_102.jpg';
import transformer204Img from './images/transformer_204.jpg';
import pipeline201Img from './images/pipeline_201.jpg';
import cellTower44Img from './images/cell_tower_44.jpg';
import mainDam01Img from './images/main_dam_01.jpg';
import windTurbine401Img from './images/wind_turbine_401.jpg';

export {
  // 12 Primary Industrial Assets
  industrialMotorImg,
  centrifugalPumpImg,
  gearboxImg,
  airCompressorImg,
  concretePillarImg,
  steelBeamImg,
  structuralJointImg,
  electricalPanelImg,
  transformerTrImg,
  storageTankImg,
  pipelinePlImg,
  pressureVesselImg,
  // Legacy
  bridge102Img,
  transformer204Img,
  pipeline201Img,
  cellTower44Img,
  mainDam01Img,
  windTurbine401Img
};

export const ASSET_IMAGES: Record<string, string> = {
  // 🏭 INDUSTRIAL MACHINERY
  'M-401': industrialMotorImg,
  'MOTOR-M401': industrialMotorImg,
  'P-204': centrifugalPumpImg,
  'PUMP-P204': centrifugalPumpImg,
  'G-118': gearboxImg,
  'GEARBOX-G118': gearboxImg,
  'C-305': airCompressorImg,
  'COMPRESSOR-C305': airCompressorImg,

  // 🏗️ STRUCTURAL INFRASTRUCTURE
  'CP-021': concretePillarImg,
  'PILLAR-CP021': concretePillarImg,
  'SB-114': steelBeamImg,
  'BEAM-SB114': steelBeamImg,
  'SJ-087': structuralJointImg,
  'JOINT-SJ087': structuralJointImg,

  // 🔌 ELECTRICAL
  'EP-052': electricalPanelImg,
  'PANEL-EP052': electricalPanelImg,
  'TR-009': transformerTrImg,
  'TRANS-TR009': transformerTrImg,

  // 🛢️ STORAGE & PIPELINE
  'ST-301': storageTankImg,
  'TANK-ST301': storageTankImg,
  'PL-201': pipelinePlImg,
  'PIPE-PL201': pipelinePlImg,
  'PV-102': pressureVesselImg,
  'VESSEL-PV102': pressureVesselImg,

  // Legacy mappings
  'BRIDGE-102': bridge102Img,
  'BRG-102-S5': bridge102Img,
  'TRANS-204': transformer204Img,
  'TRN-204-N': transformer204Img,
  'PIPE-201': pipeline201Img,
  'TOWER-44': cellTower44Img,
  'TWR-044-RP': cellTower44Img,
  'DAM-01': mainDam01Img,
  'WND-401-E': windTurbine401Img
};

export function getAssetImage(idOrName: string, fallbackType?: string): string {
  if (!idOrName) return industrialMotorImg;
  
  const upper = idOrName.toUpperCase();

  // Match by exact codes
  if (upper.includes('M-401') || upper.includes('MOTOR')) return industrialMotorImg;
  if (upper.includes('P-204') || upper.includes('CENTRIFUGAL') || upper.includes('PUMP')) return centrifugalPumpImg;
  if (upper.includes('G-118') || upper.includes('GEARBOX')) return gearboxImg;
  if (upper.includes('C-305') || upper.includes('COMPRESSOR')) return airCompressorImg;
  if (upper.includes('CP-021') || upper.includes('PILLAR') || upper.includes('CONCRETE PILLAR')) return concretePillarImg;
  if (upper.includes('SB-114') || upper.includes('BEAM') || upper.includes('STEEL BEAM')) return steelBeamImg;
  if (upper.includes('SJ-087') || upper.includes('JOINT') || upper.includes('STRUCTURAL JOINT')) return structuralJointImg;
  if (upper.includes('EP-052') || upper.includes('PANEL') || upper.includes('ELECTRICAL PANEL')) return electricalPanelImg;
  if (upper.includes('TR-009') || upper.includes('TRANSFORMER')) return transformerTrImg;
  if (upper.includes('ST-301') || upper.includes('TANK') || upper.includes('STORAGE TANK')) return storageTankImg;
  if (upper.includes('PL-201') || upper.includes('PIPELINE') || upper.includes('PIPE')) return pipelinePlImg;
  if (upper.includes('PV-102') || upper.includes('VESSEL') || upper.includes('PRESSURE VESSEL')) return pressureVesselImg;

  // Legacy matches
  if (upper.includes('BRIDGE') || upper.includes('BRG')) return bridge102Img;
  if (upper.includes('TOWER') || upper.includes('TWR') || upper.includes('CELL')) return cellTower44Img;
  if (upper.includes('DAM') || upper.includes('HYDRO')) return mainDam01Img;
  if (upper.includes('TURBINE') || upper.includes('ROTOR') || upper.includes('WND')) return windTurbine401Img;

  if (fallbackType) {
    const typeUpper = fallbackType.toUpperCase();
    if (typeUpper.includes('MOTOR') || typeUpper.includes('MACHINERY')) return industrialMotorImg;
    if (typeUpper.includes('PUMP')) return centrifugalPumpImg;
    if (typeUpper.includes('GEAR')) return gearboxImg;
    if (typeUpper.includes('COMPRESSOR')) return airCompressorImg;
    if (typeUpper.includes('PILLAR') || typeUpper.includes('CIVIL')) return concretePillarImg;
    if (typeUpper.includes('BEAM') || typeUpper.includes('INFRASTRUCTURE')) return steelBeamImg;
    if (typeUpper.includes('JOINT')) return structuralJointImg;
    if (typeUpper.includes('PANEL') || typeUpper.includes('ELECTRICAL')) return electricalPanelImg;
    if (typeUpper.includes('TRANSFORMER')) return transformerTrImg;
    if (typeUpper.includes('TANK') || typeUpper.includes('STORAGE')) return storageTankImg;
    if (typeUpper.includes('PIPE') || typeUpper.includes('PIPELINE')) return pipelinePlImg;
    if (typeUpper.includes('VESSEL')) return pressureVesselImg;
  }

  return industrialMotorImg;
}
