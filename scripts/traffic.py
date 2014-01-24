import json
import time
import requests
from datetime import datetime

from constants import TRAFFIC_TRAMOS_FILE, TRAFFIC_SLEEP_TIME
from datastore import DataStore
from utils import format_exception
from log import get_logger

logger = get_logger('traffic')


def get_traffic_data():
    try:
        return requests.get('http://www.bcn.cat/transit/dades/dadestrams.dat').content
    except Exception as e:
        logger.error(format_exception(e))
        return ''

def format_traffic_data(raw, tramos):
    result = list()
    for line in raw.split('\n'):
        try:
            if line != '':
                modelo_json = {'timestamp': datetime.utcnow(), 'type':'traffic','geo':{'type':'Polygon'}}
                line_parts = line.split('#')
                if line_parts[0] in tramos.keys():
                    polygon = list()
                    polygon_points = tramos[str(line_parts[0])].split(' ')
                    if len(polygon_points) > 1:
                        for polygon_point in polygon_points:
                            polygon_point_array = list()
                            numbers = polygon_point.split(',')
                            for number in numbers[0:2]:
                                polygon_point_array.append(float(number))
                            polygon.append(polygon_point_array)
                        modelo_json['geo']['info'] = polygon
                        if int(line_parts[2]) < 5 and int(line_parts[2]) >= 0:
                            modelo_json['data'] = {'now':int(line_parts[2]),'next':int(line_parts[3])}
                            result.append(modelo_json)
        except Exception as e:
            logger.error(format_exception(e))
    return result

def traffic(tramos, datastore):
    d = format_traffic_data(get_traffic_data(), tramos)
    if len(d) > 0:
        datastore.insert(d)

if __name__ == '__main__':
    datastore = DataStore()
    with open(TRAFFIC_TRAMOS_FILE) as f:
        tramos = json.load(f)
    while True:
        traffic(tramos, datastore)
        time.sleep(TRAFFIC_SLEEP_TIME)
