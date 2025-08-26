from rest_framework import serializers
from .models import Doctor, AvailabilitySlot, Appointment

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ["id","practitioner_id","first_name","last_name","specialization","phone","email","address","city","state","zip_code"]

class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ["id","start","end"]

class AppointmentCreateSerializer(serializers.Serializer):
    doctorId = serializers.IntegerField()
    mode = serializers.ChoiceField(choices=[("AVAILABILITY","AVAILABILITY"),("ON_DEMAND","ON_DEMAND")])
    availabilitySlotId = serializers.IntegerField(required=False)
    start = serializers.DateTimeField(required=False)
    end   = serializers.DateTimeField(required=False)
    patient = serializers.DictField()

    def validate(self, data):
        mode = data["mode"]
        patient = data.get("patient", {})
        if not patient.get("name") or not patient.get("email"):
            raise serializers.ValidationError("patient.name and patient.email are required")

        if mode == "AVAILABILITY":
            if "availabilitySlotId" not in data:
                raise serializers.ValidationError("availabilitySlotId is required for AVAILABILITY mode")
        else:
            if "start" not in data or "end" not in data:
                raise serializers.ValidationError("start and end are required for ON_DEMAND mode")
        return data

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id","doctor","availability_slot","start","end","mode","status","patient_name","patient_email","patient_phone","created_at"]
