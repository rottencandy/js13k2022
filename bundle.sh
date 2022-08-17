#!/bin/bash

mkdir -p zip
rm zip/*

echo Creating new zip...
zip -j -9 zip/game app/*
# ect -zip -9 app/*
# mv app/app.zip zip/game.zip
echo Finished.

USED=$(stat --format="%s" zip/game.zip)
echo "Zip size:  $USED bytes"
echo "Limit:     13,312 bytes"
echo "Remaining: $((13312 - $USED))"
