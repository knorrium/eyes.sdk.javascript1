#!/bin/bash

# Abort on Error
set -e;

# remove the DISPLAY variable
unset DISPLAY

# Run module tests
mvn test -e -X;