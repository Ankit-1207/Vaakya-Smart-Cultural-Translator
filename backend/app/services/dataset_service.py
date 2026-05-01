import json
import os
from typing import Optional, Dict

class DatasetService:
    def __init__(self):
        self.idioms_data = []
        self._load_dataset()

    def _load_dataset(self):
        # We assume the dataset is at backend/app/data/idioms.json
        dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "idioms.json")
        
        if os.path.exists(dataset_path):
            try:
                with open(dataset_path, "r", encoding="utf-8") as f:
                    self.idioms_data = json.load(f)
            except Exception as e:
                print(f"Failed to load dataset: {e}")
        else:
            print(f"Dataset not found at {dataset_path}")

    def find_idiom(self, text: str) -> Optional[Dict]:
        text_lower = text.lower().strip()
        if isinstance(self.idioms_data, dict):
            for lang, idioms in self.idioms_data.items():
                for item in idioms:
                    if item.get("phrase", "").lower() == text_lower:
                        return item
        elif isinstance(self.idioms_data, list):
            for item in self.idioms_data:
                if item.get("phrase", "").lower() == text_lower:
                    return item
        return None

dataset_service = DatasetService()
