#!/bin/bash
git filter-branch -f --env-filter '
    export GIT_AUTHOR_NAME="Equipe GovTech"
    export GIT_AUTHOR_EMAIL="dev@govtech.com.br"
    export GIT_COMMITTER_NAME="Equipe GovTech"
    export GIT_COMMITTER_EMAIL="dev@govtech.com.br"
' HEAD
