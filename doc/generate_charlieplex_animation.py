from itertools import chain

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


def convert(pixel_width=300, filename="output.csv"):
    # convert the file to a png by making a call to inkscape
    filename_png = filename.replace("svg", "png")
    command = INKSCAPE_PATH+" -z -f "+path.join(FOLDERNAME, filename)\
              +" -w "+ str(pixel_width)+" -j -e "+path.join(FOLDERNAME,
                                                            filename_png)
    print(command)
    result = check_output(command, shell=True)
    #remove(path.join(FOLDERNAME, filename))
    return Image.open(filename_png)


def generate_frame(i, j, k):
    filename = str(i)+str(j)+str(k)+".svg"
    dwg = Drawing(filename, size=(300, 300))
    dwg.add(dwg.text('i = %d, j = %d, k %d' % (i, j, k), insert=(0.5, 20),
                     fill='red'))
    dwg.add(dwg.line((0, 0), (10, 0), stroke=rgb(10, 10, 16, '%')))
    dwg.save()
    pixel_width = 300
    return convert(pixel_width, filename)


def transform_point(point, scale, pos):
    output = []
    for i in range(len(point)):
        output.append(point[i]*scale[i]+pos[i])
    return output

def make_junction_line(dwg_handle, line_points, junction_radius, line_fill):

    elements = []
    for point in line_points:
        elements.append(dwg_handle.circle(center=point,
                                         r=junction_radius,
                                         fill=line_fill))
    if len(line_points) > 0:
        elements.append(dwg_handle.polyline(points=line_points,
                         fill="none", stroke=line_fill))
    return elements


def diode_svg_frame():
    filename = "diode.svg"
    led_symbol = "resources/Symbol_LED.svg"
    image_width = 600
    image_height = 400
    right_margin = 50
    dwg = Drawing(filename, size=(image_width+right_margin, image_height),
                  style="background-color:white")
    # create a white background rectangle
    dwg.add(dwg.rect(size=(image_width+right_margin, image_height),
                     insert=(0, 0), fill="white"))
    num_across = 9
    num_down = 8
    illuminated = [2, 3]
    LED_dimensions = [106.0, 71.0]
    LED_points = [[35, 68], [35, 31], [66, 50]]
    LED_entries = [[4, 50], [103, 50]]
    aspect_ratio = LED_dimensions[1]/LED_dimensions[0]
    new_width = image_width/num_across
    new_height = new_width*aspect_ratio
    LED_scale = 0.5
    LED_offsets = [new_width*LED_scale/2, new_height*LED_scale]
    junction_radius = 2.5
    elements = []
    for i in range(0, num_across):
        x_pos = new_width*(num_across-i-1)
        if i == illuminated[1]:
            connection = "+"
            text_fill = "red"
        elif i == illuminated[0]:
            connection = "-"
            text_fill = "black"
        else:
            connection = "NC"
            text_fill = "gray"
        wire_label = "{} {}".format(i+1, connection)
        # the input wire title
        dwg.add(dwg.text(wire_label, insert=(x_pos+new_width-10, 10),
                             fill=text_fill))
        for j in range(0, num_down):
            y_pos = (image_height/num_down)*j
            position = [x_pos+LED_offsets[0], y_pos+LED_offsets[1]]
            scale = [LED_scale*new_width/LED_dimensions[0],
                     LED_scale*new_height/LED_dimensions[1]]
            # the led svg
            dwg.add(dwg.image(led_symbol, insert=position,
                              size=(new_width*LED_scale, new_height*LED_scale)))
            if i == illuminated[0] and j == illuminated[1]:
                points = []
                for point in LED_points:
                    points.append(transform_point(point, scale, position))
                # the illuminated svg box
                dwg.add(dwg.polygon(points=points, fill="yellow"))
                line_fill = "green"
                insert_pos = -1
            else:
                line_fill = "black"
                insert_pos = 0
            # for each LED, we want to generate a line going from the input
            # to its output

            entry_point = transform_point(LED_entries[0], scale, position)
            if i!=j:
                incoming_line_points = [[new_width*(num_across-j)-LED_offsets[0], 0],
                                    [new_width*(num_across-j)-LED_offsets[0], y_pos+20],
                                    [entry_point[0], y_pos+20], entry_point]
            else:
                incoming_line_points = []
            elements.insert(insert_pos,
                            make_junction_line(dwg, incoming_line_points,
                                               junction_radius, line_fill))
            # outgoing line
            exit_point = transform_point(LED_entries[1], scale, position)
            outgoing_line_points = [exit_point,
                                    [x_pos+new_width-LED_offsets[0],
                                     exit_point[1]],
                                    [x_pos+new_width-LED_offsets[0], 0]]
            elements.insert(insert_pos,
                            make_junction_line(dwg, outgoing_line_points,
                                               junction_radius, line_fill))
    # flatten the elements structure
    elements = sum(elements, [])
    print(elements)
    # the lines should be drawn last so that they are layered on top of all
    # other elements
    for element in elements:
        dwg.add(element)
    dwg.save()
    return convert(image_width, filename)


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