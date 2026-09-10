import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export const fetchHealth = async () => {
  const res = await client.get('/health');
  return res.data;
};

export const fetchMetadata = async () => {
  const res = await client.get('/ocean/metadata');
  return res.data;
};

export const fetchTemperature = async ({ depth = 5.0, time = '2020-01-15T00:00:00Z', bounds = {} }) => {
  const res = await client.get('/ocean/temperature', {
    params: {
      depth,
      time,
      lat_min: bounds.lat_min ?? 5.0,
      lat_max: bounds.lat_max ?? 25.0,
      lon_min: bounds.lon_min ?? 60.0,
      lon_max: bounds.lon_max ?? 90.0,
    },
  });
  return res.data;
};

export const fetchSalinity = async ({ depth = 5.0, time = '2020-01-15T00:00:00Z', bounds = {} }) => {
  const res = await client.get('/ocean/salinity', {
    params: {
      depth,
      time,
      lat_min: bounds.lat_min ?? 5.0,
      lat_max: bounds.lat_max ?? 25.0,
      lon_min: bounds.lon_min ?? 60.0,
      lon_max: bounds.lon_max ?? 90.0,
    },
  });
  return res.data;
};

export const fetchCurrents = async ({ time = '2018-01-10T00:00:00Z', bounds = {} }) => {
  const res = await client.get('/ocean/currents', {
    params: {
      time,
      lat_min: bounds.lat_min ?? 5.0,
      lat_max: bounds.lat_max ?? 25.0,
      lon_min: bounds.lon_min ?? 60.0,
      lon_max: bounds.lon_max ?? 90.0,
    },
  });
  return res.data;
};

export const fetchObservations = async (bounds = {}) => {
  const res = await client.get('/observations', {
    params: {
      lat_min: bounds.lat_min ?? -10.0,
      lat_max: bounds.lat_max ?? 25.0,
      lon_min: bounds.lon_min ?? 55.0,
      lon_max: bounds.lon_max ?? 95.0,
      time_min: bounds.time_min ?? '2020-01-01T00:00:00Z',
      time_max: bounds.time_max ?? '2020-06-30T00:00:00Z',
    },
  });
  return res.data;
};

export const fetchFloatProfile = async (platformId) => {
  const res = await client.get(`/observations/${platformId}`);
  return res.data;
};

export const fetchComparison = async (platformId, depth = 5.0, time = '2020-01-15T00:00:00Z') => {
  const res = await client.get('/comparison', {
    params: {
      platform_id: platformId,
      depth,
      time,
    },
  });
  return res.data;
};
