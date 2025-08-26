from django.db import transaction
from django.db.models import Q, Exists, OuterRef
from django.utils.dateparse import parse_date
from django.core.mail import send_mail

from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .models import Doctor, AvailabilitySlot, Appointment
from .serializers import (
    DoctorSerializer, AvailabilitySlotSerializer,
    AppointmentCreateSerializer, AppointmentSerializer
)


# ---------- public ----------
class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer
    def get_queryset(self):
        qs = Doctor.objects.all()
        name = self.request.query_params.get("name", "").strip()
        spec = self.request.query_params.get("specialization", "").strip()
        state = self.request.query_params.get("state", "").strip().upper()
        if name:
            qs = qs.filter(Q(first_name__icontains=name) | Q(last_name__icontains=name))
        if spec:
            qs = qs.filter(specialization__icontains=spec)
        if state:
            qs = qs.filter(state__iexact=state)
        return qs

class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    lookup_field = "id"

class DoctorAvailabilityView(views.APIView):
    def get(self, request, id: int):
        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"detail": "date=YYYY-MM-DD required"}, status=400)
        d = parse_date(date_str)
        if not d:
            return Response({"detail": "invalid date"}, status=400)

        overlaps = Appointment.objects.filter(
            doctor_id=id,
            status__in=[Appointment.STATUS_PENDING, Appointment.STATUS_CONFIRMED],
        ).filter(Q(start__lt=OuterRef("end")) & Q(end__gt=OuterRef("start")))

        slots = (AvailabilitySlot.objects
                 .filter(doctor_id=id,
                         start__gte=f"{d.isoformat()}T00:00:00Z",
                         end__lte=f"{d.isoformat()}T23:59:59Z")
                 .annotate(has_appt=Exists(overlaps))
                 .filter(has_appt=False)
                 .order_by("start"))

        return Response(AvailabilitySlotSerializer(slots, many=True).data)

class AppointmentCreateView(views.APIView):
    @transaction.atomic
    def post(self, request):
        s = AppointmentCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        doctor = Doctor.objects.select_for_update().get(id=data["doctorId"])

        if data["mode"] == "AVAILABILITY":
            slot = AvailabilitySlot.objects.select_for_update().get(
                id=data["availabilitySlotId"], doctor=doctor
            )
            start, end = slot.start, slot.end
            availability_slot = slot
        else:
            start, end = data["start"], data["end"]
            availability_slot = None

        clash = Appointment.objects.select_for_update().filter(
            doctor=doctor,
            status__in=[Appointment.STATUS_PENDING, Appointment.STATUS_CONFIRMED],
        ).filter(Q(start__lt=end) & Q(end__gt=start)).exists()
        if clash:
            return Response({"detail": "Time is no longer available."}, status=409)

        appt = Appointment.objects.create(
            doctor=doctor,
            availability_slot=availability_slot,
            start=start, end=end,
            mode=data["mode"],
            status=Appointment.STATUS_CONFIRMED,
            patient_name=data["patient"]["name"],
            patient_email=data["patient"]["email"],
            patient_phone=data["patient"].get("phone", ""),
        )

        try:
            send_mail(
                subject="Your appointment is confirmed",
                message=(
                    f"Hi {appt.patient_name},\n\nYour appointment with "
                    f"Dr. {doctor.first_name} {doctor.last_name} is scheduled for "
                    f"{appt.start} – {appt.end}.\n\nThank you,\nMedBooker"
                ),
                from_email=None,
                recipient_list=[appt.patient_email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(AppointmentSerializer(appt).data, status=status.HTTP_201_CREATED)


# ---------- doctor-auth helpers & private endpoints ----------
def require_doctor_profile(user):
    prof = getattr(user, "doctor_profile", None)
    if not prof:
        raise PermissionError("This user is not linked to a Doctor profile.")
    return prof

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_doctor(request):
    doctor = require_doctor_profile(request.user)
    return Response(DoctorSerializer(doctor).data)

class MySlotsListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySlotSerializer

    def get_queryset(self):
        doctor = require_doctor_profile(self.request.user)
        return AvailabilitySlot.objects.filter(doctor=doctor).order_by("start")

    def create(self, request, *args, **kwargs):
        doctor = require_doctor_profile(request.user)
        start = request.data.get("start")
        end = request.data.get("end")
        if not start or not end:
            return Response({"detail": "start and end required (ISO)"}, status=400)
        slot = AvailabilitySlot.objects.create(doctor=doctor, start=start, end=end)
        return Response(AvailabilitySlotSerializer(slot).data, status=201)

class MySlotDelete(generics.DestroyAPIView):
    """DELETE /api/me/slots/<slot_id>/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySlotSerializer
    lookup_url_kwarg = "slot_id"

    def get_queryset(self):
        doctor = require_doctor_profile(self.request.user)
        return AvailabilitySlot.objects.filter(doctor=doctor)

class MyAppointmentsList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        doctor = require_doctor_profile(self.request.user)
        qs = Appointment.objects.filter(doctor=doctor).order_by("start")
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start and end:
            qs = qs.filter(start__lt=end, end__gt=start)
        return qs
