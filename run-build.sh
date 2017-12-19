#!/bin/bash

PATH=node_modules/.bin:$PATH

yarn

gulp $1
