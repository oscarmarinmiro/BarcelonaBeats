import logging
from logging.handlers import RotatingFileHandler
import os

from constants import LOGS_PATH, LOGS_MAX_SIZE, LOGS_BACKUP_COUNT, LOG_LEVEL

def get_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    path = os.path.normpath(os.path.join(os.getcwd(), LOGS_PATH, '%s.log' % (name)))
    ch = RotatingFileHandler(path, maxBytes=LOGS_MAX_SIZE, backupCount=LOGS_BACKUP_COUNT, encoding='utf-8')
    ch.setLevel(LOG_LEVEL)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    return logger
