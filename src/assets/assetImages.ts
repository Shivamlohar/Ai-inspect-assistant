import bridge102Img from './images/bridge_102.jpg';
import transformer204Img from './images/transformer_204.jpg';
import pipeline201Img from './images/pipeline_201.jpg';
import cellTower44Img from './images/cell_tower_44.jpg';
import mainDam01Img from './images/main_dam_01.jpg';
import windTurbine401Img from './images/wind_turbine_401.jpg';

export {
  bridge102Img,
  transformer204Img,
  pipeline201Img,
  cellTower44Img,
  mainDam01Img,
  windTurbine401Img
};

export const ASSET_IMAGES: Record<string, string> = {
  'BRIDGE-102': bridge102Img,
  'BRG-102-S5': bridge102Img,
  'TRANS-204': transformer204Img,
  'TRN-204-N': transformer204Img,
  'PIPE-201': pipeline201Img,
  'TOWER-44': cellTower44Img,
  'TWR-044-RP': cellTower44Img,
  'DAM-01': mainDam01Img,
  'WND-401-E': windTurbine401Img,
  'M-401': windTurbine401Img
};

export function getAssetImage(idOrName: string, fallbackType?: string): string {
  if (!idOrName) return bridge102Img;
  
  const upper = idOrName.toUpperCase();

  if (upper.includes('BRIDGE') || upper.includes('BRG')) return bridge102Img;
  if (upper.includes('TRANS') || upper.includes('TRN')) return transformer204Img;
  if (upper.includes('PIPE')) return pipeline201Img;
  if (upper.includes('TOWER') || upper.includes('TWR') || upper.includes('CELL')) return cellTower44Img;
  if (upper.includes('DAM') || upper.includes('HYDRO')) return mainDam01Img;
  if (upper.includes('TURBINE') || upper.includes('ROTOR') || upper.includes('WND') || upper.includes('M-401')) return windTurbine401Img;

  if (fallbackType) {
    const typeUpper = fallbackType.toUpperCase();
    if (typeUpper.includes('BRIDGE')) return bridge102Img;
    if (typeUpper.includes('TRANS')) return transformer204Img;
    if (typeUpper.includes('PIPE')) return pipeline201Img;
    if (typeUpper.includes('TOWER')) return cellTower44Img;
    if (typeUpper.includes('DAM')) return mainDam01Img;
    if (typeUpper.includes('TURBINE') || typeUpper.includes('WIND') || typeUpper.includes('ROTOR')) return windTurbine401Img;
  }

  return bridge102Img;
}
