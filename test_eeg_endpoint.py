import requests
import os

url = 'http://localhost:5000/api/eeg/predict'
csv_file = 'c:/Users/ksara/OneDrive/Desktop/NeuroPath/eeg_models/epileptic.csv'

if os.path.exists(csv_file):
    with open(csv_file, 'rb') as f:
        files = {'csvFile': ('epileptic.csv', f, 'text/csv')}
        headers = {'x-api-key': 'test-key'}

        try:
            response = requests.post(url, files=files, headers=headers)
            print(f'Status Code: {response.status_code}')
            if response.status_code == 200:
                result = response.json()
                print(f'Success! Processed {result.get("num_records", 0)} records')
                results = result.get('results', [])
                if results:
                    print(f'First prediction: Class {results[0]["prediction"]} - {results[0]["meaning"]}')
            else:
                print(f'Error: {response.text}')
        except Exception as e:
            print(f'Error: {e}')
else:
    print(f'File not found: {csv_file}')