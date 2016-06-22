from PIL import Image
from os import path
# formats a 9*16 sized image into a hex string representing the image that can be
# copied into the verilog
foldername = path.dirname(path.realpath(__file__))
filename = "sample_images/pi.jpg"
#filename = "sample_images/gradient.png"
#filename = "sample_images/jeu4.png"
im = Image.open(path.join(foldername, filename)).convert('LA')


screen_array = []
# Each hex value is 4 bits wide
# there are 2 hex values per pixel
# there are 9 columns
# there are 16 rows
hex_width = 4*2*9*16

screen_str = str(hex_width)+'\'h'

for i in range(0, 16, 1):
    screen_array.append([])
    for j in range(0, 9):
        hex_val = hex(int(im.getpixel((j, i))[0]))
        # hex values are formatted as 0xff, unless they are < f. Therefore, the second
        #  and third characters are required when > f, and the second character (
        # spacing the first as 0)
        if len(hex_val)>3:
            screen_str += hex_val[2]
            screen_str += hex_val[3]
        else:
            screen_str += '0'
            screen_str += hex_val[2]

print(screen_str)