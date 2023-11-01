#===================================================================================================================
#
#   OpenADR Server for Mario
#
#===================================================================================================================
#
#   Uses Openleadr, Logger, _thread
#   Runs functions on multiple threads
#
#===================================================================================================================
#                   <<Functions>>
#   def on_create_party_registration(registration_info): -- assigns register and ven ID to appropriate ven
#   def on_register_report(ven_id, resource_id, measurement, unit, scale, min_sampling_interval, max_sampling_interval) -- recieves the reports from ven and signals back appropriate response
#   def on_update_report(data, ven_id, resource_id, measurement): -- uses reports from ven (data == value and time, resourse_id == machine, measurement == units of measure)
#   def event_response_callback(ven_id, event_id, opt_type) -- responds to ven optIn or optOut
#   def update_info(Grizl_Status) -- sends event to ven to update Grizl Status
#   def is_float(string) -- testing whether a value is a float (used after getting a value from SQL)
#   def getting_power(name) -- getting values from your database
#
#===================================================================================================================

import asyncio
import logging
import mysql.connector
import openleadr
import os
import time
from datetime import *
from datetime import datetime, timezone, timedelta
from functools import partial
from mysql.connector import Error
from MySQL import *
from openleadr import OpenADRServer, enable_default_logging
from openleadr.objects import Event, EventDescriptor, EventSignal, Target, Interval
from functools import partial
import _thread
import threading
import time
from loguru import logger

#---- Logger setup ------------------------------------------------
string = datetime.now()
filePath=os.path.expanduser('~')


if not os.path.exists("Logs"): # If the file path does not exsist create it
    os.mkdir("Logs")
os.chdir("Logs")

def printdd(thing):
    print(f"\t\t\t{thing}")

# maybe add Clear_old_reports(Folder):
# maybe add Logger_setup(name): (this includes everything below)
# maybe add log(time, value, ven_id, resource_id, measurement):

insideFoler = str(date.today())
if not os.path.exists(insideFoler):
    os.mkdir(insideFoler)
os.chdir(insideFoler)

filePath+="\Logs"+"\\"+insideFoler
path = filePath+"\Logs"
final=path
path=path.replace("\\","") # Now the path exists

fileName = "Log_ "+str(date.today())+" "+str(string.hour) + ".txt" # create a file 
#openleadr.enable_default_logging(level=logging.INFO) # <--- This will log to console and is not the desired option
logging.basicConfig(filename=fileName, level=logging.INFO) # Tell python to log to this file
filehandler = logging.FileHandler(fileName) # Create filehandler
logger = logging.getLogger('openleadr') # Get the Logger 
logger.setLevel(logging.INFO) # Log only WARNING or worse
logger.addHandler(filehandler) # Add FileHandler, so the logger can write to the file that was created

#--- End logger --------------------------------------------

#---- MYSQL ------------------------------------------------
# try:
#     connect = False
#     timeout = 0

#     while connect  == False and timeout < 3:
#         #print("ready to connect to mysql \n\n")
#         mySQL = SQL() # MySQL Library
#         mySQL.sql_connect()

#         if mySQL.connection.is_connected(): 
#             connect = True
#             print("\n Connected to MySQL\n")

#             #mySQL.drop_table("equipment")
#             #mySQL.drop_table("reference")
#             #mySQL.drop_table("externalreference")
#             #mySQL.drop_table("user")
#             #mySQL.drop_table("battery")

#             mySQL.createTable_equipment() # create equipment table
#             mySQL.createTable_reference() # create reference value table for power supplies
#             mySQL.createTable_External_reference() # create externalreference 
#             mySQL.createTable_battery()

#             mySQL.Close()

#         else:
#             print("\t No Connection \n")
#             timeout += 1
#             if(timeout > 3):
#                 print("TIME OUT, Please try again")
#             time.sleep(1)

# except Error as err:
#     print(f"\tError: '{err}'")


#---- End MYSQL -----------------------------------------

async def on_create_party_registration(registration_info):
    """
    Inspect the registration info and return a ven_id and registration_id.
    """
    print("REGISTERING")
    if registration_info['ven_name'] == 'ven_400':
        ven_id = 'ven_id_400'
        registration_id = 'reg_id_400'
        return ven_id, registration_id
    else:
        print(registration_info['ven_name'])
        return False

async def on_register_report(ven_id, resource_id, measurement, unit, scale,
                             min_sampling_interval, max_sampling_interval):
    """
    Inspect a report offering from the VEN and return a callback and sampling interval for receiving the reports.
    """
    #print("We are in on register_report")
    callback = partial(on_update_report, ven_id=ven_id, resource_id=resource_id, measurement=measurement)
    sampling_interval = min_sampling_interval
    return callback, sampling_interval


