# Generate Annotations

This part of the package parser deals with the automatic generation of annotations that should help the user to quickly and efficiently correct various problems in an API. For this purpose, data from previously analyzed code is used and the generated annotations are stored in a json file.



## Hauptfunktionen



```mermaid

flowchart LR
User --> gen_an["generate_annotations()"]
subgraph box[package-parser]
gen_an -.->|include| b["preprocess_usages()"]
gen_an -.->|include| c["generate_annotation_dict()"]
gen_an -.->|include| d["get_type_annotations()"]
end

```

Can be found [here](package_parser/commands/generate_annotations/generate_annotations.py).



### `generate_annotations()`

Serves as a central function that takes care of inputs and outputs and bundles all underlying functions. The exact structure and a detailed view of its interaction with sub-functions will be explained further later.

### `preprocess_usages()`

Used to clean up the transferred analysis results and prepare them for further use.

### `generate_annotation_dict()`

Generates the various annotations by consecutively calling the passed functions and collects the partial results.

### `get_type _Annotation()`

This name serves only as a placeholder. Type must be replaced by one of the following keywords: {constant, unused, required, optional, boundary, enum}.

Generates the annotations of the corresponding type. All functions of this type have the following signature:
def `get_type_annotations(UsageCountStore, API, AnnotationsStore)`.
Where UsageCountStore and API represent the set of data extracted from the analyzed code. The functionality and task of the AnnotationStore will be explained later.



## Klassenübersicht

We decided to use these following dataclasses in general as a collection gathering the related information to improve the readability of the code and to define the interactions between functions in a clearer and more consistent way. The use of tuples, lists and dictionaries led to ambiguities in the exchange of information between functions.

### AnnotationStore

```mermaid
classDiagram
BaseAnnotation <|-- ConstantAnnotation
BaseAnnotation <|-- UnusedAnnotation
BaseAnnotation <|-- OptionalAnnotation
BaseAnnotation <|-- RequiredAnnotation
BaseAnnotation <|-- BoundaryAnnotation
BaseAnnotation <|-- EnumAnnotation
BoundaryAnnotation ..> Interval
EnumAnnotation ..> EnumPair
AnnotationStore "0..1" o-- "*" BaseAnnotation

      class BaseAnnotation{
      <<dataclass>>
      String target
      to_json()
      }
      class ConstantAnnotation{
      <<dataclass>>
      String defaultType
      String defaultValue
      }
      class UnusedAnnotation{
      <<dataclass>>
      }
      class OptionalAnnotation{
      <<dataclass>>
      String defaultType
      String defaultValue
      }
      class RequiredAnnotation{
      <<dataclass>>
      }
      class BoundaryAnnotation{
      <<dataclass>>
      String defaultType
      List[Interval] interval
      }
      class EnumAnnotation{
      <<dataclass>>
      String enumName
      List[EnumPair] pairs
      }
      class Interval{
      <<dataclass>>
      Boolean isDiscrete
      Integer lowerIntervalLimit
      Integer lowerLimitType
      Integer upperIntervallLimit
      Integer upperLimitType
      to_json()
      }
      class EnumPair{
      <<dataclass>>
      String stringValue
      String instanceName
      to:json()
      }
      class AnnotationStore{
      <<dataclass>>
      List[ConstantAnnotation] constant
      List[UnusedAnnotation] unused
      List[OptionalAnnotation] optional
      List[RequiredAnnotation] required
      List[BoundaryAnnotation] boundary
      List[EnumAnnotation] enum
      __init__()
      to_json()
      }

```
Can be found [here](package_parser/models/annotation_models.py).

The AnnotationStore class is used for the collection of the individual annotations. An instance of this class is passed to the individual `get_type_Annotation()` functions. These then place their results in the list assigned to them.



### ParameterType

```mermaid
classDiagram
ParameterType <.. ParameterInfo

      class ParameterInfo{
      ParametrType type
      String value
      String value_type
      __init__()
      }
      class ParameterType{
      <<enumeration>>
      CONSTANT
      OPTIONAL
      REQUIRED
      UNUSED
      }
```

Can be found [here](package_parser/models/annotation_models.py).

