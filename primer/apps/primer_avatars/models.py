from django.contrib.auth.models import User
from django.template.loader import render_to_string

from . import DEFAULT_AVATAR_SIZE
from gravatar import get_gravatar_url


def get_avatar(self, size = DEFAULT_AVATAR_SIZE):
	src = get_gravatar_url(self.email, size = size)
	
	return render_to_string('avatars/avatar.html', {
		'src': src,
		'size': size
	})

User.add_to_class('avatar', get_avatar)