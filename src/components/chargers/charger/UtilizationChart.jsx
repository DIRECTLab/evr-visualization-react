import { useState, useEffect } from 'react';
import { 
  differenceInDays,
  eachDayOfInterval,
  endOfDay,
  endOfMinute,
  isBefore,
  startOfDay,
  startOfMinute,
  interval,
  getDay,
  format,
  millisecondsToHours,
  areIntervalsOverlapping,
  isAfter,
  subDays
} from 'date-fns';

/* Props
 * transactions - array of charger transactions
 * onDateChange - function that will have the filter state passed back to it,
 * chargers - the number of chargers represented in this utilization graph
 */

const UtilizationChart = (props) => {
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [endTimeFilter, setEndTimeFilter] = useState('');
  const [weekLengthFilter, setWeekLengthFilter] = useState('full-week');
  const [utilizationTime, setUtilizationTime] = useState(0);
  const [filterRangeTime, setFilterRangeTime] = useState(0);

  useEffect(() => {
    if(startDateFilter === '') { setEndDateFilter(format(new Date(), 'yyyy-MM-dd')); }
    if(endDateFilter === '') { setStartDateFilter(format(getEarliestTransaction() || subDays(new Date(), 7), 'yyyy-MM-dd')); }
    if(props.onDateChange) props.onDateChange(startDateFilter, endDateFilter);
  }, [endDateFilter, startDateFilter]);

  useEffect(() => {
    if(startTimeFilter === '') { setStartTimeFilter('00:00'); }
    if(endTimeFilter === '') { setEndTimeFilter('23:59'); }
  }, [startTimeFilter, endTimeFilter]);

  useEffect(() => {
    if(!startTimeFilter || !endTimeFilter || !startDateFilter || !endDateFilter || !props.transactions) return;
    setUtilizationTime(getUtilizationMilliseconds());
    setFilterRangeTime(getFilteredRangeMilliseconds() * (props.chargers || 1));
  }, [startTimeFilter, endTimeFilter, startDateFilter, endDateFilter, weekLengthFilter, props.transactions, props.chargers]);

  const getStartDay = () => {
    let startDate = startDateFilter;
    if(startDate === '') startDate = getEarliestTransaction() || subDays(new Date(), 7);
    return startOfDay(startDate);
  }

  const getEndDay = () => {
    let endDate = endDateFilter;
    if(endDate === '') endDate = Date.now();
    return endOfDay(endDate);
  }

  const filterTransactionsByDateRange = () => {
    let tmpTransactions = [...props.transactions];
    tmpTransactions = tmpTransactions.filter((transaction) => areIntervalsOverlapping(
      { start: new Date(transaction.timestampStart), end: new Date(transaction.timestampEnd) },
      { start: getStartDay(), end: getEndDay() }
    ));

    return tmpTransactions;
  }

  const dayAtStartTime = (day) => {
    let dayStart = day;
    dayStart.setHours(startTimeFilter.split(':')[0]);
    dayStart.setMinutes(startTimeFilter.split(':')[1]);

    return startOfMinute(dayStart);
  }

  const dayAtEndTime = (day) => {
    let dayEnd = day;
    dayEnd.setHours(endTimeFilter.split(':')[0]);
    dayEnd.setMinutes(endTimeFilter.split(':')[1]);

    return startOfMinute(dayEnd);
  }

  const getUtilizationMilliseconds = () => {

    const tmpTransactions = filterTransactionsByDateRange();
    let finalTime = 0;

    for(const day of getEachDayOfInterval()) {
      const dayStart = dayAtStartTime(day);
      const dayEnd = dayAtEndTime(day);

      const relevantTransactions = tmpTransactions.filter(transaction => areIntervalsOverlapping(
        { start: dayStart, end: dayEnd },
        { start: new Date(transaction.timestampStart), end: new Date(transaction.timestampEnd)}
      ));

      const tmpTime = relevantTransactions.reduce((time, transaction) => {
        if(!transaction.timestampStart || !transaction.timestampEnd) return time;
        const transactionStart = new Date(transaction.timestampStart);
        const transactionEnd = new Date(transaction.timestampEnd);
        // Four possibilities
        // 1. Transaction is entirely contained within the interval
        // 2. Transaction entirely contains the interval
        // 3. Transaction starts, but does not end within the interval
        // 4. Transaction ends, but does not start within the interval
        if(isAfter(transactionStart, dayStart) && isAfter(dayEnd, transactionEnd)) {
          return time + (transactionEnd.getTime() - transactionStart.getTime());
        } else if(isAfter(dayStart, transactionStart) && isAfter(transactionEnd, dayEnd)) {
          return time + (dayEnd.getTime() - dayStart.getTime());
        } else if(isAfter(transactionStart, dayStart) && isAfter(transactionEnd, dayEnd)) {
          return time + (dayEnd.getTime() - transactionStart.getTime());
        } else if(isAfter(dayStart, transactionStart) && isAfter(dayEnd, transactionEnd)) {
          return time + (transactionEnd.getTime() - dayStart.getTime());
        }

        return time;
      }, 0);
      finalTime += tmpTime;
    }

    return finalTime;
  }

  const getEarliestTransaction = () => {
      return props.transactions.reduce((accumulator, currentValue) => {
        return accumulator === null || isBefore(currentValue.timestampStart, accumulator) ? currentValue.timestampStart : accumulator;
      }, null);
  }

  const getEachDayOfInterval = () => {
    const intervalRange = interval(getStartDay(), getEndDay());
    return eachDayOfInterval(intervalRange).map((day) => {
      const dayOfWeek = getDay(day);
      if(weekLengthFilter === 'weekdays') {
        if(dayOfWeek !== 5 && dayOfWeek !== 6) return day;
      } else if(weekLengthFilter === 'weekend') {
        if(dayOfWeek === 5 || dayOfWeek === 6) return day;
      } else {
        return day;
      }
    }).filter(day => !!day);
  }

  const getFilteredRangeMilliseconds = () => {

    const endDate = getEndDay();
    const startDate = getStartDay();

    let startTime = '00:00';
    let endTime = '23:59';

    if(startTimeFilter !== '') { startTime = startTimeFilter; }
    if(endTimeFilter !== '') { endTime = endTimeFilter };

    startTime = new Date(2020, 12, 10, startTime.split(':')[0], startTime.split(':')[1]);
    startTime = startOfMinute(startTime);
    endTime = new Date(2020, 12, 10, endTime.split(':')[0], endTime.split(':')[1]);
    endTime = endOfMinute(endTime);

    const timeMilliseconds = endTime.getTime() - startTime.getTime() + 1;

    let days = differenceInDays(endDate, startDate) + 1; // The 1 is because it doesn't count the very last (or maybe the very first) day as a full day
    let daysToRemove = days - getEachDayOfInterval().length;

    return (days - daysToRemove) * timeMilliseconds;
  }

  const getUtilizationPercentage = () => {
    return utilizationTime / filterRangeTime;
  }

  return (
    <div className="flex justify-around">
      <div>
        <span className="label-text text-lg mt-1 font-bold">Select a Date Range (Empty is First Transaction until Now)</span>
        <div className="flex items-center">
          <label htmlFor="start-date">From: </label>
          <input id="start-date" type="date" className="input" value={startDateFilter} onChange={(e) => { setStartDateFilter(e.target.value); }}/>
          <label htmlFor="end-date">To: </label>
          <input id="end-date" type="date" className="input" value={endDateFilter} onChange={(e) => { setEndDateFilter(e.target.value); }}/>
        </div>
        <span className="label-text text-lg mt-1 font-bold">Select a Time Range for the Dates</span>
        <div className="flex items-center">
          <label htmlFor="start-time">Start: </label>
          <input id="start-time" type="time" className="input" value={startTimeFilter} onInput={(e) => { setStartTimeFilter(e.target.value); }}/>
          <label htmlFor="end-time">End: </label>
          <input id="end-time" type="time" className="input" value={endTimeFilter} onInput={(e) => { setEndTimeFilter(e.target.value); }}/>
        </div>
        <span className="label-text text-lg mt-1 font-bold">Select Days of the Week</span>
        <div className="flex items-center my-2">
          <label htmlFor="full-week">Full Week</label>
          <input 
            id="full-week" 
            type="radio" 
            name="full-week" 
            onChange={(e) => setWeekLengthFilter('full-week')}
            className="radio mx-1 mr-4" 
            checked={'full-week' === weekLengthFilter} 
          />
          <label htmlFor="weekend">Weekend</label>
          <input 
            id="weekend" 
            type="radio" 
            name="weekend" 
            onChange={(e) => setWeekLengthFilter('weekend')}
            className="radio mx-1 mr-4" 
            checked={'weekend' === weekLengthFilter} 
          />
          <label htmlFor="weekdays">Weekdays</label>
          <input 
            id="weekdays" 
            type="radio" 
            name="weekdays" 
            onChange={(e) => setWeekLengthFilter('weekdays')}  
            className="radio mx-1 mr-4" 
            checked={'weekdays' === weekLengthFilter} 
          />
        </div>
      </div>
      <div className="flex items-center flex-col text-center">
        <div className="text-xl"> <span className="font-bold text-primary">{millisecondsToHours(utilizationTime)}</span> hrs. of utilization out of <span className="font-bold text-primary">{millisecondsToHours(filterRangeTime)}</span> hrs.</div>
        <div className="text-xl">within date and time range from <span className="font-bold text-primary">{props.chargers || 1}</span> chargers</div>
        <div className="radial-progress text-primary m-6" style={{"--value": getUtilizationPercentage() * 100}} role="progressbar">
          {(getUtilizationPercentage() * 100).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default UtilizationChart;
