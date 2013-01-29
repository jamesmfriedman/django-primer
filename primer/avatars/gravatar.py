# import code for encoding urls and generating md5 hashes
import urllib, hashlib
from primer.avatars import DEFAULT_AVATAR_SIZE

def get_gravatar_url(email, default = 'http://www.example.com/default.jpg', size = DEFAULT_AVATAR_SIZE):

	# construct the url
	gravatar_url = "http://www.gravatar.com/avatar/" + hashlib.md5(email.lower()).hexdigest() + "?"
	gravatar_url += urllib.urlencode({'d':default, 's':str(size)})

	return gravatar_url