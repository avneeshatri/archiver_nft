from os.path import exists


def isNone(obj):
    if obj is None:
        return True
    return False


def create_file(dir_path, file_name, content):
    file_path = dir_path + '/' + file_name
    if not exists(dir_path):
        raise Exception('Directory ' + file_path + ' does not exist')

    if exists(file_path):
        raise Exception('File ' + file_path + ' already exist')

    new_file = open(file_path, 'w')
    new_file.write(content)
    return file_path

def load_properties(filepath, sep='=', comment_char='#'):
    """
    Read the file passed as parameter as a properties file.
    """
    props = {}
    with open(filepath, "rt") as f:
        for line in f:
            l = line.strip()
            if l and not l.startswith(comment_char):
                key_value = l.split(sep)
                key = key_value[0].strip()
                value = sep.join(key_value[1:]).strip().strip('"')
                props[key] = value
    return props