from django import template

from .. import DEFAULT_AVATAR_SIZE

register = template.Library()

@register.simple_tag
def avatar(user, size = DEFAULT_AVATAR_SIZE):
    """
    Renders an avatar at an arbitrary size
    """

    return user.avatar(size)
