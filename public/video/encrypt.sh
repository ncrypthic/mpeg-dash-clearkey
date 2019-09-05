#!/bin/bash
MP4FRAGMENT=`which mp4fragment`
MP4DASH=`which mp4dash`
EXECDIR="$(dirname $MP4DASH)/$(readlink $MP4DASH)"
INPUT=$1
OUTPUT=$2
WIDEVINE_HEADER=provider:intertrust#content_id:2a
PLAYREADY_LA_URL=https://pr.service.expressplay.com/playready/RightsManager.asmx
INPUT_FILENAME="${INPUT//.*/}"
EXTENSION="${INPUT//$INPUT_FILENAME/}"
FRAGMENTED_FILENAME="${INPUT_FILENAME}_fragmented$EXTENSION"
HELP="Usage: $0 <input_file> <output_dir>"

if [ -z $INPUT ]; then
    echo $HELP
    exit 0
elif [ -z $OUTPUT ]; then
    echo $HELP
    exit 0
fi

echo "Fragmenting $INPUT to $FRAGMENTED_FILENAME"
$MP4FRAGMENT $INPUT $FRAGMENTED_FILENAME
echo "Encrypting mp4 and creating DASH manifest"
$MP4DASH --exec-dir=$EXECDIR --encryption-key=$KID:$KEY --widevine-header=$WIDEVINE_HEADER --playready-header=LA_URL:$PLAYREADY_LA_URL $FRAGMENTED_FILENAME -o $OUTPUT
