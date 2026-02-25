import axios from 'axios';

const base = '/api/huangbinhong'; // 若部署到同域，直接写 /api/huangbinhong

export const getAll = () => axios.get(`${base}/all`).then((r) => r.data.data);
export const getLocations = () => axios.get(`${base}/locations`).then((r) => r.data.data);
export const getTimeline = () => axios.get(`${base}/timeline`).then((r) => r.data.data);
