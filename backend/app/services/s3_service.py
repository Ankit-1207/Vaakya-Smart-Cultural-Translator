import boto3
import json
from datetime import datetime
from ..core.config import settings

class S3Service:
    def __init__(self):
        if settings.AWS_ACCESS_KEY_ID and settings.S3_BUCKET_NAME:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            self.bucket_name = settings.S3_BUCKET_NAME
            self.enabled = True
        else:
            self.enabled = False

    def upload_log(self, data: dict):
        if not self.enabled:
            print("[MOCK S3] Would have uploaded log:", json.dumps(data, ensure_ascii=True))
            return

        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            file_name = f"logs/translation_{timestamp}.json"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_name,
                Body=json.dumps(data),
                ContentType="application/json"
            )
        except Exception as e:
            print(f"Failed to upload to S3: {e}")

s3_service = S3Service()
