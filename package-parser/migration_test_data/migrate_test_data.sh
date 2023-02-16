#!/bin/bash

cd ./migration_test_data/api/apiv2/ || exit
mv library_apiv2 library_api
cd ../../..
poetry run python -m package_parser api -s ./migration_test_data/api/apiv2/library_api -p library_api -o ./migration_test_data/api/apiv2
poetry run python -m package_parser migrate -a1 ./migration_test_data/api/apiv1/library_api__api.json -a2 ./migration_test_data/api/apiv2/library_api__api.json -a ./migration_test_data/api/apiv1/annotations_apiv1.json -o ./migration_test_data
cd ./migration_test_data/api/apiv2/ || exit
mv library_api library_apiv2
