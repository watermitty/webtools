import sys

try:
    with open('build_debug_mock.log', 'r', encoding='utf-16') as f:
        print(f.read())
except UnicodeError:
    try:
        with open('build_debug_mock.log', 'r', encoding='utf-8') as f:
            print(f.read())
    except Exception as e:
        print(e)
except Exception as e:
    print(e)
