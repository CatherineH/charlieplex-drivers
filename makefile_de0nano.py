from subprocess import check_output, CalledProcessError, STDOUT, Popen, PIPE
from os import path, remove
from sys import platform as _platform
PROGRAM_NAME = 'charlieplex_driver'

foldername = path.dirname(path.realpath(__file__))
# makefile to compile, convert, and upload an altera FPGA image to a jtag
# device memory.
if _platform == "linux" or _platform == "linux2":
    altera_path = path.expanduser(
        "~/altera_lite/15.1/quartus/bin")
    run_shell = False
else:
    altera_path = "C:\\altera_lite\\15.1\quartus\\bin64"
    # windows requires running as shell
    run_shell = True


def check_for_errors(result, operation="upload"):
    result = str(result)
    if result.find("0 errors") < 0:
        print(operation+" error detected")
        lines = result.split("\\n")
        for line in lines:
            if line.find("rror") > 0:
                print(line)
        return False
    else:
        print("no error detected in "+operation)
        return True


def format_assembler_step(step='quartus_map'):
    return [path.join(altera_path, step), '--read_settings_files=on',
         '--write_settings_files=off', path.join(foldername, PROGRAM_NAME),
         '-c', PROGRAM_NAME]


def run_assembler_step(step='quartus_map'):
    parts = format_assembler_step(step)
    proc = Popen(parts, stdout=PIPE, stderr=PIPE, shell=run_shell)
    result, stderr = proc.communicate()
    check_for_errors(result, step)


def generate_from_template(template_filename='conversion_setup'
                                             '.cof.template', _parts={
    '$sof_filename$':path.join(foldername, 'output_files', PROGRAM_NAME+'.sof')}):
    template = open(path.join(foldername,
                              template_filename),
                    'r')
    contents = template.read()
    for key in _parts.keys():
        contents = contents.replace(key, _parts[key])
    _filename = path.join(foldername, template_filename.replace('.template',
                                                                ''))
    if path.isfile(_filename):
        remove(_filename)
    _file = open(_filename, 'w+')
    _file.write(contents)
    _file.close()
    return _filename

# make sure a jtag chain is plugged in
parts = [path.join(altera_path, 'quartus_pgm'), '-l']
result = check_output(parts, stderr=STDOUT, shell=run_shell)
if str(result).find("No JTAG hardware available") >= 0:
    print("Plug in jtag!")
    exit()

# first, trigger a new sof to be generated
# remove the existing sof file
'''
sof = path.join("")
remove()
'''

run_assembler_step('quartus_map')
run_assembler_step('quartus_fit')
run_assembler_step('quartus_asm')
#run_assembler_step('quartus_eda')

# next, convert the sof to a jic

# generate the sof file
while True:
    cof_filename = generate_from_template(template_filename='conversion_setup'
                                                 '.cof.template', _parts={
        '$sof_filename$':path.join(foldername, 'output_files', PROGRAM_NAME+'.sof')})
    parts = [path.join(altera_path, 'quartus_cpf'), '-c', cof_filename]
    try:
        result = check_output(parts, shell=run_shell)
    except CalledProcessError as e:
        result = "error"
        print("Ran into problem on command:")
        print(" ".join(parts))
    converted = check_for_errors(result, "convert")
    if converted:
        break

# finally, upload the jic

while True:
    cdf_filename = generate_from_template(
        template_filename='target_memory.cdf.template', _parts={
        '$db_foldername$':path.join(foldername, 'db')+"/"})
    # this assumes that the usb jtag chain is device 1
    parts = [path.join(altera_path, 'quartus_pgm'), '-c', '1', cdf_filename]
    try:
        result = check_output(parts, shell=run_shell)
    except CalledProcessError as e:
        # if the upload fails more than once, delete the jic file and try again
        result = "error"
        print("Ran into problem on command:")
        print(" ".join(parts))
        print("error: "+str(e))
        if _platform == "linux" or _platform == "linux2":
            print("did you add the udev rules to your system? ")
    programmed = check_for_errors(result, "upload")
    if programmed:
        break

# remember to reset the device!