import sys
import subprocess
import time
import os
import platform

from threading import Thread
from functools import partial

from django.conf import settings

from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler

import primer

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
            
            include_path_seperator = ':'
            if platform.system() == 'Windows':
                include_path_seperator = ';'

            # In Windows, we need to switch the forward slashes to backslashes
            less_options = {
                'less_input' : os.path.normpath(less_input),
                'css_output' : os.path.normpath(css_output),
                'include_path' : settings.PRIMER_ROOT + include_path_seperator + settings.APP_ROOT,
                'less_root' : settings.LESS_ROOT,   
            }

            command = 'cd "%(less_root)s" && lessc --include-path="%(include_path)s" -x "%(less_input)s" > "%(css_output)s"' % less_options
            
            print '#######################################'
            print 'Compiling Less...'
            print 'In:', less_options['less_root'] + os.sep + less_options['less_input']
            print 'Out:', less_options['css_output']
            print '#######################################'
            
            
            #subprocess.call('cd "%(less_root)s" && lessc --include=path="%(include_path)s" --rootpath="%(include_path)s" -x -ru "%(less_input)s" > "%(css_output)s"' % less_options, shell=True)
            subprocess.call(command, shell=True)

    def on_any_event(self, event):
        '''Listens for any event that happens to a less file on the filesystem'''
        self.compile_less()


def watch_less():
        '''creates the watchdog observer to monitor filesystem events'''
        event_handler = LessProcessorEventHandler(patterns = ['*.less'])
        observer = Observer()
        paths = settings.LESS_ROOT
        observer.schedule(event_handler, path=settings.LESS_ROOT, recursive=True)
        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()

# a place to store our less processing thread, only during dev
if 'runserver' in sys.argv and settings.LESS_PROCESSOR_ENABLED:
    print 'Starting LESS processor...'
    print 'LESS_ROOT:', settings.LESS_ROOT
    less_thread = Thread(target=watch_less, args=(), kwargs={})
    less_thread.daemon = True
    less_thread.start()
