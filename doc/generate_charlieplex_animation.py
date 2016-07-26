from svgwrite import Drawing, rgb
from subprocess import check_output
from os import path, remove
from sys import platform as _platform
from images2gif import writeGif
from PIL import Image

'''
This script requires inkscape to convert the svg to png, and imagemagick
'''
FOLDERNAME = path.dirname(path.realpath(__file__))
if _platform == "linux" or _platform == "linux2":
    INKSCAPE_PATH = "inkscape"
    run_shell = False
else:
    INKSCAPE_PATH = "C:\Program Files\Inkscape\inkscape"
    # windows requires running as shell
    run_shell = True


def generate_frame(i, j, k):
    filename = str(i)+str(j)+str(k)+".svg"
    dwg = Drawing(filename, size=(300, 300))
    dwg.add(dwg.text('i = %d, j = %d, k %d' % (i, j, k), insert=(0.5, 20), fill='red'))
    dwg.add(dwg.line((0, 0), (10, 0), stroke=rgb(10, 10, 16, '%')))
    dwg.save()
    # convert the file to a png by making a call to inkscape
    pixel_width = 300
    filename_png = filename.replace("svg", "png")
    command = INKSCAPE_PATH+" -z -f "+path.join(FOLDERNAME, filename)\
              +" -w "+ str(pixel_width)+" -j -e "+path.join(FOLDERNAME, filename_png)
    result = check_output(command)
    remove(path.join(FOLDERNAME, filename))
    return Image.open(filename_png)


if __name__ == "__main__":
    frames = []
    for i in range(0, 8):
        for j in range(0, 9):
            for k in range(0, 8):
                frames.append(generate_frame(i, j, k))

    writeGif(path.join(FOLDERNAME, "animation.gif"), frames, dither=0)
