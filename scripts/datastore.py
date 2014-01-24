from datetime import datetime, timedelta
from pymongo import MongoClient, DESCENDING
import json

from constants import MONGO_HOST, MONGO_PORT, MONGO_DB, MONGO_COLLECTION

class DataStore:
    def __init__(self):
        self.__connect()
        self.__get_db()
        self.__get_collection()

    def __connect(self):
        self.client = MongoClient(MONGO_HOST, MONGO_PORT)

    def __get_db(self):
        self.db = self.client[MONGO_DB]

    def __get_collection(self):
        self.collection = self.db[MONGO_COLLECTION]
        self.collection.ensure_index('timestamp')

    def insert(self, data):
        if len(data) > 0:
            self.collection.insert(data)

    def get(self, types, period, limit):
        query = {'$and': [{'$or': [{'type': type} for type in types]}, {'timestamp': {'$gt': datetime.utcnow() - timedelta(seconds=period)}}]}
        cursor = self.collection.find(query).sort('timestamp', direction=DESCENDING).limit(limit)
        result = list()
        for item in cursor:
            item.pop('_id', None)
            item['timestamp'] = item['timestamp'].strftime('%d/%m/%Y %H:%M:%S')
            result.append(item)
        cursor.close()
        return result

if __name__ == '__main__':
    ds = DataStore()
    ds.get(['instagram'], 1000, 100)
