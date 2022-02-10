Keywords for boundaries extraction:
```
non-negative float

Must be of range [0.0, infinity)

Must be between 0 and 1

Thus, max_samples should be in the interval (0.0, 1.0]

float > 0 and <= 1

If float in range [0.0, 1.0]

Must be strictly positive

tuple (q_min, q_max), 0.0 < q_min < q_max < 100.0

The ElasticNet mixing parameter, with 0 <= l1_ratio <= 1

must be a positive float

For the liblinear and lbfgs solvers set verbose to any positive number for verbosity

Must be at least 2

If float, should be between 0.0 and 1.0 and represent the proportion of the dataset to include in the test split
```

## Category 1
```
Must be of range [0.0, infinity)
Thus, max_samples should be in the interval (0.0, 1.0]
If float in range [0.0, 1.0]
```

## Category 2
```
Must be between 0 and 1
tuple (q_min, q_max), 0.0 < q_min < q_max < 100.0
The ElasticNet mixing parameter, with 0 <= l1_ratio <= 1
float > 0 and <= 1
Must be at least 2
If float, should be between 0.0 and 1.0 and represent the proportion of the dataset to include in the test split
```

## Category 3
```
non-negative float
Must be strictly positive
must be a positive float
For the liblinear and lbfgs solvers set verbose to any positive number for verbosity
```