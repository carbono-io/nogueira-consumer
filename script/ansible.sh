#!/bin/bash

cd ops
ansible-playbook main.yml \
    --extra-vars "marathon_url=$1 marathon_app_id=$2 route=$3 filename=$4"