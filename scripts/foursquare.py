import requests
import time
from datetime import datetime
import json
from urlparse import urljoin
import logging

from constants import FSQ_TRENDING_VENUES_API_CALL, \
                      FSQ_CLIENT_ID, FSQ_CLIENT_SECRET, \
                      MIN_BCN_LAT, MIN_BCN_LNG, \
                      MAX_BCN_LAT, MAX_BCN_LNG, \
                      LAT_DELTA, LNG_DELTA, FSQ_SLEEP_TIME
from datastore import DataStore
from utils import format_exception

from log import get_logger

logger = get_logger('foursquare')


def get_fsq_data():
    result = list()
    #Build grid
    _temp = dict()
    for i in xrange(0, 8):
        for j in xrange(0, 8):
            try:
                params = {'ll': '%s,%s'% (MIN_BCN_LAT + (i * LAT_DELTA),
                                          MIN_BCN_LNG + (j * LNG_DELTA)),
                          'radius': 2000,
                          'limit': 50,
                          'client_id': FSQ_CLIENT_ID,
                          'client_secret': FSQ_CLIENT_SECRET,
                          'v': datetime.now().strftime('%Y%m%d')}
                r = requests.get(FSQ_TRENDING_VENUES_API_CALL, params=params, verify=True)
                data = json.loads(r.content)['response']['venues']
                for item in data:
                    data = format_fsq_data(item)
                    if data is not None:
                        if not item['id'] in _temp:
                            _temp[item['id']] = data
            except Exception as e:
                logger.error(format_exception(e))
    for item in _temp.values():
        result.append(item)
    return result

def format_fsq_data(raw):
    if isinstance(raw, list):
        pass
    else:
        return {'timestamp': datetime.utcnow(),
                'geo': {'type': 'point',
                        'info': {'lat': raw['location']['lat'],
                                 'lng': raw['location']['lng']}},
                'type': 'foursquare',
                'data': {'name': raw['name'],
                         'checkins': raw['hereNow']['count'],
                         'venueType': raw['categories'][0]['name']}}

def foursquare(datastore):
    datastore.insert(get_fsq_data())

if __name__ == '__main__':
    datastore = DataStore()
    while True:
        try:
            foursquare(datastore)
        finally:
            time.sleep(FSQ_SLEEP_TIME)
