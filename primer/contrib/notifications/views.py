from django.http import HttpResponse

from primer.views.generic import PrimerView

from .models import StoredNotification


class AllView(PrimerView):
	def get(self, request):

		notifications = []

		# only do this for logged in users
		if request.user.is_authenticated():
			notifications = list(StoredNotification.objects.get_for_user(request.user)[:100])
			StoredNotification.objects.mark_all_as_read_for_user(request.user)

		return self.to_template({
			'notifications' : notifications
		})


class WidgetContentView(PrimerView):
	def get(self, request):

		stored_notifications = []

		# only do this for logged in users
		if request.user.is_authenticated():
			stored_notifications = list(StoredNotification.objects.get_for_user(request.user)[:10])
			StoredNotification.objects.mark_all_as_read_for_user(request.user)

		return self.to_template({
			'stored_notifications' : stored_notifications
		})


class CountView(PrimerView):
	def get(self, request):
		"""
		Simple view to return the count of unread notifications
		"""
		notification_count = StoredNotification.objects.filter(user = request.user, read = False).count()
		return HttpResponse(notification_count)
