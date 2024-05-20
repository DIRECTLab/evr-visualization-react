import axios from 'axios';
import moment from 'moment';

const methods = {
  get: 'get',
};

const requestGenerator = (getBase) => (method, uri) => (data = {}) => {
  let requestPromise;
  switch (method) {
    case methods.get:
    default:
      requestPromise = axios[method](`${getBase()}/${uri}`, data);
      break;
  }
  return requestPromise
    .then(({ data }) => data)
    .catch(e => e.response.data);
};

const getApiBase = () => process.env.REACT_APP_API_BASE_URL;
console.log("API Base URL: " + process.env.REACT_APP_API_BASE_URL);
const r = requestGenerator(getApiBase);

const api = {
  charger: {
    get: r('get', 'charger'),
    status: r('get', 'status'),
    profile: r('get', 'profile'),
    transaction: r('get', 'transaction'),
    location: r('get', 'location'),
  },
  bus: {
    newFlyer: {
      get: r('get', 'new-flyer'),
      routes: r('get', 'new-flyer/route')
    },
    viriciti: {
      get: r('get', 'viriciti'),
      current: r('get', 'viriciti/current'),
      energyUsedPerDay: r('get', 'viriciti/energy-used-per-day'),
      gps: r('get', 'viriciti/gps'),
      odo: r('get', 'viriciti/odo'),
      power: r('get', 'viriciti/power'),
      soc: r('get', 'viriciti/soc'),
      speed: r('get', 'viriciti/speed'),
      voltage: r('get', 'viriciti/voltage'),
    },
  },
  ems: {
    fronius: {
      get: r('get', 'fronius'),
    },
    gustav: {
      get: r('get', 'gustav'),
    },
    leviton: {
      get: r('get', 'leviton'),
    },
    sma7: {
      get: r('get', 'sma7'),
    },
    sma50: {
      get: r('get', 'sma50'),
    },
    yaskawa: {
      get: r('get', 'yaskawa'),
    },
  },
}

export default api
