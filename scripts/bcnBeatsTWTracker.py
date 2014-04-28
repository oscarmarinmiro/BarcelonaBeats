from tweepy.streaming import StreamListener
from tweepy import OAuthHandler
from tweepy import Stream
#import datetime
import traceback
from pymongo import Connection

import sys
import re
from datetime import datetime, timedelta
from email.utils import parsedate_tz

import json
import time

from constants import BCN_LAT,BCN_LON,BCN_RADIUS,TWITTER_PLACE_ID, TWITTER_API_CALL, TWITTER_SLEEP_TIME, MIN_BCN_LAT, MIN_BCN_LNG, MAX_BCN_LAT, MAX_BCN_LNG
from datastore import DataStore
from utils import format_exception
from log import get_logger

CONSUMER_KEY = 'JEGcxU7KphSv8o469X7Vxvmbi'
CONSUMER_SECRET = '1RErcO7dOwj8nbMqbeKVx2qWSHiElaKs4CMK0xMJHSIi3JdDr5'
ACCESS_TOKEN = '295202264-xzqbpWMAYkvSDQUJ77EO2NMSmZUoknokA5hBDy6j'
ACCESS_TOKEN_SECRET = 'AcJssDOP23xPEa8sUPCSu7RZVwSpMJneQupzhjBAArNmf'

#CONSUMER_KEY = 'e3IZVUnTQJzvYRUUK00DA'
#CONSUMER_SECRET = 'ZetmYzr0fqF9dsnhtev9NnHCoEgXHMXqpWXrZXkSKQ'
#ACCESS_TOKEN = '289284899-7mfLx489YHvmrOwwLf1089FqxmT4Z8CUMJMpimN1'
#ACCESS_TOKEN_SECRET = 'Y0boIbUsTzLfO7ghDMODtccYXA6GkylhpHUkHLA8CzUkq'


def get_mongo_time(created):
    time_tuple = parsedate_tz(created.strip())
    dt = datetime.datetime(*time_tuple[:6])
    #dt = dt + timedelta(hours=1)
    date = dt.strftime('%Y%m%d%H%M%S')
    return date


def format_tweet(item):
    result = list()
    print item
    try:
        if item['geo'] is not None:
            result.append({#'timestamp': datetime.utcnow(),
                'timestamp': datetime.utcnow().strftime("YYYYmmdd HHMMSS"),
                'type': 'twitter',
                'geo': {'type': 'point',
                'info': {'lat': item['geo']['coordinates'][0],
                'lng': item['geo']['coordinates'][1]}},
                'data': item})
    except Exception as e:
        print format_exception(e)
        logger.error(format_exception(e))

    return result



class StdOutListener(StreamListener):
    """ A listener handles tweets are the received from the stream.
    This is a basic listener that just prints received tweets to stdout.

    """
    def on_data(self, data):
        data = json.loads(data)
        print format_tweet(data)
        #data['subcoll'] = 'gezi'
        dataStore.insert(format(data))
        return True

    def on_error(self, status):
        print status

if __name__ == '__main__':
    # Connect to mongodb
    #connection = Connection()
    #db = connection['streamsnuestros']
    #collection = db['datactic2']

    logger = get_logger('twitter')

    keywords = []
    people = []
    locations = [MIN_BCN_LNG,MAX_BCN_LAT, MAX_BCN_LNG, MIN_BCN_LAT]

    print "locationS : %s" % locations
    print ','.join(['%.2f' % l for l in locations])

    datastore = DataStore()
    l = StdOutListener()
    auth = OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

    stream = Stream(auth, l)
    stream.filter(track=keywords,follow=people,locations=locations)