global timer
timer = False

async def on_update_report(data, ven_id, resource_id, measurement):
    """
    Callback that receives report data from the VEN and handles it.
    """
    global timer
    timer = True
    for time, value in data:
        logger.info(f"Ven {ven_id} reported {measurement} = {value} at time {time} for resource {resource_id}")

        #mySQL.sql_connect() # Connect to SQL database
        ID = "" # ID for the sql table
        # identify resource ID and turn into ID for mySQL
        if resource_id == 'Yaskawa':
            ID = 'Yaskawa'
        elif resource_id == 'SMA7':
            ID = 'SMA_SEVEN'
        elif resource_id == 'SMA50':
            ID = 'SMA_FIFTY'
            #print ("\n\n\t\t SMA 50 ", value)
        elif resource_id == 'Fronius20':
            ID = 'Fronius_TWENTY'
        elif resource_id == 'Fronius76':
            ID = 'Fronius_SEVEN_SIX'
        elif resource_id == 'NHR_1':
            ID = 'NHR_ONE'
        elif resource_id == 'NHR_2':
            ID = 'NHR_TWO'
        elif resource_id == 'NHR_3':
            ID = 'NHR_THREE'
        elif resource_id == 'Regatron':
            ID = 'Regatron'
        elif resource_id == 'Logix':
            ID = 'Logix_Blue'
        elif resource_id == 'Control':
            ID = 'Control'

        if measurement == 'Power':
            #update power output from devices. Example: mySQL.update_reference(ID=ID, Power=value)
            Power = value
            #mySQL.update_reference(ID=ID, Power=value)
        elif measurement == 'Status':
            State = value
            #mySQL.update_reference(ID=ID, State=value)
            #update status outptut from devices. Example: mySQL.update_reference(ID=ID, Status=value)
            # State = mySQL.get_from_table(Table="reference", ID=ID, Column='Mode_State')
            # print("This is the State of things: " + State)
            # if value == 1.0 and (State == "'OFF'" or State == "'None'"):
            #     print("THIS NEEDS TO BE HIT!")
            #     mySQL.update_reference(ID=ID, State='ON')
            # elif (State == "'READY'" or State == "'None'"):
            #     mySQL.update_reference(ID=ID, State='OFF')
        
        #mySQL.Close() # close connection to SQL database
    # timer = False

async def event_response_callback(ven_id, event_id, opt_type):
    """
    Callback that receives the response from a VEN to an Event.
    """
    print(f"VEN {ven_id} responded to Event {event_id} with: {opt_type}")

global logging_msg_id
logging_msg_id = 0


#*******************************************************************************************************************************************************

def update_info(Grizl_Status):
    global logging_msg_id
    logging_msg_id += 1
    event_id_str = 'Updating ' + str(logging_msg_id)
    print("before event")
    try: 
        event = Event(event_descriptor=EventDescriptor(event_id=event_id_str,
                                                modification_number=0,
                                                event_status='none',
                                                market_context='http://logging'),
                    event_signals=[EventSignal(signal_id='Grizl_Status',
                                            signal_type='level',
                                            signal_name='simple',
                                            intervals=[{'dtstart':datetime.now(),
                                                                'duration':timedelta(seconds=10),
                                                                'signal_payload':Grizl_Status,}])],
                                # EventSignal(signal_id='Grizl_status',
                                #              signal_type='level',
                                #              signal_name='simple',
                                #              intervals=[{'dtstart':datetime.now(),
                                #                                  'duration':timedelta(seconds=10),
                                #                                  'signal_payload':Grizl_status,}]),
                                # EventSignal(signal_id='Control_Status',
                                #              signal_type='level',
                                #              signal_name='simple',
                                #              intervals=[{'dtstart':datetime.now(),
                                #                                  'duration':timedelta(seconds=10),
                                #                                  'signal_payload':Control_Status,}])],
                targets=[Target(ven_id='ven_id_400')])
        server.add_raw_event(ven_id='ven_id_400', event=event)
    except Exception as e:
        print("Exception" + str(e))

def is_float(string):
    try:
        float(string)
        return True
    except ValueError:
        return False

