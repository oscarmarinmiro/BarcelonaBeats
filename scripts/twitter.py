import requests
import json
from datetime import datetime
import time

from constants import TWITTER_PLACE_ID, TWITTER_API_CALL, TWITTER_SLEEP_TIME
from datastore import DataStore
from utils import format_exception
from log import get_logger


logger = get_logger('twitter')

def get_twitter_data(since_id):
    try:
        params = {'q': 'place:%s' % (TWITTER_PLACE_ID), 'rpp': 100}
        if since_id is not None:
            params['since_id'] = since_id
        data = json.loads(requests.get(TWITTER_API_CALL, params=params).content)
        return (data['results'], data['max_id_str'])
    except Exception as e:
        logger.error(format_exception(e))
        return(None, None)

def format_twitter_data(raw):
    result = list()
    for item in raw:
        try:
            if item['geo'] is not None:
                result.append({'timestamp': datetime.utcnow(),
                               'type': 'twitter',
                               'geo': {'type': 'point',
                                       'info': {'lat': item['geo']['coordinates'][0],
                                               'lng': item['geo']['coordinates'][1]}},
                                'data': item})
        except Exception as e:
            logger.error(format_exception(e))
    return result

def twitter(datastore, since_id):
    (data, since_id) = get_twitter_data(since_id)
    datastore.insert(format_twitter_data(data))
    return since_id

if __name__ == '__main__':
    since_id = None
    datastore = DataStore()
    while True:
        since_id = twitter(datastore, since_id)
        time.sleep(TWITTER_SLEEP_TIME)
