from django.http import HttpResponse

from .models import UserNotification
from .notifications import push_count_update

from primer.views.generic import PrimerView

class WidgetContentView(PrimerView):
	def get(self, request):

		stored_notifications = []

		# only do this for logged in users
		if request.user.is_authenticated():
			stored_notifications = list(UserNotification.get_for_user(request.user)[:10])
			UserNotification.mark_all_as_read_for_user(request.user)
			push_count_update(request.user)

		return self.to_template({
			'stored_notifications' : stored_notifications
		})


class CountView(PrimerView):
	def get(self, request):
		"""
		Simple view to return the count of unread notifications
		"""
		notification_count = UserNotification.objects.filter(user = request.user, read = False).count()
		return HttpResponse(notification_count)
