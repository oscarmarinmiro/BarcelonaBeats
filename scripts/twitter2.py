import requests
import json
from datetime import datetime
import time

from twython import Twython

from constants import BCN_LAT,BCN_LON,BCN_RADIUS,TWITTER_PLACE_ID, TWITTER_API_CALL, TWITTER_SLEEP_TIME
#from datastore import DataStore
from utils import format_exception
from log import get_logger


logger = get_logger('twitter')


APP_KEY = 'cEz3yoNtkoHZ2HTDoHuf7w'
APP_SECRET = '98oEfwnOtf1KMrJe89hUNzAkFw2d0Q5ihtPUI7s'
OAUTH_TOKEN = '18759767-dZtSxpgLdH1C4hHqUf05JchiVYVVNjeGHMQcXjBOt'
OAUTH_TOKEN_SECRET = 'lGN9oS9eQYMlnlLQvIzfR4HUJVYPAKukAXws72Dnbjru3'


def get_twitter_data(since_id):
    try:
        twitter = Twython(APP_KEY, APP_SECRET,
                      OAUTH_TOKEN, OAUTH_TOKEN_SECRET)
        geocode = '%s,%s,%s' % (BCN_LAT,BCN_LON,BCN_RADIUS)
        print geocode
        params = {'q':'', 'count': 100, 'geocode':geocode}
        if since_id is not None:
            params['since_id'] = since_id
        data = twitter.search(**params)
        return (data['statuses'], data['search_metadata']['max_id'])
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
    #datastore.insert(format_twitter_data(data))
    print format_twitter_data(data)
    return since_id

if __name__ == '__main__':
    since_id = None
    #datastore = DataStore()
    datastore=""
    while True:
        since_id = twitter(datastore, since_id)
        time.sleep(TWITTER_SLEEP_TIME)