The ParameterInfo class is used to encapsulate the collected information for a given parameter which is generated in the `get_parameter_info()` function.



### UsageStoreCount

```mermaid
classDiagram
 class UsageStoreCount{
 Counter[ClassQName] class_usages
 Counter[FunctionQName] function_usages
 Counter[ParameterQName] parameter_usages
 dict[ParameterQName, Counter[StringifiedValue]] value_usages
 __init__()
 __eq__()
 __hash__()
 from_json(json) UsageStoreCount
 add_class_usage(ClassQname, Integer)
 add_function_usage(FunctionQName, Integer)
 add_parameter_usages(ParameterQName)
 add_value_usage(ParameterQName, StringifiedValue, Integer)
 init_value(ParameterQName)
 remove_class(ClassQName)
 remove_function_usages(FunctionQname)
 n_class_usages(ClassQName)
 n_function_usages(FunctionQName)
 n_parameter_usages(ParameterQName)
 n_value_usages(ParameterQName, StringifiedValue)
 to_json()
 }
```

Can be found [here](package_parser/models/_usages.py).



This class is a slimmed down version of the [UsageStore](package_parser/commands/find_usages/_model.py) class.

For the automatic generation of annotations, it is in most cases sufficient to know how often a certain element (class, function, parameter, value) is used. In the original class, there are more details stored for each usage, which leads to a more complex and harder to use structure.

The methods of this class can be roughly divided into three categories:

#### Setter

All methods that start with add, remove or init are used to manipulate the counter of a specific element. The QName (QualifiedName) is used as a type of ID.

#### Getter

All methods that correspond to the form `n_type_usages()` are used to read out the number of usages of an element. The Qname is used in the same way here.

#### In-/Ouput

The methods `to_json()` and `from_json()` are used to store the content of the UsageCountStore as a json file or to read it from one.



## `generate_annotations()`

This function acts as the central interface for other parts of the program.

### Input

The function receives two filehandlers and a string that specifies a path.

The file handlers each point to a json file. This is the information collected during the code analysis.
The path specifies where the results are to be stored.



### `preprocess_usages()`

This function needs to be executed before the data can be analyzed and performs the following three tasks:

- `remove_internal_usages()`

  Since we are only concerned with the use of outward-facing package elements, all elements that are used exclusively internally are excluded from consideration.
  
- `add_unused_api_elements()`

  Some Api elements are not used and therefore do not appear in the listing of all used elements. However, it is necessary that they do for the following process of the prorgam.

- `add_implicit_usages_of_default_value()`

  If a parameter is called with the default value in a function call, this implicit use of a value does not appear in the usage data. However, it is necessary that they do so for later analysis.

All functions of the form `get_type_Annotation()` are passed in a list to the generate_annotation_dict() function. This function then calls them one after the other.

Finally, the data that resides in the AnnotationStore instance is stored in the Ouput Json file.

```mermaid
stateDiagram
direction LR
[*] --> check_arguments
check_arguments --> collect_annotation_getter
collect_annotation_getter --> preprocess_usages
state generate_annotation_dict{
 direction LR
 preprocess_usages --> call_annotation_getter
}
call_annotation_getter --> dump_annotation_store
```



## Testing

### `AnnotationStore`

Can be found [here](tests/models/test_annotation_models.py).

For the AnnotationStore and all associated classes there are automatic tests that ensure that the to_json() methods work properly. For this purpose, a test configuration of the individual classes is created, and their output is then compared against the expected value.

### `UsageCountStore`

Can be found [here](tests/models/test_usages.py).

For this class there are automatic checks for the In-/ and Output methods, that compare the result against the expected value. There are also various tests for every Setter and Getter in which the state of the object is checked after.

### `generate_annotations()`

The tests can be found [here](tests/commands/generate_annotations/test_generate_annotations.py) and the testdata [here](tests/data).

For this function all subfunctions are tested automatically. For this purpose, there is test data for each individual getter, for which the output is then compared against the expected value. We decided to split the test data and test the sub-functions as standalone, because the implementation of tests for new features would otherwise lead to a process of rechecking all the previous test results.
