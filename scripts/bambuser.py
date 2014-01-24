import requests
import json
import time
from datetime import datetime

from datastore import DataStore

def instagram(datastore):
    try:
        data = json.loads(requests.get('http://felixcasanellas.com/bdw/bmbsr/').content)
        for item in data:
            item['timestamp'] = datetime.utcnow()
            item['type'] = 'bambuser'
        datastore.insert(data)
    except:
        pass

if __name__ == '__main__':
    datastore = DataStore()
    while True:
        instagram(datastore)
        time.sleep(60)

