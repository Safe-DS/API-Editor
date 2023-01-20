import os

if __name__ == '__main__':
    try:
        if os.path.exists("migration_test_data/api/apiv2/library_apiv2"):
            os.rename("migration_test_data/api/apiv2/library_apiv2", "migration_test_data/api/apiv2/library_api")
        os.system("python.exe -m package_parser migrate -a1 ./migration_test_data/api/apiv1/library_api__api.json -a2 ./migration_test_data/api/apiv2/library_api__api.json -a ./migration_test_data/api/apiv1/annotations_apiv1.json -o ./migration_test_data")
    except KeyboardInterrupt:
        pass
    os.rename("migration_test_data/api/apiv2/library_api", "migration_test_data/api/apiv2/library_apiv2")
