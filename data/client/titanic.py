import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

data = pd.read_csv("data/train.csv", index_col="PassengerId")
data = data.drop(["Name", "Ticket", "Cabin"], axis=1)
data["Young"] = data["Age"] < 18

X = data.drop("Survived", axis=1)
y = data.Survived

import sklearn
from sklearn.ensemble import RandomForestClassifier

numerical_cols = ["Age", "SibSp", "Parch"]
categorical_cols = ["Sex", "Pclass"]

# Preprocessing for numerical data
numerical_transformer = SimpleImputer(strategy='constant')

# Preprocessing for categorical data
ohe = OneHotEncoder(handle_unknown='ignore')
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', ohe)
])

# Bundle preprocessing for numerical and categorical data
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_cols),
        ('cat', categorical_transformer, categorical_cols)
    ], remainder="drop")

model = RandomForestClassifier(n_estimators=500)
# model = GridSearchCV(estimator, [{
#     "learning_rate": [0.1]
# }], scoring="accuracy")

pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("model", model)
])

pipeline.fit(X, y)

test = pd.read_csv("data/test.csv", index_col="PassengerId")
test = test.drop(["Name", "Ticket", "Cabin"], axis=1)
predictions = pipeline.predict(test).round().astype(int)

output = pd.DataFrame({
    "Survived": predictions
}, index=test.index)
output.to_csv("data/predictions.csv")
