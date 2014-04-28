import subprocess
import time

RUNNING_TIME=3600
WAITING_TIME=5

print "empiezo"
file=open("./salida.monitor","a")
while(1):
    print "arranco waiter"
    process = subprocess.Popen(["python","-u","./bcnBeatsTwTracker.py"],stdout=file,stderr=file)
    print process.pid
    print "espero ' + str(RUNNING_TIME) + ' seg"
    time.sleep(RUNNING_TIME)
    print "ahora lo mato"
    process.kill()
    print "ahora espero " + str(WAITING_TIME)
    time.sleep(WAITING_TIME)
    print "y ahora rearranco"
