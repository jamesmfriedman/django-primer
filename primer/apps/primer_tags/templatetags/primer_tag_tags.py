from django import template
from django.template.loader import render_to_string

register = template.Library()

__all__ = ('taglist',)


@register.simple_tag()
def taglist(taglist, color_in_respect_to = None, as_li = False):

    if color_in_respect_to:
        tag_colors = {tag.tag_entry.pk: tag.color for tag in color_in_respect_to}

        for tag in taglist:
            tag.color = tag_colors.get(tag.tag_entry.pk)

    return render_to_string('tags/taglist.html', {'taglist' : taglist, 'as_li': as_li})




