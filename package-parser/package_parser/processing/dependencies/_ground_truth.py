instances = [
    ("coef0", 'It is only significant in "poly" and "sigmoid"'),
    ("random_state", "ignored when probability is False"),
    ("l1_ratio", 'only used if penalty is "elasticnet"'),
    ("validation_fraction", "only used if early_stopping is True"),
    ("normalize", "this parameter is ignored when fit_intercept is set to False"),
    ("solver", "It can be used only when positive is True"),
    (
        "positive",
        'Only "lbfgs" solver is supported in this case',
    ),  # problematic, got "lbfgs" as adjective
    ("random_state", 'used when solver == "sag" or "saga"'),
    (
        "intercept_scaling",
        'useful only when the solver "liblinear" is used and self.fit_intercept is set to True',
    ),
    ("random_state", 'used when solver == "sag", "saga" or "liblinear"'),
    ("n_jobs", 'This parameter is ignored when the solver is set to "liblinear"'),
    ("l1_ratio", 'only used if penalty="elasticnet"'),
    ("random_state", 'used when selection == "random"'),
    ("oob_score", "only available if bootstrap=True"),
    ("random_state", "it is only used when base_estimator exposes a random_state"),
    ("alpha", 'only if loss="huber" or loss="quantile"'),
    ("validation_fraction", "Only used if n_iter_no_change is set to an integer"),
    ("random_state", 'Used when the "arpack" or "randomized" solvers are used'),
    ("preprocessor", "Only applies if analyzer is not callable"),
    ("tokenizer", 'Only applies if analyzer == "word"'),
    ("stop_words", 'Only applies if analyzer == "word"'),
    ("token_pattern", 'Only used if analyzer == "word"'),
    ("ngram_range", "Only applies if analyzer is not callable"),
    ("digits", "if output_dict is True, this will be ignored"),
    ("min_impurity_decrease", "weighted sum, if sample_weight is passed"),
    (
        "class_weight",
        "weights will be multiplied with sample_weight if sample_weight is specified",
    ),
    (
        "alpha",
        'used to compute the learning rate when learning_rate is set to "optimal"',
    ),
    (
        "dual",
        "Dual formulation is only implemented for l2 penalty with liblinear solver",
    ),
    ("random_state", "it is only used when base_estimator exposes a random_state"),
    ("transformer_weights", "Raises ValueError if key not present in transformer_list"),
    ("groups", "only used in conjunction with a “Group” cv instance"),
    (
        "n_components",
        'If svd_solver == "arpack", the number of components must be strictly less than the minimum of n_features and n_samples',
    ),
    ("tol", 'Tolerance for singular values computed by svd_solver == "arpack"'),
    (
        "iterated_power",
        'Number of iterations for the power method computed by svd_solver == "randomized"',
    ),
    (
        "fill_value",
        "When strategy == “constant”, fill_value is used to replace all occurrences of missing_values",
    ),
    ("strategy", "If “constant”, then replace missing values with fill_value"),
    (
        "digits",
        "if output_dict is True, this will be ignored and the returned values will not be rounded",
    ),
    (
        "labels",
        'The set of labels to include when average != "binary", and their order if average is None',
    ),
    ("pos_label", 'The class to report if average="binary" and the data is binary'),
    (
        "average",
        "if “binary”, then only report results for the class specified by pos_label",
    ),
    (
        "Y_score",
        "in the multiclass case, the order of the class scores must correspond to the order of labels, if provided, or else to the numerical or lexicographical order of the labels in y_true",
    ),
    ("average", "Will be ignored when y_true is binary"),
    (
        "labels",
        "If None, the numerical or lexicographical order of the labels in y_true is used",
    ),
    (
        "estimator",
        "Either estimator needs to provide a score function, or scoring must be passed",
    ),
    (
        "random_state",
        "When shuffle is True, random_state affects the ordering of the indices, which controls the randomness of each fold for each class",
    ),
    ("test_size", "If train_size is also None, it will be set to 0.25"),
    (
        "train_size",
        "If None, the value is automatically set to the complement of the test_size",
    ),
    ("shuffle", "If shuffle=False then stratify must be None"),
]