def getting_power(name):
    global timer
    while(True):
        if (timer == True):
            try:
                print("IN TIMER AREA")
                # mySQL.sql_connect()
                # mySQL.read_table(Table="equipment", ID = '', Column='')
                
                # Getting information from Database -------------------------------------------------
                # Grizl_Status = mySQL.get_from_table(Table="equipment", ID="Grizl", Column='State')
                Grizl_Status = "'None'"
                if Grizl_Status == "'None'":
                    Grizl_Status = 0.0
                elif Grizl_Status == "'ON'":
                    Grizl_Status = 1.0
                elif Grizl_Status == "'OFF'":
                    Grizl_Status = 2.0

                #add in other ocpp

                #------------------------------------------------------------------------------------

                update_info(Grizl_Status)
                print("After update logging info")
                # mySQL.Close()
                timer = False
            except Exception as e:
                print("Exception in getting power " + str(e))

def keyboard_listener():
    i = 0
    while i != 26:
        print(f"Sending: {i}")
        update_info(i)
        i += 1
        time.sleep(5)

def trying_something():
    print("Sending Attempt Of Sending New Signal")
    update_info(420420420420)

global server
server = OpenADRServer(vtn_id='Mariovtn', http_port=8030)

def signal_acceptor(server):
    printdd('acceptor function reached')
    time.sleep(10)
    printdd('time to go')

    num = 400
    while True:
        event_id_str = 'ATTEMPTING: 0'
        try: 
            printdd(f"THERE IS{' ' if os.path.isfile('IO_file.txt') else 'NT'} SUCH A FILE")
            io_file = open('IO_file.txt', 'r+')
            signals = io_file.readlines()
            printdd(f"double check: {len(signals)} elements")
            printdd('file read')
            io_file.truncate(0)
        except:
            printdd("YOU BROKE SOMETHING")

        printdd(f'There is {len(signals)} elements in the signals')

        for s in signals:
            try: 
                event = Event(event_descriptor=EventDescriptor(event_id=event_id_str,
                                                        modification_number=0,
                                                        event_status='none',
                                                        market_context='http://logging'),
                            event_signals=[EventSignal(signal_id='Grizl_Status',
                                                    signal_type='level',
                                                    signal_name='simple',
                                                    intervals=[{'dtstart':datetime.now(),
                                                                        'duration':timedelta(seconds=10),
                                                                        'signal_payload':str(num),}])],
                                        # EventSignal(signal_id='Grizl_status',
                                        #              signal_type='level',
                                        #              signal_name='simple',
                                        #              intervals=[{'dtstart':datetime.now(),
                                        #                                  'duration':timedelta(seconds=10),
                                        #                                  'signal_payload':Grizl_status,}]),
                                        # EventSignal(signal_id='Control_Status',
                                        #              signal_type='level',
                                        #              signal_name='simple',
                                        #              intervals=[{'dtstart':datetime.now(),
                                        #                                  'duration':timedelta(seconds=10),
                                        #                                  'signal_payload':Control_Status,}])],
                        targets=[Target(ven_id='ven_id_400')])
                server.add_raw_event(ven_id='ven_id_400', event=event)
                printdd("Server should have sent signal")
            except Exception as e:
                print("Exception" + str(e))

        num += 1
        printdd("SLEEPY TIME")
        time.sleep(2.5)

async def store_data(data):
    """
    Function that stores data from the report.
    """


async def on_register_report(resource_id, measurement, unit, scale, min_sampling_period, max_sampling_period):
    """
    This is called for every measurement that the VEN is offering as a telemetry report.
    """
    if measurement == 'Voltage':
        return store_data, min_sampling_period



if __name__ == "__main__":
    # Create the server object
    # server = OpenADRServer(vtn_id='Mariovtn', http_port=8030)

    # Add the handler for client (VEN) registrations
    server.add_handler('on_create_party_registration', on_create_party_registration)

    # Add the handler for report registrations from the VEN
    server.add_handler('on_register_report', on_register_report)

    # Add a prepared event for a VEN that will be picked up when it polls for new messages.
    now = datetime.now()
    server.add_event(ven_id='ven_id_400',
                    signal_name='simple',
                    signal_type='level',
                    intervals=[{'dtstart': now,
                                'duration': timedelta(seconds=10),
                                'signal_payload': 1}],
                    callback=event_response_callback)


    t1 = threading.Thread(target=keyboard_listener)
    t1.start()

    # t2 = threading.Thread(target=signal_acceptor, args=[server])
    # t2.start()

    # signal_acceptor(server)

    #_thread.start_new_thread(takeInput,("u1",))
    # Run the server on the asyncio event loop
    loop = asyncio.get_event_loop()
    loop.create_task(server.run_async())
    loop.run_forever()