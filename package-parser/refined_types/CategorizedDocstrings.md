# Scikit-learn docstrings

The following is a proposal for categorizing the parts of docstrings that are relevant for the task of finding refined types (enums and boundaries) from the Scikit-Learn documentation.

## Enums
```
algorithm : {'SAMME', 'SAMME.R'}, default='SAMME.R'
algorithm : {"auto", "full", "elkan"}, default="auto"
algorithm : {'arpack', 'randomized'}, default='randomized'
algorithm : {'auto', 'ball_tree', 'kd_tree', 'brute'}, default='auto'

average : {'micro', 'macro', 'samples', 'weighted'} or None, default='macro'
average : {'micro', 'macro', 'samples', 'weighted', 'binary'} or None, default='binary'

analyzer : {'word', 'char', 'char_wb'} or callable, default='word'

categories : 'auto' or a list of array-like, default='auto'

class_weight : dict or 'balanced', default=None
class_weight : dict, list of dict or "balanced", default=None
class_weight : dict, {class_label: weight} or "balanced", default=None
class_weight : {"balanced", "balanced_subsample"}, dict or list of dicts, default=None

criterion : {"gini", "entropy"}, default="gini"
criterion : {'friedman_mse', 'squared_error', 'mse', 'mae'}, default='friedman_mse'

decode_error : {'strict', 'ignore', 'replace'}, default='strict'

decision_function_shape : {'ovo', 'ovr'}, default='ovr'

drop : {'first', 'if_binary'} or a array-like of shape (n_features,), default=None

error_score : 'raise' or numeric, default=np.nan

gamma : {'scale', 'auto'} or float, default='scale'

handle_unknown : {'error', 'ignore'}, default='error'

init : estimator or 'zero', default=None
init : {'k-means++', 'random'}, callable or array-like of shape (n_clusters, n_features), default='k-means++'

input : {'filename', 'file', 'content'}, default='content'

kernel : {'linear', 'poly', 'rbf', 'sigmoid', 'precomputed'}, default='rbf'

loss : {'squared_error', 'absolute_error', 'huber', 'quantile'}, default='squared_error'

max_features : {'auto', 'sqrt', 'log2'}, int or float
max_features : int, float or {"auto", "sqrt", "log2"}, default=None
max_features : {"auto", "sqrt", "log2"}, int or float, default="auto"

multioutput : {'raw_values', 'uniform_average'} or array-like of shape (n_outputs,), default='uniform_average'
multioutput : {'raw_values', 'uniform_average', 'variance_weighted'}, array-like of shape (n_outputs,) or None, default='uniform_average'

multi_class : {'raise', 'ovr', 'ovo'}, default='raise'
multi_class : {'auto', 'ovr', 'multinomial'}, default='auto'

norm : {'l1', 'l2'}, default='l2'

normalize : {'true', 'pred', 'all'}, default=None

n_components : int, float or 'mle', default=None

order : {'C', 'F'}, default='C'

penalty : {'l2', 'l1', 'elasticnet'}, default='l2'
penalty : {'l1', 'l2', 'elasticnet', 'none'}, default='l2'

precompute : 'auto', bool or array-like of shape (n_features, n_features)

selection : {'cyclic', 'random'}, default='cyclic'

splitter : {"best", "random"}, default="best"

strip_accents : {'ascii', 'unicode'}, default=None

stop_words : {'english'}, list, default=None

solver : {'newton-cg', 'lbfgs', 'liblinear', 'sag', 'saga'}, default='lbfgs'
solver : {'auto', 'svd', 'cholesky', 'lsqr', 'sparse_cg', 'sag', 'saga', 'lbfgs'}, default='auto'

svd_solver : {'auto', 'full', 'arpack', 'randomized'}, default='auto'

weights : {'linear', 'quadratic'}, default=None
weights : {'uniform', 'distance'} or callable, default='uniform'

zero_division : "warn", 0 or 1, default="warn"
```

## Multi-part Enums
```
loss : str, default='hinge'
The possible options are 'hinge', 'log', 'modified_huber', 'squared_hinge', 'perceptron', or a regression loss: 'squared_error', 'huber', 'epsilon_insensitive', or 'squared_epsilon_insensitive'

learning_rate : str, default='optimal'
- 'constant': `eta = eta0`
- 'optimal': `eta = 1.0 / (alpha * (t + t0))` where t0 is chosen by a heuristic proposed by Leon Bottou
- 'invscaling': `eta = eta0 / pow(t, power_t)`
- 'adaptive': eta = eta0, as long as the training keeps decreasing

strategy : str, default='mean'
If "mean", then replace missing values using the mean along each column
If "median", then replace missing values using the median along each column
If "most_frequent", then replace missing using the most frequent value along each column
If "constant", then replace missing values with fill_value
```


# Boundaries
```
ccp_alpha : non-negative float, default=0.0
max_fpr : float > 0 and <= 1, default=None
quantile_range : tuple (q_min, q_max), 0.0 < q_min < q_max < 100.0, default=(25.0, 75.0)
```

## Two-part boundaries
The boundary is defined in the body of the docstring
```
validation_fraction : float, default=0.1
Must be between 0 and 1

C : float, default=1.0
Inverse of regularization strength; must be a positive float

verbose : int, default=0
For the liblinear and lbfgs solvers set verbose to any positive number for verbosity

l1_ratio : float, default=0.5
The ElasticNet mixing parameter, with ``0 <= l1_ratio <= 1``

C : float, default=1.0
Must be strictly positive

tol : float, default=0.0
Must be of range [0.0, infinity)

n_splits : int, default=5
Must be at least 2
```

## Boundaries in specific case
```
max_samples : int or float, default=None
If float, then draw `max_samples * X.shape[0]` samples. Thus, `max_samples` should be in the interval `(0.0, 1.0]`.

max_df : float or int, default=1.0
If float in range [0.0, 1.0]

min_df : float or int, default=1
If float in range of [0.0, 1.0]

max_df : float in range [0.0, 1.0] or int, default=1.0

min_df : float in range [0.0, 1.0] or int, default=1

iterated_power : int or 'auto', default='auto'
Must be of range [0, infinity)

test_size : float or int, default=None
If float, should be between 0.0 and 1.0 and represent the proportion of the dataset to include in the test split

train_size : float or int, default=None
If float, should be between 0.0 and 1.0 and represent the proportion of the dataset to include in the train split
```