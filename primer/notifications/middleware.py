from models import UserNotification

class CountMiddleware():
    
    def process_request(self, request):
    	pass
        #if request.user.is_authenticated() and not hasattr(request, '_notifications_count') and not request.is_ajax():
        #	request._notifications_count = UserNotification.objects.filter(user = request.user, read = False).count()

            
        