import sys

from tqdm import tqdm as tqdm_original

from django.core.management.base import BaseCommand
from django.core.management.color import color_style

class tqdm(tqdm_original):
    def __init__(self, *args, **kwargs):
        self.isatty = sys.stdout.isatty()
        kwargs['disable'] = not self.isatty
        super(tqdm, self).__init__(*args, **kwargs)

    def print_(self, text, error=False):
        text = unicode(text)
        if error:
            text = color_style().ERROR(text)
        if self.isatty:
            output = self
        else:
            command = BaseCommand()
            if error:
                output = command.stderr
            else:
                output = command.stdout
        output.write(text)

    def error(self, text):
        self.print_(text, True)

    def info(self, text):
        self.print_(text)