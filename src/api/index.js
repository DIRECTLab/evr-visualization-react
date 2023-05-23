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

// const getApiBase = () => 'http://144.39.204.242:11236';
const getApiBase = () => 'http://localhost:11236'
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
  // getLeviton: async () => {
  //   const res = await r('get', 'evr/leviton/evr?limit=1250')();
  //   return {data: res.data.map(d => ({ ...d, time: moment(d.timestamp).format('MMM DD h:mma') })).reverse()};
  // },
  // getLevitonByDate: async (dateStart, dateEnd) => {
  //   const res = await r('get', `evr/leviton/evr?dateStart=${dateStart.toString()}&dateEnd=${dateEnd.toString()}`)();
  //   return {data: res.data.map(d => ({ ...d, time: moment(d.timestamp).format('MMM DD h:mma') })).reverse()};
  // },
  // getCurrentLeviton: async () => {
  //   const res = await r('get', 'evr/leviton/evr?limit=1')();
  //   return {data: res.data.map(d => ({ ...d, time: moment(d.timestamp).format('MMM DD h:mma') })).reverse()};
  // },
  // tpss: ({
  //   getAll: r('get', 'tpss/'),
  // }),
  // ems: ({
  //   yaskawa: ({
  //     getAll: r('get', 'evr/yaskawa?limit=1250'),
  //     get100: r('get', 'evr/yaskawa?limit=100'),
  //     getStatus: r('get', 'yaskawa?alive=true'),
  //     current: r('get', 'evr/yaskawa?limit=1')
  //   }),
  //   gustav_klein: ({
  //     getAll: r('get', 'evr/gustav?limit=1250'), // TODO change this
  //     get100: r('get', 'evr/gustav?limit=100'),
  //     getStatus: r('get', 'gustav?alive=true'),
  //     current: r('get', 'evr/gustav?limit=1')
  //   }),
  //   fronius: ({
  //     getModelNames: r('get', 'evr/fronius'),
  //     specific: (model) => ({
  //       getModelData: r('get', `evr/fronius/${model}?limit=1250`),
  //       get100: r('get', `evr/fronius/${model}?limit=100`),
  //       getStatus: r('get', `fronius?model=${model}&alive=true`),
  //       current: r('get', `evr/fronius/${model}?limit=1`)
  //     })
  //   }),
  //   sma50: ({
  //     getAll: r('get', 'evr/sma50?limit=1250'),
  //     get100: r('get', 'evr/sma50?limit=100'),
  //     getStatus: r('get', 'sma50?alive=true'),
  //     current: r('get', 'evr/sma50?limit=1'),
  //   }),
  //   sma7: ({
  //     getAll: r('get', 'evr/sma7?limit=1250'),
  //     get100: r('get', 'evr/sma7?limit=100'),
  //     current: r('get', 'evr/sma7?limit=1'),
  //     getStatus: r('get', 'sma7?alive=true')
  //   })
  // }),
}

export default api
