import axios from 'axios';
import moment from 'moment';

const methods = {
  get: 'get',
  post: 'post',
  patch: 'patch',
  delete: 'delete',
};

const requestGenerator = (getBase) => (method, uri) => (data = {}) => {
  let requestPromise;
  switch (method) {
    case methods.get:
    case methods.delete:
      requestPromise = axios[method](`${getBase()}/${uri}`, {
        params: data,
      });
      break;
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
  getChargers: r('get', 'charger'),
  getLeviton: async () => {
    const res = await r('get', 'evr/leviton/evr?limit=1250')();
    return {data: res.data.map(d => ({ ...d, time: moment(d.timestamp).format('MMM DD h:mma') })).reverse()};
  },
  getLevitonByDate: async (dateStart, dateEnd) => {
    const res = await r('get', `evr/leviton/evr?dateStart=${dateStart.toString()}&dateEnd=${dateEnd.toString()}`)();
    return {data: res.data.map(d => ({ ...d, time: moment(d.timestamp).format('MMM DD h:mma') })).reverse()};
  },
  getCurrentLeviton: async () => {
    const res = await r('get', 'evr/leviton/evr?limit=1')();
    return {data: res.data.map(d => ({ ...d, time: moment(d.timestamp).format('MMM DD h:mma') })).reverse()};
  },
  charger: (chargerId) => ({
    get: r('get', `charger/${chargerId}`),
    getStatus: r('get', `charger/${chargerId}/status?recent=true`),
    getAllStatus: r('get', `charger/${chargerId}/status?limit=25`),
    getChargeProfile: r('get', `charger/${chargerId}/profile/current`),
    getAllProfiles: r('get', `charger/${chargerId}/profile?limit=25`),
    getTransactions: r('get', `charger/${chargerId}/transaction?limit=25`),
    getCurrentTransaction: r('get', `charger/${chargerId}/transaction/current`),
    meterValues: (transactionId) => ({
      getMeterValues: r('get', `charger/${chargerId}/meterValues?transactionId=${transactionId}`),
    }),
  }),
  transactions: ({
    getTransactions: r('get', 'charger/transaction'),
  }),
  newflyer: ({
    getAll: r('get', 'bus'),
    specific: (busId) => ({
      getRoute: r('get', `bus/${busId}`),
      getAllRoutes: (numOfDays) => r('get', `bus/${busId}/route/useful?days=${numOfDays}&limit=750`)(),
    }),
  }),
  tpss: ({
    getAll: r('get', 'tpss/'),
  }),
  ems: ({
    yaskawa: ({
      getAll: r('get', 'evr/yaskawa?limit=1250'),
      get100: r('get', 'evr/yaskawa?limit=100'),
      getStatus: r('get', 'yaskawa?alive=true'),
      current: r('get', 'evr/yaskawa?limit=1')
    }),
    gustav_klein: ({
      getAll: r('get', 'evr/gustav?limit=1250'), // TODO change this
      get100: r('get', 'evr/gustav?limit=100'),
      getStatus: r('get', 'gustav?alive=true'),
      current: r('get', 'evr/gustav?limit=1')
    }),
    fronius: ({
      getModelNames: r('get', 'evr/fronius'),
      specific: (model) => ({
        getModelData: r('get', `evr/fronius/${model}`),
        get100: r('get', `evr/fronius/${model}?limit=100`),
        getStatus: r('get', `fronius?model=${model}&alive=true`),
        current: r('get', `evr/fronius/${model}?limit=1`)
      })
    }),
    sma50: ({
      getAll: r('get', 'evr/sma50?limit=1250'),
      get100: r('get', 'evr/sma50?limit=100'),
      getStatus: r('get', 'sma50?alive=true'),
      current: r('get', 'evr/sma50?limit=1'),
    }),
    sma7: ({
      getAll: r('get', 'evr/sma7?limit=1250'),
      get100: r('get', 'evr/sma7?limit=100'),
      current: r('get', 'evr/sma7?limit=1'),
      getStatus: r('get', 'sma7?alive=true')
    })
  }),
  viriciti: ({
    getAll: r('get', 'viriciti/bus/all'),
    specific: (busId, limit=1) => ({
      getBus: r('get', `viriciti/bus/${busId}`),
      getCurrent: r('get', `viriciti/current/${busId}?limit=${limit}`),
      getGPS: r('get', `viriciti/gps/${busId}?limit=${limit}`),
      getOdo: r('get', `viriciti/odo/${busId}?limit=${limit}`),
      getPower: r('get', `viriciti/power/${busId}?limit=${limit}`),
      getSOC: r('get', `viriciti/soc/${busId}?limit=750`),
      getSpeed: r('get', `viriciti/speed/${busId}?limit=${limit}`),
      getVoltage: r('get', `viriciti/voltage/${busId}?limit=${limit}`),
      getEnergyUsedPerDay: r('get', `viriciti/energy_used_per_day/${busId}?limit=${limit}`),
      getDistanceDrivenPerDay: r('get', `viriciti/distance_driven_per_day/${busId}?limit=${limit}`)

    })
  })
}

export default api
