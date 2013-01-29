import sys
import subprocess
import time
import os

from threading import Thread
from functools import partial

from django.conf import settings

from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler

__all__ = [
    'LessProcessorEventHandler',
    ]


class LessProcessorEventHandler(PatternMatchingEventHandler):
    '''
    A sublcass of the pattern matching event handler from the filesystem
    watchdog library. Every time something happens to a .less file, it
    is recompiled to css. 
    '''

    def compile_less(self):
        '''Recompile less files to css based on whats set in settings.LESS_CSS_PATHS dictionary'''
        for less_input, css_output in settings.LESS_CSS_PATHS.items():
            
            # In Windows, we need to switch the forward slashes to backslashes
            less_input = os.path.normpath(less_input)
            css_output = os.path.normpath(css_output)
            
            subprocess.call('cd "'+ settings.APP_ROOT +'" && lessc -x "'+ less_input + '" > "' + css_output + '"', shell=True)

    def on_any_event(self, event):
        '''Listens for any event that happens to a less file on the filesystem'''
        self.compile_less()


def watch_less():
        '''creates the watchdog observer to monitor filesystem events'''
        event_handler = LessProcessorEventHandler(patterns = ['*.less'])
        observer = Observer()
        observer.schedule(event_handler, path=settings.APP_ROOT, recursive=True)
        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

# a place to store our less processing thread, only during dev
if 'runserver' in sys.argv and settings.DEBUG:
    print 'Starting LESS processor...'
    less_thread = Thread(target=watch_less, args=(), kwargs={})
    less_thread.daemon = True
    less_thread.start()
