from __future__ import print_function

import os
import re
import subprocess

from scipy.optimize import minimize


def error_func(x0):

    perplexity = str(x0[0])

    script_dir = os.getcwd()
    pattern = 'error is +(-?[0-9]+\.[0-9]+)'
    regex = re.compile(pattern)

    cmd = ["python",
           os.path.join(script_dir, 'main.py'),
           '-i', os.path.join(script_dir, 'vision_api_1000.json'),
           '-o', os.path.join(script_dir, 'out1000.json'),
           '-p', perplexity]

    print(' '.join(cmd))

    p = subprocess.Popen(cmd,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.PIPE)

    out, err = p.communicate()
    output = out + err
    output = output.split('\n')
    error = -1
    for line in output:
        matched = regex.search(line)
        if matched:
            error = float(matched.group(1))
    print(error)
    return error

x0 = [50]
minimize(error_func, x0=x0, method='Nelder-Mead')
