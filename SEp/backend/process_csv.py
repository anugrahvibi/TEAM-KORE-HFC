# backend/process_csv.py
import json
import requests
from pathlib import Path
import pandas as pd
import logging
from typing import Dict, Any, Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# API configuration
BASE_URL = "http://localhost:8000/api/v1"

def safe_convert(value, to_type, default=None):
    """Safely convert value to specified type with error handling"""
    try:
        return to_type(value)
    except (ValueError, TypeError):
        return default if default is not None else to_type()

def process_csv(input_csv_path: Path, output_json_path: Path) -> bool:
    """Process a CSV file through the API and save results to JSON"""
    try:
        logger.info(f"📂 Processing file: {input_csv_path}")
        
        # Read the CSV file
        logger.info("📊 Reading CSV file...")
        try:
            df = pd.read_csv(input_csv_path, comment='#')
            if df.empty:
                logger.error("❌ Error: CSV file is empty")
                return False
        except Exception as e:
            logger.error(f"❌ Error reading CSV file: {e}")
            return False

        logger.info(f"   Found {len(df)} rows in the CSV")
        
        # Log sample data for debugging
        logger.info("\n📝 Sample data (first row):")
        logger.info(df.iloc[0].to_dict())
        
        # Convert to list of dictionaries with proper data types
        data = []
        for _, row in df.iterrows():
            try:
                item = {
                    "mean_cpu": safe_convert(row.get("mean_cpu"), float, 0.0),
                    "std_cpu": safe_convert(row.get("std_cpu"), float, 0.0),
                    "min_cpu": safe_convert(row.get("min_cpu"), float, 0.0),
                    "max_cpu": safe_convert(row.get("max_cpu"), float, 0.0),
                    "delta_cpu": safe_convert(row.get("delta_cpu"), float, 0.0),
                    "cpu_trend": safe_convert(row.get("cpu_trend"), float, 0.0),
                    "cpu_volatility": safe_convert(row.get("cpu_volatility"), float, 0.0),
                    "mean_memory": safe_convert(row.get("mean_memory"), float, 0.0),
                    "std_memory": safe_convert(row.get("std_memory"), float, 0.0),
                    "memory_trend": safe_convert(row.get("memory_trend"), float, 0.0),
                    "mean_requests": safe_convert(row.get("mean_requests"), float, 0.0),
                    "request_spike_count": safe_convert(row.get("request_spike_count"), int, 0),
                    "throughput_delta": safe_convert(row.get("throughput_delta"), float, 0.0),
                    "cost_delta": safe_convert(row.get("cost_delta"), float, 0.0),
                    "unit_economics_ratio": safe_convert(row.get("unit_economics_ratio"), float, 0.0)
                }
                data.append(item)
            except Exception as e:
                logger.error(f"❌ Error processing row: {row.to_dict()}")
                logger.error(f"   Error: {str(e)}")
                continue
        
        if not data:
            logger.error("❌ No valid data to process")
            return False

        # Make the API request
        logger.info("\n🌐 Sending data to API...")
        try:
            response = requests.post(
                f"{BASE_URL}/batch-predict",
                json={"data": data},
                timeout=30
            )
            response.raise_for_status()
            result = response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ API Request failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    logger.error(f"   API Response: {e.response.text}")
                except:
                    logger.error(f"   Status Code: {e.response.status_code}")
            return False
        
        # Save the results
        output_json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_json_path, 'w') as f:
            json.dump(result, f, indent=2)
            
        logger.info(f"\n✅ Success! Results saved to {output_json_path}")
        
        # Log prediction summary
        if "predictions" in result:
            anomalies = sum(1 for p in result["predictions"] if p.get("is_anomaly", False))
            logger.info(f"   Processed {len(result['predictions'])} records")
            logger.info(f"   Anomalies detected: {anomalies}")
            
        return True
        
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {str(e)}", exc_info=True)
        return False

def main():
    from pathlib import Path
    
    logger.info("\n" + "="*50)
    logger.info("📊 CSV to JSON Processor".center(50))
    logger.info("="*50)
    
    # Create data directories if they don't exist
    input_dir = Path("data/input")
    output_dir = Path("data/output")
    
    input_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # List available CSV files
    csv_files = list(input_dir.glob("*.csv"))
    
    if not csv_files:
        logger.error(f"\n❌ No CSV files found in {input_dir.absolute()}/")
        logger.error(f"   Please place your CSV files in the {input_dir} directory")
        return
    
    logger.info("\n📋 Available CSV files:")
    for i, file in enumerate(csv_files, 1):
        logger.info(f"   {i}. {file.name}")
    
    # Let user select a file
    while True:
        try:
            choice = input("\n   Select a file number (or press Enter for first file, 'q' to quit): ").strip()
            
            if choice.lower() == 'q':
                logger.info("\n👋 Exiting...")
                return
                
            if not choice:  # If user presses Enter
                choice = 1
            else:
                choice = int(choice)
                
            if 1 <= choice <= len(csv_files):
                selected_file = csv_files[choice - 1]
                break
                
            logger.error(f"   Please enter a number between 1 and {len(csv_files)}")
            
        except ValueError:
            logger.error("   Please enter a valid number or 'q' to quit")
    
    # Process the selected file
    output_file = output_dir / f"{selected_file.stem}_results.json"
    logger.info(f"\n🔄 Processing {selected_file.name}...")
    
    if process_csv(selected_file, output_file):
        logger.info(f"\n✅ Processing complete!")
        logger.info(f"   Input:  {selected_file}")
        logger.info(f"   Output: {output_file}")
    else:
        logger.info("\n❌ Processing failed. Please check the error messages above.")

if __name__ == "__main__":
    main()