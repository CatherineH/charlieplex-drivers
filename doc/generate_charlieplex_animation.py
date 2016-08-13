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
    print(command)
    result = check_output(command, shell=True)
    remove(path.join(FOLDERNAME, filename))
    return Image.open(filename_png)

def diode_svg_frame():
    filename = "diode.svg"
    fh_svg_in = open("Symbol_LED.svg", "r")
    in_string = str(fh_svg_in.read())
    '''
    in_string = '<path fill="none" stroke="#000"' \
                ' d="m67,50-32-18v36zm36,0H4m63-18v36M46,25l18-18m7,7-18,18"/>' \
                '<path d="m57,9 10-5-5,10m2,2 10-5-5,10"/>'
    '''
    print(in_string)
    dwg = Drawing(filename, size=(600, 400))
    #dwg.add(dwg.svg(in_string))
    dwg.add(dwg.image.Image(filename))
    dwg.save()


if __name__ == "__main__":
    '''
    frames = []
    for i in range(0, 8):
        for j in range(0, 9):
            for k in range(0, 8):
                frames.append(generate_frame(i, j, k))
    '''
    diode_svg_frame()
    #writeGif(path.join(FOLDERNAME, "animation.gif"), frames, dither=0)