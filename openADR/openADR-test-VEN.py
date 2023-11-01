import asyncio
from datetime import timedelta
from openleadr import OpenADRClient, enable_default_logging
import requests

def signal_sending(
        data={'something': 'string', 'in': 'your neighborhood'}, 
        method:str = "GET", 
        url:str = '', 
        params={}, *args, **kwargs
    ):
    
    if method == "GET":
        requests.get(url=url, params=params)
        print("GET METHOD")
    elif method == "POST":
        print("POST METHOD")
        requests.post(
            url='http://127.0.0.1:5000/hello',
            data=data
        )
    else:
        print("UNKNOWN METHOD")

    pass

enable_default_logging()

async def collect_report_value():
    # This callback is called when you need to collect a value for your Report
    return 1.23

async def handle_event(event):
    # This callback receives an Event dict.
    # You should include code here that sends control signals to your resources.
    first_signal = event['event_signals'][0]
    intervals = first_signal['intervals']
    with open('test-log.txt', 'a') as log_file:
        for i in intervals:
            print(f"Interval Signal: {i['signal_payload']}")
            log_file.write(f"Interval Signal: {i['signal_payload']}\n")
            signal_sending(data={'info': i["signal_payload"]}, method='POST')

    return 'optIn'

async def on_event(event):
    # Check if we can opt in to this event
    first_signal = event['event_signals'][0]
    intervals = first_signal['intervals']
    target = event['target']
    
    return 'optIn'

# Create the client object
client = OpenADRClient(ven_name='ven_400',
                       vtn_url='http://localhost:8030/OpenADR2/Simple/2.0b')

# Add the report capability to the client
client.add_report(callback=collect_report_value,
                  resource_id='device001',
                  measurement='voltage',
                  sampling_rate=timedelta(seconds=10))

# Add event handling capability to the client
client.add_handler('on_event', handle_event)

# Run the client in the Python AsyncIO Event Loop
loop = asyncio.get_event_loop()
loop.create_task(client.run())
loop.run_forever()