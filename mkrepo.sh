#!/bin/bash

git init

gh repo create hacklahoma24 --private -d "Hacklahoma 2024 Repository" -s "."
gh api --method=PUT 'repos/fire833/hacklahoma24/collaborators/Koy-Wilson'
gh api --method=PUT 'repos/fire833/hacklahoma24/collaborators/matthewCmatt'
gh api --method=PUT 'repos/fire833/hacklahoma24/collaborators/DaylonC'

npm create vite@latest hacklahoma24

