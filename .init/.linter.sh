#!/bin/bash
cd /home/kavia/workspace/code-generation/noteorganizer-90354-a834023b/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

