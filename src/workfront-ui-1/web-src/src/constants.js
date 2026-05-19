export const PRIORITY_NAMES = ['None', 'Low', 'Normal', 'High', 'Urgent'];

export const getPriorityName  = (value) => PRIORITY_NAMES[parseInt(value)] ?? 'Normal';
export const getPriorityValue = (name)  => { const i = PRIORITY_NAMES.indexOf(name); return i !== -1 ? i : 2; };

export const getPriorityColor = (priorityValue) => {
  switch (priorityValue) {
    case 3:
    case 4:  return '#ef4444';
    case 1:  return '#64748b';
    default: return '#64748b';
  }
};

export const STATUS_MAP = {
  'CUR': 'Current',
  'REQ': 'Requested',
  'ONH': 'On Hold',
  'PLN': 'Planning',
  'CPL': 'Complete',
  'DED': 'Dead'
};

export const getStatusName = (code) => STATUS_MAP[code] || code;
export const getStatusCode = (name) => Object.keys(STATUS_MAP).find(k => STATUS_MAP[k] === name) || name;

export const getStatusColor = (statusCode) => {
  switch (statusCode) {
    case 'CUR': return '#10b981';
    case 'REQ': return '#3b82f6';
    case 'ONH': return '#f59e0b';
    case 'PLN': return '#3b82f6';
    case 'CPL': return '#64748b';
    default:    return '#64748b';
  }
};
