from django.urls import path
from .views import (
    DoctorListView, DoctorDetailView, DoctorAvailabilityView, AppointmentCreateView,
    me_doctor, MySlotsListCreate, MySlotDelete, MyAppointmentsList,
)


urlpatterns = [
    path("doctors/", DoctorListView.as_view()),
    path("doctors/<int:id>/", DoctorDetailView.as_view()),
    path("doctors/<int:id>/availability/", DoctorAvailabilityView.as_view()),
    path("appointments/", AppointmentCreateView.as_view()),
    path("me/doctor/", me_doctor),
    path("me/slots/", MySlotsListCreate.as_view()),
    path("me/slots/<int:slot_id>/", MySlotDelete.as_view()),
    path("me/appointments/", MyAppointmentsList.as_view()),
]
