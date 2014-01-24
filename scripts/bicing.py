import requests
import time
import json
from datetime import datetime

from constants import BICING_INTERNAL_API_CALL, BICING_SLEEP_TIME
from datastore import DataStore
from utils import format_exception
from log import get_logger


logger = get_logger('bicing')

def get_bicing_data():
    try:
        return json.loads(json.loads(requests.post(BICING_INTERNAL_API_CALL).content)[1]['data'])
    except Exception as e:
        logger.error(format_exception(e))
        return []

def format_bicing_data(raw):
    result = list()
    for item in raw:
        try:
            result.append({'timestamp': datetime.utcnow(),
                           'geo': {'type': 'point',
                            'info': {'lat': item['AddressGmapsLatitude'],
                                     'lng': item['AddressGmapsLongitude']}},
                           'type': 'bicing',
                           'data': {'id': item['StationID'],
                                    'stationName': item['StationName'],
                                    'slots': {'occupation': float(item['StationFreeSlot']) / (float(item['StationFreeSlot']) + float(item['StationAvailableBikes'])) if (float(item['StationFreeSlot']) + float(item['StationAvailableBikes'])) > 0 else 0,
                                              'free': int(item['StationFreeSlot']),
                                              'available': int(item['StationAvailableBikes'])}}})
        except Exception as e:
            logger.error(format_exception(e))
    return result

def bicing(datastore):
    d = format_bicing_data(get_bicing_data())
    if len(d) > 0:
        datastore.insert(d)

if __name__ == '__main__':
    datastore = DataStore()
    while True:
        bicing(datastore)
        time.sleep(BICING_SLEEP_TIME)
