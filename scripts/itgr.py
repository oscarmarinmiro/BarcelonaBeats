from instagram import InstagramAPI
import time
import requests
import json
from datetime import datetime

from constants import INSTAGRAM_API_CALL, INSTAGRAM_LOCATIONS,\
                      INSTAGRAM_CLIENT_ID, INSTAGRAM_SLEEP_TIME
from datastore import DataStore
from utils import format_exception
from log import get_logger

logger = get_logger('instagram')

def get_instagram_data():
    _ = dict()
    for location in INSTAGRAM_LOCATIONS:
        try:
            params = {'lat': location[0], 'lng': location[1], 'client_id': INSTAGRAM_CLIENT_ID}
            params['min_timestamp'] = int(time.time()) - 600
            r = requests.get(INSTAGRAM_API_CALL, params=params)
            d = json.loads(r.content)
            logger.debug(d)
            if 'data' in d:
                for item in d['data']:
                    if not item['id'] in _:
                        _[item['id']] = item
        except Exception as e:
            logger.error(format_exception(e))
    result = list()
    for item in _.values():
        result.append(item)
    return result

def format_instagram_data(raw):
    result = list()
    for item in raw:
        try:
            result.append({'timestamp': datetime.utcnow(),
                           'type': 'instagram',
                           'geo': {'type': 'point',
                                   'info': {'lat': item['location']['latitude'],
                                            'lng': item['location']['longitude']}},
                            'data': item})
        except Exception as e:
            logger.error(format_exception(e))
    return result

def instagram(datastore):
    d = format_instagram_data(get_instagram_data())
    if len(d) > 0:
        datastore.insert(d)

if __name__ == '__main__':
    datastore = DataStore()
    while True:
        instagram(datastore)
        time.sleep(INSTAGRAM_SLEEP_TIME)
