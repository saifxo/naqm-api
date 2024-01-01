//USER ENUMS

export enum STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum ROLE {
  ADMIN = 'admin',
  USER = 'user',
}

//Data Enums

export enum SORTING_TYPE {
  CLEANEST = 'cleanest',
  WORST = 'worst',
}

export enum AQI_STATUS {
  GOOD = 'good',
  MODERATE = 'moderate',
  UNHEALTHY_SENSITIVE = 'unhealthy sensitive',
  UNHEALTHY = 'unhealthys',
  VERY_UNHEALTHY = 'very unhealthy',
  HAZARDOUS = 'hazardous',
}

export enum AQI_COLORS {
  GOOD = '#00FF40',
  MODERATE = '#ffff00',
  UNHEALTHY_SENSITIVE = '#F9A602',
  UNHEALTHY = '#FF000C',
  VERY_UNHEALTHY = '#9f4576',
  HAZARDOUS = '#800000',
}
