import re
from django.contrib.auth import get_user_model
from django.utils.safestring import mark_safe

def process_user_links(string):
    def replace_func(m):

        User = get_user_model()
        user_link = ''

        try:
            user = User.objects.get(pk = int(m.group(1)))
            user_name = user.get_full_name() or user.username
            user_link = '<a class="user-link" href="%s">%s</a>' % (user.get_absolute_url(), user_name)
        except User.DoesNotExist:
            pass
            
        return user_link    

    string = re.sub(r"@\[(\d+)\]", replace_func, string)

    return mark_safe(string)