import os
from distutils.core import setup

def fullsplit(path, result=None):
    """
    Split a pathname into components (the opposite of os.path.join) in a
    platform-neutral way.
    """
    if result is None:
        result = []
    head, tail = os.path.split(path)
    if head == '':
        return [tail] + result
    if head == path:
        return result
    return fullsplit(head, [tail] + result)

# Compile the list of packages available, because distutils doesn't have
# an easy way to do this.
packages, data_files = [], []
root_dir = os.path.dirname(__file__)
if root_dir != '':
    os.chdir(root_dir)
primer_dir = 'primer'

for dirpath, dirnames, filenames in os.walk(primer_dir):
    # Ignore PEP 3147 cache dirs and those whose names start with '.'
    dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != '__pycache__']
    if '__init__.py' in filenames:
        packages.append('.'.join(fullsplit(dirpath)))
    elif filenames:
        data_files.append([dirpath, [os.path.join(dirpath, f) for f in filenames]])


setup(
    name = 'Primer',
    version = '0.1.0',
    author = 'James Friedman',
    author_email = 'james@futura.io',
    packages = packages,
    url = 'https://github.com/jamesmfriedman/django-primer',
    license = 'LICENSE',
    description = 'The base coat for your web app.',
    long_description = open('README.md').read(),
    install_requires = [
        'Django==1.4.5',
        'boto==2.8.0',
        'django-compressor==1.2',
        'django-crispy-forms==1.2.3',
        'django-storages==1.1.6',
        'watchdog==0.6.0',
    ],
)