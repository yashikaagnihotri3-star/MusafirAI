from django.urls import path
from .views import SignupView, LoginView, ProfileView, PreferencesView
from rest_framework_simplejwt.views import TokenRefreshView




urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('preferences/', PreferencesView.as_view(), name='preferences'),
    path('token/refresh/',TokenRefreshView.as_view(), name='token_refresh'),
]