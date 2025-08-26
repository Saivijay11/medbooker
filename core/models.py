from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings

class Doctor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="doctor_profile",
    )
    practitioner_id = models.CharField(max_length=32, unique=True)
    first_name = models.CharField(max_length=80)
    last_name  = models.CharField(max_length=80)
    specialization = models.CharField(max_length=120)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=80, blank=True)
    state = models.CharField(max_length=30, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["last_name", "first_name"]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} ({self.specialization})"

class AvailabilitySlot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="slots")
    start = models.DateTimeField()
    end   = models.DateTimeField()

    class Meta:
        ordering = ["start"]
        unique_together = ("doctor", "start", "end")

    def clean(self):
        if self.end <= self.start:
            raise ValidationError("End must be after start")

class Appointment(models.Model):
    MODE_AVAILABILITY = "AVAILABILITY"
    MODE_ON_DEMAND = "ON_DEMAND"
    MODE_CHOICES = [(MODE_AVAILABILITY, "Availability"), (MODE_ON_DEMAND, "On demand")]

    STATUS_PENDING = "PENDING"
    STATUS_CONFIRMED = "CONFIRMED"
    STATUS_CANCELLED = "CANCELLED"
    STATUS_CHOICES = [(STATUS_PENDING,"Pending"),(STATUS_CONFIRMED,"Confirmed"),(STATUS_CANCELLED,"Cancelled")]

    doctor = models.ForeignKey(Doctor, on_delete=models.PROTECT, related_name="appointments")
    availability_slot = models.ForeignKey(AvailabilitySlot, null=True, blank=True, on_delete=models.PROTECT, related_name="appointments")
    start = models.DateTimeField()
    end   = models.DateTimeField()
    mode = models.CharField(max_length=16, choices=MODE_CHOICES)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default=STATUS_CONFIRMED)

    patient_name = models.CharField(max_length=120)
    patient_email = models.EmailField()
    patient_phone = models.CharField(max_length=40, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["doctor","start","end"])]

    def clean(self):
        if self.end <= self.start:
            raise ValidationError("End must be after start")
        if self.mode == self.MODE_AVAILABILITY and not self.availability_slot:
            raise ValidationError("availability_slot required in AVAILABILITY mode")
        if self.mode == self.MODE_ON_DEMAND and self.availability_slot_id:
            raise ValidationError("availability_slot must be null in ON_DEMAND mode")
