import { subDays } from "date-fns";
import { useEffect, useState } from "react";
import api from "../../../api";
import Loading from "../../Loading";
import UtilizationChart from "../charger/UtilizationChart";

const LocationUtilization = (props) => {

  const [location, setLocation] = useState();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const locationRes = await api.charger.location({ params: { id: props.id }});

    if(locationRes.error) {
      return;
    }

    setLocation(locationRes.data);
    const transactions = await Promise.all( 
      locationRes.data.Chargers.map((charger) => api.charger.transaction({ 
        params: { 
          id: charger.id, 
          start: subDays(new Date(), 7),
          end: new Date()
        }
      }))
    );
    setTransactions(transactions.map((promise) => promise.data).flat()); 
    setLoading(false);
  }

  const getTransactions = async (startDate, endDate) => {
    if(!startDate || !endDate) return;
    const transactionsTmp = await Promise.all(location.Chargers.map(
      (charger) => api.charger.transaction({ 
        params: { 
          id: charger.id, 
          start: startDate,
          end: endDate
        }
      })
    ));
    setTransactions(transactionsTmp.map(promise => promise.data).flat());
  }
  
  if(loading) {
    return(<Loading />);
  } else {
    return(
      <div>
        <UtilizationChart 
          transactions={transactions} chargers={location.Chargers.length || 1} onDateChange={getTransactions} />
      </div>
    );
  }
}

export default LocationUtilization;
