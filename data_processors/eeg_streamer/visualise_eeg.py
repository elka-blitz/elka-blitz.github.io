import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import sys

input_file = sys.argv[1]

df = pd.read_csv(input_file, parse_dates=['timestamp_column'])

print(df.shape)
df['timestamp_column'] = pd.to_datetime(df['timestamp_column'], unit='s')

#print(df.head(10))
#
#print(df.shape)
#df.fillna(0, inplace=True)
df['microvoltage_norm'] = (df['microvoltage'] - df['microvoltage'].min()) / (df['microvoltage'].max() - df['microvoltage'].min())

# Zscore normalisation
#df['focus_norm'] = (df['focus'] - df['focus'].mean()) / df['focus'].std() 

# Normalise second column
df['focus_norm'] = (df['focus'] - df['focus'].min()) / (df['focus'].max() - df['focus'].min())

# Normalise meditaion norm
df['meditation_norm'] = (df['meditation'] - df['meditation'].min()) / (df['meditation'].max() - df['meditation'].min())

#sns.set_style("dark")
sns.set(rc={'axes.facecolor': 'darkgrey', 'figure.facecolor': 'darkgrey'})

sns.lineplot(data=df, x='timestamp_column', y='microvoltage_norm', label='microvolts')
sns.lineplot(data=df, x='timestamp_column', y='focus_norm', label='attention')
sns.lineplot(data=df, x='timestamp_column', y='meditation_norm', label='meditation')
plt.title("Microvoltage over Time Normalised")
plt.xticks(rotation=45)
plt.legend()
plt.show()
