from django import template
from django.template.loader import render_to_string

register = template.Library()

@register.simple_tag(takes_context=True)
def notifications(context):
    """
    This renders the actual box where popup notifications get displayed on screen
    """
    return render_to_string('notifications/display.html', {}, context)


@register.simple_tag(takes_context=True)
def notifications_widget(context):
    """
    Renders the notifications widget with the icon and dropdown
    """
    return render_to_string('notifications/widget.html', {}, context)






