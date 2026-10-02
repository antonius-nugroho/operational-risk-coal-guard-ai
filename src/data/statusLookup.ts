export const STATUS_LOOKUP: Record<string, { meaning: string; eventStatus: string; description: string }> = {
  'RS': {
    meaning: 'Reserve Shutdown',
    eventStatus: 'Reserve Shutdown order by Dispatcher',
    description: 'Stand By pembangkit karena perintah Dispatcher'
  },
  'NC': {
    meaning: 'Non Curtailing',
    eventStatus: 'Non Curtailing',
    description: 'Derating pembangkit karena perintah Dispatcher'
  },
  'PO': {
    meaning: 'Planned Outage',
    eventStatus: 'Planned Outage',
    description: 'Stop pembangkit karena pemeliharaan mayor (overhaul)'
  },
  'MO': {
    meaning: 'Maintenance Outage',
    eventStatus: 'Maintenance Outage',
    description: 'Stop pembangkit karena pemeliharaan minor'
  },
  'PE': {
    meaning: 'Planned Outage Extension',
    eventStatus: 'Planned Outage Extension',
    description: 'Perpanjangan waktu Planned Outage (setelah mendapat ijin dari Dispatcher)'
  },
  'ME': {
    meaning: 'Maintenance Outage Extension',
    eventStatus: 'Maintenance Outage Extension',
    description: 'Perpanjangan waktu Maintenance Outage (setelah mendapat ijin dari Dispatcher)'
  },
  'FO': {
    meaning: 'Forced Outage',
    eventStatus: 'Forced Outage',
    description: 'Stop pembangkit secara paksa atau tidak karena gangguan internal'
  },
  'FO.OS': {
    meaning: 'Forced Outage.Outage Slip',
    eventStatus: 'Outage Slip',
    description: 'Realisasi kelebihan waktu outage diluar PO, PE, MO, ME'
  },
  'FO.SYS': {
    meaning: 'Forced Outage.System',
    eventStatus: 'Forced Outage due to Grid (System)',
    description: 'Stop pembangkit karena gangguan grid (sistem)'
  },
  'FO.ENV': {
    meaning: 'Forced Outage.Environment',
    eventStatus: 'Forced Outage due to Environment',
    description: 'Stop pembangkit karena faktor lingkungan : temperature, banjir, sampah dll'
  },
  'FO.FUEL': {
    meaning: 'Forced Outage.Fuel',
    eventStatus: 'Forced Outage due to Lack of Fuel',
    description: 'Stop pembangkit karena faktor bahan bakar : kuantitas, kualitas'
  },
  'FO.FM': {
    meaning: 'Forced Outage.Force Majeure',
    eventStatus: 'Forced Outage due to Force Majeure',
    description: 'Stop pembangkit karena bencana alam'
  },
  'FO.OTH': {
    meaning: 'Forced Outage.Others',
    eventStatus: 'Forced Outage due to Others External',
    description: 'Stop pembangkit karena faktor eksternal lainnya : Masyarakat, Hukum, Defisit, Garansi'
  },
  'SF': {
    meaning: 'Startup Failure',
    eventStatus: 'Startup Failure',
    description: 'Kelebihan waktu start up pembangkit dari waktu standarnya'
  },
  'PD': {
    meaning: 'Planned Derated',
    eventStatus: 'Planned Derated',
    description: 'Derating pembangkit karena pemeliharaan major'
  },
  'MD': {
    meaning: 'Maintenance Derated',
    eventStatus: 'Maintenance Derated',
    description: 'Derating pembangkit karena pemeliharaan minor'
  },
  'PDE': {
    meaning: 'Planned Derated Extension',
    eventStatus: 'Planned Derated Extension',
    description: 'Perpanjangan waktu Planned Derated (setelah mendapat ijin dari Dispatcher)'
  },
  'MDE': {
    meaning: 'Maintenance Derated Extension',
    eventStatus: 'Maintenance Derated Extension',
    description: 'Perpanjangan waktu Maintenance Derated (setelah mendapat ijin dari Dispatcher)'
  },
  'FD': {
    meaning: 'Forced Derated',
    eventStatus: 'Forced Derated',
    description: 'Derating pembangkit karena gangguan internal'
  },
  'FD.DS': {
    meaning: 'Forced Derated.Derating Slip',
    eventStatus: 'Derating Slip',
    description: 'Realisasi kelebihan waktu derating diluar PD, PDE, MD, MDE'
  },
  'FD.SYS': {
    meaning: 'Forced Derated.System',
    eventStatus: 'Forced Derated due to Grid (System)',
    description: 'Derating pembangkit karena gangguan grid (sistem)'
  },
  'FD.ENV': {
    meaning: 'Forced Derated.Environment',
    eventStatus: 'Forced Derated due to Environment',
    description: 'Derating pembangkit karena faktor lingkungan : temperature, banjir, sampah dll'
  },
  'FD.FUEL': {
    meaning: 'Forced Derated.Fuel',
    eventStatus: 'Forced Derated due to Lack of Fuel',
    description: 'Derating pembangkit karena faktor bahan bakar : kuantitas, kualitas'
  },
  'FD.MP': {
    meaning: 'Forced Derated.Major Problem',
    eventStatus: 'Forced Derated due to Major Problem',
    description: 'Derating pembangkit karena gangguan internal yang tidak bisa diselesaikan di periode tahun tersebut'
  },
  'FD.OTH': {
    meaning: 'Forced Derated.Others',
    eventStatus: 'Forced Derated due to Others External',
    description: 'Derating pembangkit karena faktor eksternal lainnya : Masyarakat, Hukum, Defisit, Garansi'
  },
  'FDRS': {
    meaning: 'Forced Derated Reserve Shutdown',
    eventStatus: 'Forced Derated Reserve Shutdown',
    description: 'Derating pembangkit karena gangguan internal ketika status RS (Standby)'
  },
  'SED': {
    meaning: 'Seasonal Derated',
    eventStatus: 'Seasonal Derated',
    description: 'Derating pembangkit karena faktos musim'
  },
  'SUD': {
    meaning: 'Start Up Derating',
    eventStatus: 'Start Up Derating',
    description: 'Derating pembangkit pada saat Start Up'
  },
  'SHD': {
    meaning: 'Shutdown Derating',
    eventStatus: 'Shutdown Derating',
    description: 'Derating pembangkit pada saat Shutdown'
  }
};
