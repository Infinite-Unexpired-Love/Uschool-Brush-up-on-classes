from PIL import Image
import pytesseract
import re
import os


def binarize(img, threshold):
    Img = img.convert('L')
    table = []
    for i in range(256):
        if i < threshold:
            table.append(0)
        else:
            table.append(1)
    return Img.point(table, '1')


def ocr(file_paths, dest):
    f = open(dest, mode="w", encoding="utf-8")
    for i in range(len(file_paths)):
        image = Image.open(file_paths[i])
        photo = binarize(image, 180)
        f.write(pytesseract.image_to_string(photo, config="--psm 4"))
    f.close()


def processSource(source, reg):
    f = open(source, mode='r', encoding='utf-8')
    segs = source.split('.')
    print(segs)
    demo = f"{segs[len(segs)-2]}.demo.txt"
    f2 = open(demo, mode='w', encoding='utf-8')
    for line in f:
        if re.match(reg, line):
            continue
        f2.write(line)
    f.close()
    f2.close()
    os.remove(source)
    os.rename(demo, source)
