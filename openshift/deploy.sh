#!/usr/bin/env bash
set -euo pipefail

PROJECT="${1:-frucek-dev}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

oc project "$PROJECT"

echo "Applying configuration and storage..."
oc apply -f "$ROOT/openshift/02-config-storage.yaml"

echo "Applying workloads..."
oc apply -f "$ROOT/openshift/03-workloads.yaml"

echo "Waiting for core workloads..."
for d in game-catalog-db activemq game-catalog-service borrowing-service user-management-service web-bff mobile-bff shell catalog-mf borrowing-mf user-management-mf; do
  echo "--- $d ---"
  oc rollout status "deployment/$d" --timeout=180s || true
done

echo
echo "Creating the public shell route..."
if ! oc get route shell >/dev/null 2>&1; then
  oc create route edge shell --service=shell --port=8080
fi

HOST="$(oc get route shell -o jsonpath='{.spec.host}')"
echo "Application host: https://$HOST"

create_path_route() {
  local name="$1"
  local service="$2"
  local port="$3"
  local path="$4"

  if oc get route "$name" >/dev/null 2>&1; then
    oc delete route "$name"
  fi

  oc create route edge "$name" \
    --service="$service" \
    --port="$port" \
    --hostname="$HOST" \
    --path="$path"
}

create_path_route catalog-mf catalog-mf 8080 /catalog
create_path_route borrowing-mf borrowing-mf 8080 /borrowing
create_path_route user-management-mf user-management-mf 8080 /users
create_path_route mobile-bff mobile-bff 4001 /mobile

echo
echo "Routes:"
oc get route

echo
echo "Topology:"
oc get deploy,pods,svc,route,pvc,hpa
