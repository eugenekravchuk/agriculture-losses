import pandas as pd
import os
from pathlib import Path

folder_path = Path('../data/raw')

csv_files = sorted(folder_path.glob('*.csv'))

agricultural_sections = [1, 2, 3, 4]

agri_dataframes = []

for file in csv_files:
    df = pd.read_csv(file)
    
    df_agri = df[df['Section ID'].isin(agricultural_sections)]
    
    year = int(file.stem)
    df_agri['Year'] = year
    
    agri_dataframes.append(df_agri)

final_agri_data = pd.concat(agri_dataframes, ignore_index=True)

final_agri_data.to_csv('agricultural_exports_combined.csv', index=False)

print('Done! Saved as agricultural_exports_combined.csv')
