import csv
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from core.models import Doctor, AvailabilitySlot

class Command(BaseCommand):
    help = "Import doctors and optional availability slots from a CSV"

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str)

    @transaction.atomic
    def handle(self, csv_path, *args, **kwargs):
        with open(csv_path, newline="") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                # required columns: practitioner_id, first_name, last_name, specialization, city, state
                doc, _ = Doctor.objects.update_or_create(
                    practitioner_id=row["practitioner_id"],
                    defaults=dict(
                        first_name=row.get("first_name",""),
                        last_name=row.get("last_name",""),
                        specialization=row.get("specialization",""),
                        city=row.get("city",""),
                        state=row.get("state",""),
                        email=row.get("email",""),
                        phone=row.get("phone",""),
                    ),
                )
                count += 1

                # Optional: seed 30-min slots for next 7 days (8am–5pm)
                if row.get("seed_slots","").lower() in {"1","true","yes"}:
                    base = timezone.now().date()
                    for d in range(7):
                        day = datetime.combine(base + timedelta(days=d), datetime.min.time(), tzinfo=timezone.get_current_timezone())
                        start = day.replace(hour=8, minute=0)
                        for i in range(18):  # 8:00 → 17:30
                            s = start + timedelta(minutes=30*i)
                            e = s + timedelta(minutes=30)
                            AvailabilitySlot.objects.get_or_create(doctor=doc, start=s, end=e)

            self.stdout.write(self.style.SUCCESS(f"Imported/updated {count} doctors"))
