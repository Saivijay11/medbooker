from django.contrib import admin
from .models import Doctor, AvailabilitySlot, Appointment

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ("id","first_name","last_name","specialization","state")
    search_fields = ("first_name","last_name","specialization","practitioner_id")

@admin.register(AvailabilitySlot)
class SlotAdmin(admin.ModelAdmin):
    list_display = ("doctor","start","end")
    list_filter = ("doctor",)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("doctor","start","end","mode","status","patient_name")
    list_filter = ("doctor","status","mode")
