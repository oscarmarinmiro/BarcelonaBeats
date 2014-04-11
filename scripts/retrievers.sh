#!/bin/bash

case "$1" in
    start )
        echo -e "\nStarting retrievers....\n"
        nohup python -u foursquare.py >logs/foursquare.log 2>&1 &
        echo $! > pids/foursquare.pid
        nohup python -u traffic.py >logs/traffic.log 2>&1 &
        echo $! > pids/traffic.pid
        nohup python -u bicing.py >logs/bicing.log 2>&1 &
        echo $! > pids/bicing.pid
        nohup python -u itgr.py >logs/instagram.log 2>&1 &
        echo $! > pids/instagram.pid
#        nohup python -u twitter.py >logs/twitter.log 2>&1 &
#        echo $! > pids/twitter.pid
#        nohup python -u bambuser.py >logs/bambuser.log 2>&1 &
#        echo $! > pids/bambuser.pid
    ;;
    stop )
        echo -e "\nStopping retrievers....\n"
        for file in pids/*.pid
        do
            PID=$(cat $file)
            kill -9 $PID
        done
    ;;
    restart)
        $0 stop
        $0 start
    ;;

    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac

