#!/bin/bash

# Abort on Error
set -e;

# Run module tests
mvn test -e -X;