from distutils.core import setup

setup(
    name='Primer',
    version='0.1.0',
    author='James Friedman',
    author_email='james@futura.io',
    packages=['primer'],
    url='https://github.com/jamesmfriedman/django-primer',
    license='LICENSE.txt',
    description='The base coat for your web app.',
    long_description=open('README.md').read(),
    install_requires=[
        'Django==1.4.5',
        'boto==2.8.0',
        'django-compressor==1.2',
        'django-crispy-forms==1.2.3',
        'django-storages==1.1.6',
        'watchdog==0.6.0',
    ],
)