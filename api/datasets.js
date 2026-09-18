export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const datasets = [
    {
      id: 'ds-1',
      dataset_name: 'Road Damage Dataset (RDD2022)',
      source: 'Global Road Damage Detection Challenge / IEEE BigData',
      license: 'CC BY-SA 4.0',
      asset_type: 'Road',
      defect_classes: JSON.stringify(['Longitudinal Crack', 'Transverse Crack', 'Alligator Crack', 'Pothole']),
      number_of_images: 47420,
      training_usage: 'Computer vision benchmark for roadway surface degradation',
      validation_usage: 'Model fine-tuning and validation benchmark',
      access_url: 'https://github.com/sekilab/RoadDamageDetector'
    },
    {
      id: 'ds-2',
      dataset_name: 'SDNET2018 Benchmark Dataset',
      source: 'Utah State University / Engineering Research',
      license: 'Open Access / Academic Research',
      asset_type: 'Bridge',
      defect_classes: JSON.stringify(['Concrete Crack', 'Surface Spalling', 'Deck Delamination']),
      number_of_images: 56000,
      training_usage: 'Deep learning benchmark for concrete crack identification',
      validation_usage: 'Validation of surface fracture detection heuristics',
      access_url: 'https://digitalcommons.usu.edu/all_datasets/48/'
    },
    {
      id: 'ds-3',
      dataset_name: 'MVTec Anomaly Detection (MVTec AD)',
      source: 'MVTec Software GmbH',
      license: 'Non-commercial Research License',
      asset_type: 'Industrial Machinery',
      defect_classes: JSON.stringify(['Crack', 'Scratch', 'Dent', 'Contamination', 'Deformation']),
      number_of_images: 5354,
      training_usage: 'Industrial surface defect and anomaly benchmarking',
      validation_usage: 'Visual defect identification validation',
      access_url: 'https://www.mvtec.com/company/research/datasets/mvtec-ad'
    }
  ];

  return res.status(200).json({ success: true, count: datasets.length, datasets });
}
