import json
import hashlib
from django.contrib.contenttypes.models import ContentType


def get_content_types_list(objects):
    """
    Takes a single or iterable of objects and turns it into
    a list of dicts that can be json encoded and then hashed.
    This is used by the comments system to do some security checking
    """
    obj_list = []

    # fix this if it is just a single object
    if not hasattr(objects, '__iter__'):
        objects = [objects]

    for obj in objects:
        ctype, object_pk = ContentType.objects.get_for_model(obj), str(obj.pk)

        obj_list.append({
            'app_label' : ctype.app_label,
            'content_type': ctype.name,
            'object_pk' : object_pk
        })
   
    return obj_list
        

def get_content_types_hash(content_types_list):
    """
    Takes a content_types list (really just any list)
    and returns a hash of it
    """
    target_json = json.dumps(content_types_list)
    return hashlib.sha224(target_json).hexdigest()