import sys
import re
from utils import ocr, processSource
from PIL import Image
import pytesseract


def main():
    file_paths_str = sys.argv[1]
    file_paths = file_paths_str.split(',')
    dest = sys.argv[2]
    ocr(file_paths, dest)
    exclude = re.compile(r'(i\w.*?\d)|(\s+$)|(^(Unit))')
    try:
        processSource(dest, exclude)
    except:
        print('err!')


main()
