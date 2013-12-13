from django.core.management.base import BaseCommand
from django.core import management
from django.conf import settings
from django.db import models
from importlib import import_module
from django.core.management.base import CommandError
from django.contrib.auth.models import User
from django.utils.six.moves import input

class Command(BaseCommand):
    help = 'Start from scratch'

    def handle(self, *args, **options):

        self.out('GET FRESH! Start over.')

        confirm = input('You are about to nuke your database. Proceed? (Y/n)')
        while 1:
            if confirm not in ('Y', 'n', 'yes', 'no'):
                confirm = input('Please enter either "yes" or "no": ')
                continue
            if confirm in ('Y', 'yes'):
                break
            else:
                return

        self.out('resetting database...')
        
        self.refresh_db()

        def fake_models_list():
            return [import_module('south.models')]

        real_get_apps = models.get_apps
        models.get_apps = fake_models_list

        self.out('installing south...')

        installed_apps = settings.INSTALLED_APPS
        settings.INSTALLED_APPS = ('south', )
        management.call_command('syncdb')

        settings.INSTALLED_APPS = installed_apps
        models.get_apps = real_get_apps
        
        admins = getattr(settings, 'ADMINS', None)

        self.out('syncing...')
        
        management.call_command('syncdb', interactive = not admins)

        if admins:
            for user in settings.ADMINS:
                name = user[0].split(' ')
                email = username = user[1]
                first_name = name[0]
                last_name = name[1]
                user = User.objects.create_user(username, email, 'password', first_name = first_name, last_name = last_name)
                user.is_superuser = True
                user.is_staff = True
                user.save()

        self.out('migrating...')

        management.call_command('migrate')

        self.out('DING! Good as new :)')

    def refresh_db(self):
        # grabbed and modified from http://djangosnippets.org/snippets/828/
        
        engine = settings.DATABASES['default']['ENGINE'].split('.')[-1]

        if engine == 'sqlite3':
            import os
            try:
                os.unlink(settings.DATABASES['default']['NAME'])
            except OSError:
                pass
        elif engine == 'mysql':
            import MySQLdb as Database
            kwargs = {
                'user': settings.DATABASES['default']['USER'],
                'passwd': settings.DATABASES['default']['PASSWORD'],
            }
            if settings.DATABASES['default']['HOST'].startswith('/'):
                kwargs['unix_socket'] = settings.DATABASES['default']['HOST']
            else:
                kwargs['host'] = settings.DATABASES['default']['HOST']
            if settings.DATABASES['default']['PORT']:
                kwargs['port'] = int(settings.DATABASES['default']['PORT'])

            connection = Database.connect(**kwargs)
            drop_query = 'DROP DATABASE IF EXISTS %s' % settings.DATABASES['default']['NAME']
            create_query = 'CREATE DATABASE %s' % settings.DATABASES['default']['NAME']
            
            connection.query(drop_query)
            
            connection.query(create_query)
        elif engine == 'postgresql' or engine == 'postgresql_psycopg2':
            if engine == 'postgresql':
                import psycopg as Database
            elif engine == 'postgresql_psycopg2':
                import psycopg2 as Database
            
            if settings.DATABASES['default']['NAME'] == '':
                from django.core.exceptions import ImproperlyConfigured
                raise ImproperlyConfigured, "You need to specify DATABASE_NAME in your Django settings file."
            if settings.DATABASES['default']['USER']:
                conn_string = "user=%s" % (settings.DATABASES['default']['USER'])
            if settings.DATABASES['default']['PASSWORD']:
                conn_string += " password='%s'" % settings.DATABASES['default']['PASSWORD']
            if settings.DATABASES['default']['HOST']:
                conn_string += " host=%s" % settings.DATABASES['default']['HOST']
            if settings.DATABASES['default']['PORT']:
                conn_string += " port=%s" % settings.DATABASES['default']['PORT']
            connection = Database.connect(conn_string)
            connection.set_isolation_level(0) #autocommit false
            cursor = connection.cursor()
            drop_query = 'DROP DATABASE %s' % settings.DATABASES['default']['NAME']
            
    
            try:
                cursor.execute(drop_query)
            except Exception:
                pass
    
            # Encoding should be SQL_ASCII (7-bit postgres default) or prefered UTF8 (8-bit)
            create_query = ("""
                CREATE DATABASE %s
                    WITH OWNER = %s
                        ENCODING = 'UTF8'
                        TABLESPACE = pg_default;
                """ % (settings.DATABASES['default']['NAME'], settings.DATABASES['default']['USER'])
            )
            
            
            cursor.execute(create_query)
                    
        else:
            raise CommandError, "Unknown database engine %s", engine

    def out(self, msg):
        print ''
        print self.hr
        print '#', msg
        print self.hr
        print ''

    @property
    def hr(self):
        return '#############################################################################'

        
            

